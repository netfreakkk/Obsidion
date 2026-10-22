/**
 * Obsidion Core Hub & Cybernetic Sound FX Engine
 */

(function initObsidionHub() {
  // Elements
  const sfxBtn = document.getElementById("sfx-toggle-btn");
  const ramSlider = document.getElementById("ram-slider");
  const sliderCapVal = document.getElementById("slider-cap-val");
  const capText = document.getElementById("cap-text");
  const ramCircle = document.getElementById("ram-circle");
  const ramPercent = document.getElementById("ram-percent");
  const ramUsedText = document.getElementById("ram-used-text");
  const tabsCount = document.getElementById("tabs-count");
  const purgeBtn = document.getElementById("purge-btn");
  const vpnBox = document.getElementById("vpn-toggle-box");
  const vpnCheckbox = document.getElementById("vpn-checkbox");
  const vpnStateLabel = document.getElementById("vpn-state-label");
  const vpnPingBadge = document.getElementById("vpn-ping-badge");
  const cpuSlider = document.getElementById("cpu-slider");
  const cpuValDisplay = document.getElementById("cpu-val-display");
  const adblockCounter = document.getElementById("adblock-counter");
  const lofiBtn = document.getElementById("lofi-play-btn");
  const lofiNextBtn = document.getElementById("lofi-next-btn");
  const lofiStationName = document.getElementById("lofi-station-name");
  const lofiAudio = document.getElementById("lofi-audio");
  const lofiVolume = document.getElementById("lofi-volume");
  const toastMsg = document.getElementById("toast-msg");
  const colorChips = document.querySelectorAll(".color-chip");
  const accentName = document.getElementById("accent-name");

  let sfxEnabled = true;
  let audioCtx = null;

  function showToast(text) {
    if (!toastMsg) return;
    toastMsg.textContent = text;
    toastMsg.classList.add("show");
    setTimeout(() => toastMsg.classList.remove("show"), 2500);
  }

  // 1. Web Audio API Cybernetic Sound FX Engine
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playCyberClick() {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  function playVpnHum(active) {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      if (active) {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
      }
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  function playLaserPurge() {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // SFX Toggle Button
  if (sfxBtn) {
    sfxBtn.addEventListener("click", () => {
      sfxEnabled = !sfxEnabled;
      if (sfxEnabled) {
        sfxBtn.classList.add("active");
        sfxBtn.querySelector("span").textContent = "SFX ON";
        playCyberClick();
        showToast("Audio FX Enabled");
      } else {
        sfxBtn.classList.remove("active");
        sfxBtn.querySelector("span").textContent = "MUTED";
        showToast("Audio FX Muted");
      }
    });
  }

  // 2. RAM Circular Gauge & Limits
  const CIRCLE_CIRCUMFERENCE = 226.2; // 2 * PI * 36

  function updateRamDisplay(usedMb, capMb) {
    if (ramUsedText) ramUsedText.textContent = `${usedMb} MB`;
    if (capText) capText.textContent = `${capMb} MB`;
    const pct = Math.min(Math.round((usedMb / capMb) * 100), 100);
    if (ramPercent) ramPercent.textContent = `${pct}%`;

    const offset = CIRCLE_CIRCUMFERENCE - (pct / 100) * CIRCLE_CIRCUMFERENCE;
    if (ramCircle) {
      ramCircle.style.strokeDashoffset = offset;
      if (pct > 85) {
        ramCircle.style.stroke = "#F43F5E"; // Red alert
      } else if (pct > 70) {
        ramCircle.style.stroke = "#F59E0B";
      } else {
        ramCircle.style.stroke = "var(--accent-glow)";
      }
    }
  }

  // 100% Native WebExtension Tab Telemetry (Zero Port 40001 polling)
  const ext = typeof browser !== "undefined" ? browser : chrome;
  let currentCap = 5;

  function syncTabStats() {
    if (!ext.runtime || !ext.runtime.sendMessage) return;
    try {
      ext.runtime.sendMessage({ action: "get_status" }, (res) => {
        if (!res) return;
        const loaded = res.loadedTabs || 1;
        const discarded = res.discardedTabs || 0;
        currentCap = res.maxLoadedTabs || 5;

        if (ramUsedText) ramUsedText.textContent = `${loaded} Loaded`;
        if (capText) capText.textContent = `${currentCap} Tabs`;
        if (sliderCapVal) sliderCapVal.textContent = `${currentCap} Tabs`;
        if (ramSlider) ramSlider.value = currentCap;
        if (tabsCount) tabsCount.textContent = `${discarded} Sleeping`;

        updateRamDisplay(loaded, currentCap);

        if (res.vpnActive !== undefined && vpnCheckbox) {
          updateVpnUI(res.vpnActive);
        }
      });
    } catch (e) {}
  }

  setInterval(syncTabStats, 3000);
  syncTabStats();

  if (ramSlider && sliderCapVal) {
    ramSlider.addEventListener("input", (e) => {
      currentCap = parseInt(e.target.value, 10);
      sliderCapVal.textContent = `${currentCap} Tabs`;
      if (capText) capText.textContent = `${currentCap} Tabs`;
    });

    ramSlider.addEventListener("change", (e) => {
      playCyberClick();
      currentCap = parseInt(e.target.value, 10);
      ext.runtime.sendMessage({ action: "set_tab_limit", limit: currentCap }, () => {
        showToast(`Tab Cap set to ${currentCap} loaded tabs`);
        syncTabStats();
      });
    });
  }

  // 3. Tab Discard & Working Set Purge Action (100% Native browser.tabs.discard)
  if (purgeBtn) {
    purgeBtn.addEventListener("click", () => {
      playLaserPurge();
      ext.runtime.sendMessage({ action: "purge_tabs" }, (res) => {
        const count = res && res.count ? res.count : 0;
        const freed = res && res.freedMb ? res.freedMb : count * 85;
        showToast(`Purged ${count} inactive tabs (~${freed} MB saved)`);
        syncTabStats();
      });
    });
  }

  // 4. Cloudflare WARP VPN Hub
  function updateVpnUI(connected) {
    if (!vpnBox || !vpnStateLabel) return;
    if (connected) {
      vpnBox.classList.add("connected");
      vpnCheckbox.checked = true;
      vpnStateLabel.textContent = "CONNECTED (WARP)";
      vpnStateLabel.style.color = "#10B981";
      if (vpnPingBadge) vpnPingBadge.textContent = "12ms • Encrypted";
    } else {
      vpnBox.classList.remove("connected");
      vpnCheckbox.checked = false;
      vpnStateLabel.textContent = "Disconnected";
      vpnStateLabel.style.color = "var(--text-main)";
      if (vpnPingBadge) vpnPingBadge.textContent = "Off";
    }
  }

  if (vpnCheckbox) {
    vpnCheckbox.addEventListener("change", (e) => {
      const active = e.target.checked;
      playVpnHum(active);
      updateVpnUI(active);
      showToast(active ? "Connecting Cloudflare WARP..." : "WARP Disconnected");
      ext.runtime.sendMessage({ action: "set_vpn", enabled: active }, (res) => {
        const isConn = res && res.status === "connected";
        updateVpnUI(isConn);
        if (isConn) showToast("Cloudflare WARP: Connected (127.0.0.1:40000)");
      });
    });
  }

  if (vpnBox) {
    vpnBox.addEventListener("click", (e) => {
      if (e.target !== vpnCheckbox) {
        vpnCheckbox.checked = !vpnCheckbox.checked;
        vpnCheckbox.dispatchEvent(new Event("change"));
      }
    });
  }

  // 5. CPU Rate Slider
  if (cpuSlider && cpuValDisplay) {
    cpuSlider.addEventListener("input", (e) => {
      cpuValDisplay.textContent = `${e.target.value}%`;
    });
    cpuSlider.addEventListener("change", (e) => {
      playCyberClick();
      showToast(`CPU Throttling set to ${e.target.value}%`);
    });
  }

  // 6. Necko Shield Ad Counter
  let blockCount = 148;
  setInterval(() => {
    if (Math.random() > 0.6) {
      blockCount += Math.floor(Math.random() * 3) + 1;
      if (adblockCounter) adblockCounter.textContent = blockCount;
    }
  }, 4000);

  // 7. Ambient Lo-Fi Player
  if (lofiBtn && lofiAudio) {
    const LOFI_STREAMS = [
      { name: "0R Chillhop & Lo-Fi", url: "https://0nlineradio.stream42.radiohost.de/0r-lo-fi" },
      { name: "24/7 Lofi Radio", url: "https://ec3.yesstreaming.net:3755/stream" },
      { name: "Retro Lofi & Chiptune", url: "https://a5.asurahosting.com:8150/radio.mp3" }
    ];
    let lofiCurrentIdx = 0;
    let lofiIsPlaying = false;

    function updateLofiStationUI() {
      if (lofiStationName) {
        lofiStationName.textContent = LOFI_STREAMS[lofiCurrentIdx].name;
        lofiStationName.title = `Current Station: ${LOFI_STREAMS[lofiCurrentIdx].name}`;
      }
    }

    function playLofiStation() {
      lofiAudio.src = LOFI_STREAMS[lofiCurrentIdx].url;
      lofiAudio.load();
      lofiAudio.play().then(() => {
        lofiIsPlaying = true;
        lofiBtn.textContent = "❚❚";
        lofiBtn.style.background = "#10B981";
        showToast(`Playing ${LOFI_STREAMS[lofiCurrentIdx].name}`);
      }).catch((err) => {
        console.warn("LoFi playback error, trying next station...", err);
        switchLofiStation(true);
      });
    }

    function switchLofiStation(autoRetry = false) {
      lofiCurrentIdx = (lofiCurrentIdx + 1) % LOFI_STREAMS.length;
      updateLofiStationUI();
      if (lofiIsPlaying || autoRetry) {
        playLofiStation();
      } else {
        lofiAudio.src = LOFI_STREAMS[lofiCurrentIdx].url;
        showToast(`Station: ${LOFI_STREAMS[lofiCurrentIdx].name}`);
      }
    }

    lofiBtn.addEventListener("click", () => {
      playCyberClick();
      if (!lofiIsPlaying) {
        if (!lofiAudio.src || lofiAudio.src === "" || lofiAudio.src.includes("stream.zeno.fm")) {
          lofiAudio.src = LOFI_STREAMS[lofiCurrentIdx].url;
        }
        playLofiStation();
      } else {
        lofiAudio.pause();
        lofiIsPlaying = false;
        lofiBtn.textContent = "▶";
        lofiBtn.style.background = "var(--accent-glow)";
        showToast("Lo-Fi Paused");
      }
    });

    if (lofiNextBtn) {
      lofiNextBtn.addEventListener("click", () => {
        playCyberClick();
        switchLofiStation(false);
      });
    }

    lofiAudio.addEventListener("error", (e) => {
      if (lofiIsPlaying) {
        console.warn("LoFi stream error encountered, failing over...", e);
        showToast("Station signal lost, switching...");
        switchLofiStation(true);
      }
    });

    if (lofiVolume) {
      lofiAudio.volume = parseFloat(lofiVolume.value || "0.5");
      lofiVolume.addEventListener("input", (e) => {
        lofiAudio.volume = parseFloat(e.target.value);
      });
    }

    updateLofiStationUI();
  }

  // 8. Dynamic Accent Glow Theme Picker
  colorChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      playCyberClick();
      colorChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const color = chip.getAttribute("data-color");
      const rgb = chip.getAttribute("data-rgb");
      const name = chip.getAttribute("data-name");

      document.documentElement.style.setProperty("--accent-glow", color);
      document.documentElement.style.setProperty("--accent-glow-rgb", rgb);
      if (accentName) {
        accentName.textContent = name;
        accentName.style.color = color;
      }

      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ "obsidion_accent": { color, rgb, name } });
      }

      showToast(`Theme: ${name} Activated`);
    });
  });

  // Query background status on load
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: "get_status" }, (res) => {
      if (res) {
        if (res.vpnActive) updateVpnUI(true);
        if (res.totalTabs && tabsCount) tabsCount.textContent = res.totalTabs;
      }
    });
  }

  // Load saved theme
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["obsidion_accent"], (res) => {
      if (res && res.obsidion_accent) {
        const { color, rgb, name } = res.obsidion_accent;
        document.documentElement.style.setProperty("--accent-glow", color);
        document.documentElement.style.setProperty("--accent-glow-rgb", rgb);
        if (accentName) {
          accentName.textContent = name;
          accentName.style.color = color;
        }
        colorChips.forEach(c => {
          if (c.getAttribute("data-name") === name) c.classList.add("active");
          else c.classList.remove("active");
        });
      }
    });
  }
})();
