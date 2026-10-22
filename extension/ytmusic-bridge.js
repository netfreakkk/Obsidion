/**
 * Obsidion YouTube Music Bridge Content Script
 * Injected into music.youtube.com to enable two-way sync
 * with the Obsidion Core Mini Player.
 */

(function initYTMusicBridge() {
  const ext = typeof browser !== "undefined" ? browser : chrome;

  function getPlayerInfo() {
    const video = document.querySelector('video');
    const titleEl = document.querySelector('yt-formatted-string.title') || 
                    document.querySelector('.title.ytmusic-player-bar') ||
                    document.querySelector('ytmusic-player-bar .title');
    const bylineEl = document.querySelector('.byline.ytmusic-player-bar') ||
                     document.querySelector('ytmusic-player-bar .byline');
    const thumbEl = document.querySelector('img.image.ytmusic-player-bar') ||
                    document.querySelector('.thumbnail-image-wrapper img') ||
                    document.querySelector('#thumbnail img');

    const title = titleEl ? (titleEl.title || titleEl.textContent || "").trim() : "";
    const artist = bylineEl ? (bylineEl.title || bylineEl.textContent || "").trim() : "";
    let thumbnail = thumbEl ? thumbEl.src : "";
    if (thumbnail && thumbnail.startsWith("blob:")) {
      thumbnail = "";
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

  function sendStatus() {
    try {
      const info = getPlayerInfo();
      ext.runtime.sendMessage({
        action: "ytm_status_update",
        data: info
      });
    } catch (e) {}
  }

  // Periodic heartbeat every 1.5s
  setInterval(sendStatus, 1500);

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
      }
      setTimeout(sendStatus, 150);
      sendResponse({ status: "ok", info: getPlayerInfo() });
    } else if (req.action === "ytm_get_info") {
      sendResponse({ status: "ok", info: getPlayerInfo() });
    }
  });

  // Initial announcement
  setTimeout(sendStatus, 1000);
})();
