/**
 * Obsidion YouTube Music Bridge Content Script
 * Injected into music.youtube.com to enable instantaneous two-way sync
 * with the Obsidion Core Mini Player.
 */

(function initYTMusicBridge() {
  const ext = typeof browser !== "undefined" ? browser : chrome;

  function getPlayerInfo() {
    const video = document.querySelector('video');
    let title = "";
    let artist = "";
    let thumbnail = "";

    // 1. Instantaneous MediaSession API (Zero-Lag updates)
    if (navigator.mediaSession && navigator.mediaSession.metadata) {
      const meta = navigator.mediaSession.metadata;
      if (meta.title) title = meta.title;
      if (meta.artist) artist = meta.artist;
      if (meta.artwork && meta.artwork.length > 0) {
        thumbnail = meta.artwork[meta.artwork.length - 1].src;
      }
    }

    // 2. DOM Fallbacks if MediaSession not yet primed
    if (!title) {
      const titleEl = document.querySelector('yt-formatted-string.title') || 
                      document.querySelector('.title.ytmusic-player-bar') ||
                      document.querySelector('ytmusic-player-bar .title');
      if (titleEl) title = (titleEl.title || titleEl.textContent || "").trim();
    }
    if (!artist) {
      const bylineEl = document.querySelector('.byline.ytmusic-player-bar') ||
                       document.querySelector('ytmusic-player-bar .byline');
      if (bylineEl) artist = (bylineEl.title || bylineEl.textContent || "").trim();
    }
    if (!thumbnail) {
      const thumbEl = document.querySelector('img.image.ytmusic-player-bar') ||
                      document.querySelector('.thumbnail-image-wrapper img') ||
                      document.querySelector('#thumbnail img');
      if (thumbEl && thumbEl.src && !thumbEl.src.startsWith("blob:")) {
        thumbnail = thumbEl.src;
      }
    }

    const isPlaying = video ? !video.paused : false;
    const volume = video ? Math.round(video.volume * 100) : 100;
    const currentTime = video ? Math.round(video.currentTime) : 0;
    const duration = video && !isNaN(video.duration) ? Math.round(video.duration) : 0;

    return {
      hasTab: true,
      isPlaying: isPlaying,
      title: title || (video ? "Playing on YouTube Music" : "Ready to Play"),
      artist: artist || "YouTube Music",
      thumbnail: thumbnail,
      volume: volume,
      currentTime: currentTime,
      duration: duration
    };
  }

  let lastSentJson = "";
  function sendStatus() {
    try {
      const info = getPlayerInfo();
      const json = JSON.stringify(info);
      if (json === lastSentJson) return; // avoid duplicate message spam
      lastSentJson = json;
      ext.runtime.sendMessage({
        action: "ytm_status_update",
        data: info
      }).catch(() => {});
    } catch (e) {}
  }

  // Periodic heartbeat every 1000ms
  setInterval(sendStatus, 1000);

  // Hook video events for immediate playback state sync
  function hookVideoEvents() {
    const video = document.querySelector('video');
    if (video && !video.__obsidion_hooked) {
      video.__obsidion_hooked = true;
      video.addEventListener('play', sendStatus);
      video.addEventListener('pause', sendStatus);
      video.addEventListener('loadeddata', sendStatus);
      video.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (!video.__lastTimeUpdate || now - video.__lastTimeUpdate > 750) {
          video.__lastTimeUpdate = now;
          sendStatus();
        }
      });
    }
  }
  setInterval(hookVideoEvents, 2000);
  hookVideoEvents();

  // MutationObserver on player bar for instant DOM metadata updates
  try {
    const playerBar = document.querySelector('ytmusic-player-bar') || document.body;
    const observer = new MutationObserver(() => {
      sendStatus();
    });
    observer.observe(playerBar, { attributes: true, childList: true, subtree: true, attributeFilter: ['src', 'title'] });
  } catch (e) {}

  // Listen for control commands from background / newtab
  ext.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "ytm_cmd") {
      const video = document.querySelector('video');
      if (req.command === "play_pause") {
        const playBtn = document.querySelector('#play-pause-button') ||
                        document.querySelector('ytmusic-player-bar #play-pause-button') ||
                        document.querySelector('[aria-label="Play"]') ||
                        document.querySelector('[aria-label="Pause"]');
        if (playBtn) {
          playBtn.click();
        } else if (video) {
          if (video.paused) video.play();
          else video.pause();
        }
      } else if (req.command === "next") {
        const nextBtn = document.querySelector('.next-button') ||
                        document.querySelector('ytmusic-player-bar .next-button') ||
                        document.querySelector('[aria-label="Next song"]');
        if (nextBtn) nextBtn.click();
      } else if (req.command === "prev") {
        const prevBtn = document.querySelector('.previous-button') ||
                        document.querySelector('ytmusic-player-bar .previous-button') ||
                        document.querySelector('[aria-label="Previous song"]');
        if (prevBtn) prevBtn.click();
      } else if (req.command === "set_volume") {
        if (video) {
          const v = Math.max(0, Math.min(100, parseInt(req.volume, 10))) / 100;
          video.volume = v;
        }
      } else if (req.command === "seek") {
        if (video && req.time !== undefined) {
          const maxD = video.duration || 999999;
          const t = Math.max(0, Math.min(maxD, parseFloat(req.time)));
          video.currentTime = t;
        }
      }

      // Burst sync at 40ms, 120ms, 300ms, 600ms, 1000ms for zero-lag smooth UI
      [40, 120, 300, 600, 1000].forEach((delay) => {
        setTimeout(sendStatus, delay);
      });

      sendResponse({ status: "ok", info: getPlayerInfo() });
    } else if (req.action === "ytm_get_info") {
      sendResponse({ status: "ok", info: getPlayerInfo() });
    }
  });

  // Initial announcement
  setTimeout(sendStatus, 800);
})();
