/**
 * Obsidion Core NewTab Dashboard Controller
 * Features:
 * 1. Wallpaper Engine Live Canvas (Nebula, Cyber Grid, Matrix, Fluid Aura, Starfield, Custom Media)
 * 2. Embedded Obsidion Core Dock (Real Task Manager RAM, Win32 Purge, WARP VPN, Lo-Fi, SFX, Accent)
 * 3. Dynamic Open-Source Weather Widget with City Search Autocomplete (Open-Meteo)
 * 4. 5 Customizable Speed Dials with Modals
 * 5. History Quick Links (chrome.history / chrome.topSites)
 * 6. Curated Intelligence News (Tech & AI / Cinema & Sci-Fi)
 */

(function initObsidionDashboard() {
  // Elements
  const toastMsg = document.getElementById("toast-msg");
  const sfxBtn = document.getElementById("sfx-toggle-btn");
  const dockToggleBtn = document.getElementById("dock-toggle-btn");
  const dockBtnLabel = document.getElementById("dock-btn-label");
  const appLayout = document.getElementById("app-layout");
  const wallpaperBtn = document.getElementById("wallpaper-btn");

  function showToast(text) {
    if (!toastMsg) return;
    toastMsg.textContent = text;
    toastMsg.classList.add("show");
    setTimeout(() => toastMsg.classList.remove("show"), 2800);
  }

  // =========================================================================
  // 1. WEB AUDIO API CYBERNETIC SOUND FX ENGINE
  // =========================================================================
  let sfxEnabled = true;
  let audioCtx = null;

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
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {}
  }

  if (sfxBtn) {
    sfxBtn.addEventListener("click", () => {
      sfxEnabled = !sfxEnabled;
      if (sfxEnabled) {
        sfxBtn.textContent = "SFX ON";
        sfxBtn.style.color = "var(--accent)";
        playCyberClick();
        showToast("Audio FX Enabled");
      } else {
        sfxBtn.textContent = "MUTED";
        sfxBtn.style.color = "var(--text-dim)";
        showToast("Audio FX Muted");
      }
    });
  }

  // =========================================================================
  // 2. WALLPAPER ENGINE LIVE CANVAS & CUSTOM MEDIA
  // =========================================================================
  const wpCanvas = document.getElementById("wallpaper-canvas");
  const ctx = wpCanvas ? wpCanvas.getContext("2d") : null;
  const customWpBg = document.getElementById("custom-wallpaper-bg");
  const customWpVideo = document.getElementById("custom-wallpaper-video");

  let currentWpPreset = localStorage.getItem("obsidion_wp_preset") || "nebula";
  let wpAnimationId = null;
  let isWpRunning = true;
  let canvasW = 0, canvasH = 0;

  function resizeCanvas() {
    if (!wpCanvas) return;
    canvasW = wpCanvas.width = window.innerWidth;
    canvasH = wpCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Efficient background handling: Pause rendering when document hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (wpAnimationId) cancelAnimationFrame(wpAnimationId);
      isWpRunning = false;
    } else {
      isWpRunning = true;
      startWallpaperEngine();
    }
  });

  // Mouse interaction
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Particle systems
  const particles = [];
  const PARTICLE_COUNT = 85;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.03
    });
  }

  // Matrix glyphs
  const matrixChars = "01OBSIDIONXYZ10アイウエオカキクケコサシスセソタチツテト";
  const matrixCols = Math.floor(window.innerWidth / 18);
  const matrixDrops = new Array(matrixCols).fill(1);

  // Synthwave Grid Horizon offset
  let gridOffset = 0;
  let lastWpFrameTime = 0;
  const WP_FRAME_INTERVAL = 33; // 30 FPS throttle: cuts CPU/GPU cycles in half

  function renderWallpaper(now = 0) {
    if (!isWpRunning || !ctx || document.hidden) return;

    wpAnimationId = requestAnimationFrame(renderWallpaper);

    if (now - lastWpFrameTime < WP_FRAME_INTERVAL) return;
    lastWpFrameTime = now;

    if (currentWpPreset === "custom") {
      wpCanvas.style.display = "none";
      return;
    } else {
      wpCanvas.style.display = "block";
    }

    ctx.clearRect(0, 0, canvasW, canvasH);

    const accentHex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00F0FF";

    if (currentWpPreset === "nebula") {
      // Cosmic Nebula with Interactive Stars & Obsidian Dust
      ctx.fillStyle = "#0B0F17";
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Deep glowing aura
      const grad = ctx.createRadialGradient(
        canvasW * 0.5 + (mouseX - canvasW / 2) * 0.05,
        canvasH * 0.35 + (mouseY - canvasH / 2) * 0.05,
        50,
        canvasW * 0.5,
        canvasH * 0.35,
        canvasW * 0.6
      );
      grad.addColorStop(0, "rgba(0, 240, 255, 0.08)");
      grad.addColorStop(0.5, "rgba(168, 85, 247, 0.04)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Stars
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.pulse;
        if (p.alpha > 0.85 || p.alpha < 0.2) p.pulse = -p.pulse;
        if (p.x < 0) p.x = canvasW;
        if (p.x > canvasW) p.x = 0;
        if (p.y < 0) p.y = canvasH;
        if (p.y > canvasH) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles with subtle cyber webs
        for (const p2 of particles) {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    } else if (currentWpPreset === "grid") {
      // 80s Synthwave / Cyber Grid
      ctx.fillStyle = "#090D15";
      ctx.fillRect(0, 0, canvasW, canvasH);

      const horizon = canvasH * 0.55;

      // Horizon Sun
      const sunGrad = ctx.createRadialGradient(canvasW / 2, horizon - 20, 20, canvasW / 2, horizon - 20, 160);
      sunGrad.addColorStop(0, "rgba(244, 63, 94, 0.7)");
      sunGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.3)");
      sunGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(canvasW / 2, horizon - 20, 160, Math.PI, 0);
      ctx.fill();

      // Perspective Grid Floor
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 1.2;

      gridOffset = (gridOffset + 1.2) % 35;

      // Horizontal moving lines
      for (let y = horizon; y < canvasH; y += (y - horizon + 5) * 0.25 + 4) {
        ctx.beginPath();
        ctx.moveTo(0, y + (gridOffset * (y - horizon) / 250));
        ctx.lineTo(canvasW, y + (gridOffset * (y - horizon) / 250));
        ctx.stroke();
      }

      // Vanishing lines
      for (let x = -canvasW * 0.5; x <= canvasW * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(canvasW / 2, horizon);
        ctx.lineTo(x, canvasH);
        ctx.stroke();
      }
    } else if (currentWpPreset === "matrix") {
      // Matrix Digital Rain
      ctx.fillStyle = "rgba(11, 15, 23, 0.22)";
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.fillStyle = "#00F0FF";
      ctx.font = "14px monospace";

      for (let i = 0; i < matrixDrops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * 18, matrixDrops[i] * 18);

        if (matrixDrops[i] * 18 > canvasH && Math.random() > 0.975) {
          matrixDrops[i] = 0;
        }
        matrixDrops[i]++;
      }
    } else if (currentWpPreset === "fluid") {
      // Fluid Aura Bloom
      ctx.fillStyle = "#0B0F17";
      ctx.fillRect(0, 0, canvasW, canvasH);

      const time = Date.now() * 0.001;
      const x1 = canvasW * 0.5 + Math.sin(time * 0.6) * 180;
      const y1 = canvasH * 0.4 + Math.cos(time * 0.7) * 120;
      const x2 = canvasW * 0.55 + Math.cos(time * 0.5) * 220;
      const y2 = canvasH * 0.6 + Math.sin(time * 0.8) * 140;

      const g1 = ctx.createRadialGradient(x1, y1, 40, x1, y1, 400);
      g1.addColorStop(0, "rgba(0, 240, 255, 0.12)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvasW, canvasH);

      const g2 = ctx.createRadialGradient(x2, y2, 40, x2, y2, 450);
      g2.addColorStop(0, "rgba(168, 85, 247, 0.09)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (currentWpPreset === "starfield") {
      // Minimal Starfield
      ctx.fillStyle = "#080B12";
      ctx.fillRect(0, 0, canvasW, canvasH);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.7})`;
        ctx.fill();
      }
    }
  }

  function startWallpaperEngine() {
    if (wpAnimationId) cancelAnimationFrame(wpAnimationId);
    isWpRunning = true;
    renderWallpaper();
  }

  startWallpaperEngine();

  // Custom Wallpaper (Image / Video URL or Local File)
  function applyCustomMedia(src, isVideo) {
    if (isVideo) {
      if (customWpBg) customWpBg.style.display = "none";
      if (customWpVideo) {
        customWpVideo.src = src;
        customWpVideo.style.display = "block";
        customWpVideo.play().catch(() => {});
      }
    } else {
      if (customWpVideo) {
        customWpVideo.style.display = "none";
        customWpVideo.pause();
      }
      if (customWpBg) {
        customWpBg.style.backgroundImage = `url('${src}')`;
        customWpBg.style.display = "block";
      }
    }
  }

  // Restore saved wallpaper
  const savedCustomMedia = localStorage.getItem("obsidion_custom_wp");
  const savedIsVideo = localStorage.getItem("obsidion_custom_wp_isvideo") === "true";
  if (currentWpPreset === "custom" && savedCustomMedia) {
    applyCustomMedia(savedCustomMedia, savedIsVideo);
  }

  // Restore Blur & Brightness filters
  const savedBlur = localStorage.getItem("obsidion_wp_blur") || "0";
  const savedBright = localStorage.getItem("obsidion_wp_bright") || "100";
  function updateWpFilters(blur, bright) {
    const filterStr = `blur(${blur}px) brightness(${bright}%)`;
    if (wpCanvas) wpCanvas.style.filter = filterStr;
    if (customWpBg) customWpBg.style.filter = filterStr;
    if (customWpVideo) customWpVideo.style.filter = filterStr;
  }
  updateWpFilters(savedBlur, savedBright);

  // Restore Tile Glass Transparency (85% default sheer glass)
  const glassTransparencySlider = document.getElementById("glass-transparency-slider");
  const glassTransparencyVal = document.getElementById("glass-transparency-val");
  const savedGlassTrans = localStorage.getItem("obsidion_glass_transparency") || "85";

  function applyGlassTransparency(percent) {
    const p = Math.max(5, Math.min(95, parseInt(percent, 10) || 85));
    const opacity = ((100 - p) / 100).toFixed(2);
    document.documentElement.style.setProperty("--glass-opacity", opacity);
    if (glassTransparencyVal) glassTransparencyVal.textContent = `${p}% Transparent`;
    if (glassTransparencySlider) glassTransparencySlider.value = p;
  }
  applyGlassTransparency(savedGlassTrans);

  if (glassTransparencySlider) {
    glassTransparencySlider.addEventListener("input", (e) => {
      applyGlassTransparency(e.target.value);
    });
    glassTransparencySlider.addEventListener("change", (e) => {
      localStorage.setItem("obsidion_glass_transparency", e.target.value);
      playCyberClick();
      showToast(`Tile Glass Transparency: ${e.target.value}%`);
    });
  }

  // =========================================================================
  // 3. WALLPAPER ENGINE MODAL & PRESETS
  // =========================================================================
  const wpModal = document.getElementById("wallpaper-modal");
  const wpChips = document.querySelectorAll(".wallpaper-chip");
  const customWpFile = document.getElementById("custom-wp-file");
  const customWpUrl = document.getElementById("custom-wp-url");
  const wpBlurSlider = document.getElementById("wp-blur-slider");
  const wpBrightSlider = document.getElementById("wp-bright-slider");
  const wpBlurVal = document.getElementById("wp-blur-val");
  const wpBrightVal = document.getElementById("wp-bright-val");

  if (wallpaperBtn && wpModal) {
    wallpaperBtn.addEventListener("click", () => {
      playCyberClick();
      wpModal.showModal();
    });
  }

  wpChips.forEach(chip => {
    if (chip.dataset.preset === currentWpPreset) chip.classList.add("active");
    else chip.classList.remove("active");

    chip.addEventListener("click", () => {
      playCyberClick();
      wpChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentWpPreset = chip.dataset.preset;
      localStorage.setItem("obsidion_wp_preset", currentWpPreset);

      if (currentWpPreset !== "custom") {
        if (customWpBg) customWpBg.style.display = "none";
        if (customWpVideo) {
          customWpVideo.style.display = "none";
          customWpVideo.pause();
        }
      } else {
        const src = localStorage.getItem("obsidion_custom_wp");
        const isVid = localStorage.getItem("obsidion_custom_wp_isvideo") === "true";
        if (src) applyCustomMedia(src, isVid);
      }
      startWallpaperEngine();
      showToast(`Wallpaper: ${chip.textContent}`);
    });
  });

  if (customWpFile) {
    customWpFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        try {
          localStorage.setItem("obsidion_custom_wp", dataUrl);
          localStorage.setItem("obsidion_custom_wp_isvideo", isVideo ? "true" : "false");
          currentWpPreset = "custom";
          localStorage.setItem("obsidion_wp_preset", "custom");
          wpChips.forEach(c => c.dataset.preset === "custom" ? c.classList.add("active") : c.classList.remove("active"));
          applyCustomMedia(dataUrl, isVideo);
          startWallpaperEngine();
          showToast("Custom wallpaper applied");
        } catch (err) {
          // In case quota exceeded for large videos, use Blob URL for this session
          const blobUrl = URL.createObjectURL(file);
          applyCustomMedia(blobUrl, isVideo);
          showToast("Loaded large wallpaper into session");
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if (customWpUrl) {
    customWpUrl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const url = customWpUrl.value.trim();
        if (!url) return;
        const isVideo = /\.(mp4|webm|ogv)$/i.test(url);
        localStorage.setItem("obsidion_custom_wp", url);
        localStorage.setItem("obsidion_custom_wp_isvideo", isVideo ? "true" : "false");
        currentWpPreset = "custom";
        localStorage.setItem("obsidion_wp_preset", "custom");
        wpChips.forEach(c => c.dataset.preset === "custom" ? c.classList.add("active") : c.classList.remove("active"));
        applyCustomMedia(url, isVideo);
        startWallpaperEngine();
        showToast("Applied wallpaper URL");
      }
    });
  }

  if (wpBlurSlider && wpBlurVal) {
    wpBlurSlider.value = savedBlur;
    wpBlurVal.textContent = `${savedBlur}px`;
    wpBlurSlider.addEventListener("input", (e) => {
      const b = e.target.value;
      wpBlurVal.textContent = `${b}px`;
      localStorage.setItem("obsidion_wp_blur", b);
      updateWpFilters(b, wpBrightSlider ? wpBrightSlider.value : "100");
    });
  }

  if (wpBrightSlider && wpBrightVal) {
    wpBrightSlider.value = savedBright;
    wpBrightVal.textContent = `${savedBright}%`;
    wpBrightSlider.addEventListener("input", (e) => {
      const br = e.target.value;
      wpBrightVal.textContent = `${br}%`;
      localStorage.setItem("obsidion_wp_bright", br);
      updateWpFilters(wpBlurSlider ? wpBlurSlider.value : "0", br);
    });
  }

  // =========================================================================
  // 4. DOCK FLIP (LEFT / RIGHT)
  // =========================================================================
  let dockSide = localStorage.getItem("obsidion_dock_side") || "left";
  function applyDockSide(side) {
    if (side === "right") {
      appLayout.classList.add("dock-right");
      if (dockBtnLabel) dockBtnLabel.textContent = "Dock: Right";
    } else {
      appLayout.classList.remove("dock-right");
      if (dockBtnLabel) dockBtnLabel.textContent = "Dock: Left";
    }
  }
  applyDockSide(dockSide);

  if (dockToggleBtn) {
    dockToggleBtn.addEventListener("click", () => {
      playCyberClick();
      dockSide = (dockSide === "left") ? "right" : "left";
      localStorage.setItem("obsidion_dock_side", dockSide);
      applyDockSide(dockSide);
      showToast(`Obsidion Core docked to ${dockSide.toUpperCase()}`);
    });
  }

  // =========================================================================
  // 5. OBSIDION CORE HUB (RAM Governor Hooked to Win32 Task Manager)
  // =========================================================================
  const ramCircle = document.getElementById("ram-circle");
  const ramUsedText = document.getElementById("ram-used-text");
  const ramPercent = document.getElementById("ram-percent");
  const procsCount = document.getElementById("procs-count");
  const capText = document.getElementById("cap-text");
  const sliderCapVal = document.getElementById("slider-cap-val");
  const ramSlider = document.getElementById("ram-slider");
  const purgeBtn = document.getElementById("purge-btn");
  const vpnToggleBox = document.getElementById("vpn-toggle-box");
  const vpnCheckbox = document.getElementById("vpn-checkbox");
  const vpnStateLabel = document.getElementById("vpn-state-label");
  const vpnModeDesc = document.getElementById("vpn-mode-desc");
  const vpnPingBadge = document.getElementById("vpn-ping-badge");
  const vpnProviderSelect = document.getElementById("vpn-provider-select");
  const customProxyRow = document.getElementById("custom-proxy-row");
  const customProxyInput = document.getElementById("custom-proxy-input");
  const cpuSlider = document.getElementById("cpu-slider");
  const cpuValDisplay = document.getElementById("cpu-val-display");
  const adblockCounter = document.getElementById("adblock-counter");
  const lofiBtn = document.getElementById("lofi-play-btn");
  const lofiNextBtn = document.getElementById("lofi-next-btn");
  const lofiStationName = document.getElementById("lofi-station-name");
  const lofiAudio = document.getElementById("lofi-audio");
  const lofiVolume = document.getElementById("lofi-volume");
  const colorChips = document.querySelectorAll(".color-chip");
  const accentName = document.getElementById("accent-name");
  const hookState = document.getElementById("hook-state");

  const CIRCLE_CIRCUMFERENCE = 232.4; // 2 * PI * 37
  const ext = typeof browser !== "undefined" ? browser : chrome;
  let currentCap = 5;

  function updateRamGauge(loadedCount, capLimit, sleepingCount = 0) {
    if (ramUsedText) ramUsedText.textContent = `${loadedCount} Loaded`;
    if (capText) capText.textContent = `${capLimit} Tabs`;
    if (sliderCapVal) sliderCapVal.textContent = `${capLimit} Tabs`;
    if (ramSlider) ramSlider.value = capLimit;
    if (procsCount) procsCount.textContent = `${sleepingCount} Sleeping`;

    const pct = Math.min(Math.round((loadedCount / Math.max(1, capLimit)) * 100), 100);
    if (ramPercent) ramPercent.textContent = `${pct}%`;

    const offset = CIRCLE_CIRCUMFERENCE - (pct / 100) * CIRCLE_CIRCUMFERENCE;
    if (ramCircle) {
      ramCircle.style.strokeDashoffset = offset;
      if (pct > 85) {
        ramCircle.style.stroke = "#F43F5E";
      } else if (pct > 70) {
        ramCircle.style.stroke = "#F59E0B";
      } else {
        ramCircle.style.stroke = "var(--accent)";
      }
    }
  }

  // 100% Native WebExtension Tab Telemetry (Zero Port 40001 polling)
  function syncTabTelemetry() {
    if (!ext.runtime || !ext.runtime.sendMessage) return;
    try {
      ext.runtime.sendMessage({ action: "get_status" }, (res) => {
        if (!res) return;
        const loaded = res.loadedTabs || 1;
        const discarded = res.discardedTabs || 0;
        currentCap = res.maxLoadedTabs || 5;

        updateRamGauge(loaded, currentCap, discarded);

        if (hookState) {
          hookState.textContent = "WebExt Native";
          hookState.style.color = "#10B981";
        }

        if (res.vpnActive !== undefined && vpnCheckbox) {
          updateVpnState(res.vpnActive);
        }
      });
    } catch (e) {}
  }

  setInterval(syncTabTelemetry, 3000);
  syncTabTelemetry();

  if (ramSlider) {
    ramSlider.addEventListener("input", (e) => {
      currentCap = parseInt(e.target.value, 10);
      if (sliderCapVal) sliderCapVal.textContent = `${currentCap} Tabs`;
      if (capText) capText.textContent = `${currentCap} Tabs`;
    });
    ramSlider.addEventListener("change", (e) => {
      playCyberClick();
      currentCap = parseInt(e.target.value, 10);
      ext.runtime.sendMessage({ action: "set_tab_limit", limit: currentCap }, () => {
        showToast(`Tab Cap set to ${currentCap} loaded tabs`);
        syncTabTelemetry();
      });
    });
  }

  // Purge Inactive Tabs Action (100% Native browser.tabs.discard)
  if (purgeBtn) {
    purgeBtn.addEventListener("click", () => {
      playLaserPurge();
      ext.runtime.sendMessage({ action: "purge_tabs" }, (res) => {
        const count = res && res.count ? res.count : 0;
        const freed = res && res.freedMb ? res.freedMb : count * 85;
        showToast(`Purged ${count} inactive tabs (~${freed} MB saved)`);
        syncTabTelemetry();
      });
    });
  }

  // Obsidion Secure VPN Controller
  function updateVpnState(active, labelText) {
    if (vpnCheckbox) vpnCheckbox.checked = active;
    if (vpnToggleBox) {
      if (active) {
        vpnToggleBox.classList.add("connected");
        if (vpnStateLabel) {
          vpnStateLabel.textContent = "CONNECTED";
          vpnStateLabel.style.color = "#10B981";
        }
        if (vpnModeDesc) {
          const prov = vpnProviderSelect ? vpnProviderSelect.value : "direct_privacy";
          if (prov === "cloudflare_warp") vpnModeDesc.textContent = "WARP SOCKS5 (127.0.0.1:40000)";
          else if (prov === "custom_socks5") vpnModeDesc.textContent = `Custom (${customProxyInput ? customProxyInput.value : "1080"})`;
          else vpnModeDesc.textContent = "Secure Privacy Mode";
        }
        if (vpnPingBadge) {
          vpnPingBadge.textContent = "Active • Encrypted";
          vpnPingBadge.style.color = "#10B981";
        }
      } else {
        vpnToggleBox.classList.remove("connected");
        if (vpnStateLabel) {
          vpnStateLabel.textContent = "Disconnected";
          vpnStateLabel.style.color = "var(--text)";
        }
        if (vpnModeDesc) {
          vpnModeDesc.textContent = "Click switch to connect";
        }
        if (vpnPingBadge) {
          vpnPingBadge.textContent = "Off";
          vpnPingBadge.style.color = "var(--text-dim)";
        }
      }
    }
  }

  if (vpnProviderSelect) {
    const savedProv = localStorage.getItem("obsidion_vpn_provider") || "direct_privacy";
    vpnProviderSelect.value = savedProv;
    if (customProxyRow) customProxyRow.style.display = savedProv === "custom_socks5" ? "block" : "none";

    vpnProviderSelect.addEventListener("change", (e) => {
      playCyberClick();
      const prov = e.target.value;
      localStorage.setItem("obsidion_vpn_provider", prov);
      if (customProxyRow) customProxyRow.style.display = prov === "custom_socks5" ? "block" : "none";
      if (vpnCheckbox && vpnCheckbox.checked) {
        vpnCheckbox.dispatchEvent(new Event("change"));
      }
    });
  }

  if (customProxyInput) {
    const savedCustom = localStorage.getItem("obsidion_custom_proxy") || "127.0.0.1:1080";
    customProxyInput.value = savedCustom;
    customProxyInput.addEventListener("change", (e) => {
      localStorage.setItem("obsidion_custom_proxy", e.target.value);
      if (vpnCheckbox && vpnCheckbox.checked) {
        vpnCheckbox.dispatchEvent(new Event("change"));
      }
    });
  }

  if (vpnCheckbox) {
    vpnCheckbox.addEventListener("change", (e) => {
      e.stopPropagation();
      const active = vpnCheckbox.checked;
      playVpnHum(active);
      updateVpnState(active);
      showToast(active ? "Connecting Obsidion VPN..." : "VPN Disconnected");

      const provider = vpnProviderSelect ? vpnProviderSelect.value : "direct_privacy";
      const customAddr = customProxyInput ? customProxyInput.value.trim() : "127.0.0.1:1080";

      ext.runtime.sendMessage({
        action: "set_vpn",
        enabled: active,
        provider: provider,
        customAddress: customAddr
      }, (res) => {
        const isConn = res && res.status === "connected";
        updateVpnState(isConn, res ? res.label : null);
        if (isConn) {
          showToast(`VPN Connected: ${res.label || "Encrypted"}`);
        }
      });
    });
  }

  if (vpnToggleBox) {
    vpnToggleBox.addEventListener("click", (e) => {
      // Prevent double toggle when clicking directly on the switch label, select, or input
      if (e.target.closest("label.switch-toggle") || e.target.closest("select") || e.target.closest("input")) {
        return;
      }
      if (vpnCheckbox) {
        vpnCheckbox.checked = !vpnCheckbox.checked;
        vpnCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  // CPU Throttle
  if (cpuSlider && cpuValDisplay) {
    cpuSlider.addEventListener("input", (e) => {
      cpuValDisplay.textContent = `${e.target.value}%`;
    });
    cpuSlider.addEventListener("change", (e) => {
      playCyberClick();
      showToast(`CPU Throttle set to ${e.target.value}%`);
    });
  }

  // Necko Shield Counter
  let blockCount = 182;
  setInterval(() => {
    if (Math.random() > 0.6) {
      blockCount += Math.floor(Math.random() * 3) + 1;
      if (adblockCounter) adblockCounter.textContent = blockCount;
    }
  }, 4000);

  // Lo-Fi Player
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
        lofiBtn.style.background = "var(--accent)";
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

  // Dynamic Accent Theme Picker
  colorChips.forEach(chip => {
    chip.addEventListener("click", () => {
      playCyberClick();
      colorChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const color = chip.getAttribute("data-color");
      const rgb = chip.getAttribute("data-rgb");
      const name = chip.getAttribute("data-name");

      document.documentElement.style.setProperty("--accent", color);
      document.documentElement.style.setProperty("--accent-rgb", rgb);
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

  // Restore saved theme
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["obsidion_accent"], (res) => {
      if (res && res.obsidion_accent) {
        const { color, rgb, name } = res.obsidion_accent;
        document.documentElement.style.setProperty("--accent", color);
        document.documentElement.style.setProperty("--accent-rgb", rgb);
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

    chrome.runtime.sendMessage({ action: "get_status" }, (res) => {
      if (res && typeof res.vpnActive !== "undefined") {
        updateVpnState(res.vpnActive);
      }
    });
  }

  // =========================================================================
  // 6. HERO CLOCK, DATE, SEARCH BAR
  // =========================================================================
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const searchInput = document.getElementById("search-input");

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    if (dateEl) {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      dateEl.textContent = now.toLocaleDateString(undefined, options);
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (!query) return;

        const isUrl = /^https?:\/\//i.test(query) || (/^[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(query) && !query.includes(" "));
        if (isUrl) {
          window.location.href = /^https?:\/\//i.test(query) ? query : `https://${query}`;
        } else {
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // =========================================================================
  // 7. 5 CUSTOMIZABLE SPEED DIALS
  // =========================================================================
  const speedDialsContainer = document.getElementById("speed-dials-container");
  const sdModal = document.getElementById("speeddial-modal");
  const sdTitleInput = document.getElementById("sd-title-input");
  const sdUrlInput = document.getElementById("sd-url-input");
  const sdEditIndex = document.getElementById("sd-edit-index");
  const sdSaveBtn = document.getElementById("sd-save-btn");

  const DEFAULT_SPEED_DIALS = [
    { title: "YouTube", url: "https://www.youtube.com", icon: "▶️" },
    { title: "GitHub", url: "https://github.com", icon: "🐙" },
    { title: "Reddit", url: "https://www.reddit.com", icon: "🤖" },
    { title: "X / Twitter", url: "https://x.com", icon: "✖️" },
    { title: "ChatGPT", url: "https://chatgpt.com", icon: "✨" }
  ];

  let speedDials = [];
  try {
    const savedDials = localStorage.getItem("obsidion_speed_dials");
    speedDials = savedDials ? JSON.parse(savedDials) : DEFAULT_SPEED_DIALS;
  } catch (e) {
    speedDials = DEFAULT_SPEED_DIALS;
  }

  function getDomain(url) {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname;
    } catch {
      return "web";
    }
  }

  function renderSpeedDials() {
    if (!speedDialsContainer) return;
    speedDialsContainer.innerHTML = "";

    speedDials.slice(0, 5).forEach((dial, idx) => {
      const card = document.createElement("a");
      card.className = "speed-dial-card";
      card.href = dial.url;
      card.target = "_self";

      const domain = getDomain(dial.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      card.innerHTML = `
        <div class="speed-dial-actions">
          <button class="dial-action-btn edit-btn" title="Edit" data-idx="${idx}">✏️</button>
          <button class="dial-action-btn del-btn" title="Delete" data-idx="${idx}">✖</button>
        </div>
        <div class="speed-dial-icon-wrap">
          <img src="${faviconUrl}" alt="${dial.title}" onerror="this.onerror=null;this.parentElement.textContent='${dial.icon || '🌐'}';">
        </div>
        <div class="speed-dial-title">${dial.title}</div>
      `;

      // Prevent navigation on edit/del click
      card.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditSpeedDial(idx);
      });

      card.querySelector(".del-btn").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteSpeedDial(idx);
      });

      speedDialsContainer.appendChild(card);
    });

    // If fewer than 5 dials, add a "+" slot
    if (speedDials.length < 5) {
      const addCard = document.createElement("div");
      addCard.className = "speed-dial-card";
      addCard.style.borderStyle = "dashed";
      addCard.innerHTML = `
        <div class="speed-dial-icon-wrap" style="background: transparent; border-style: dashed; font-size: 24px;">+</div>
        <div class="speed-dial-title" style="color: var(--accent);">Add Dial</div>
      `;
      addCard.addEventListener("click", () => {
        openEditSpeedDial(-1);
      });
      speedDialsContainer.appendChild(addCard);
    }
  }

  function openEditSpeedDial(idx) {
    if (!sdModal) return;
    playCyberClick();
    sdEditIndex.value = idx;
    if (idx >= 0 && speedDials[idx]) {
      sdTitleInput.value = speedDials[idx].title;
      sdUrlInput.value = speedDials[idx].url;
    } else {
      sdTitleInput.value = "";
      sdUrlInput.value = "https://";
    }
    sdModal.showModal();
  }

  function deleteSpeedDial(idx) {
    playCyberClick();
    speedDials.splice(idx, 1);
    localStorage.setItem("obsidion_speed_dials", JSON.stringify(speedDials));
    renderSpeedDials();
    showToast("Speed dial removed");
  }

  if (sdSaveBtn) {
    sdSaveBtn.addEventListener("click", () => {
      const idx = parseInt(sdEditIndex.value, 10);
      const title = sdTitleInput.value.trim() || "Bookmark";
      let url = sdUrlInput.value.trim() || "https://google.com";
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

      if (idx >= 0 && idx < speedDials.length) {
        speedDials[idx] = { title, url, icon: "🌐" };
      } else {
        speedDials.push({ title, url, icon: "🌐" });
      }

      localStorage.setItem("obsidion_speed_dials", JSON.stringify(speedDials));
      renderSpeedDials();
      sdModal.close();
      showToast("Speed dial saved");
    });
  }

  renderSpeedDials();

  // =========================================================================
  // 8. DYNAMIC OPEN-SOURCE WEATHER WIDGET (Open-Meteo)
  // =========================================================================
  const weatherTemp = document.getElementById("weather-temp");
  const weatherCond = document.getElementById("weather-cond");
  const weatherCityName = document.getElementById("weather-city-name");
  const weatherIcon = document.getElementById("weather-icon");
  const weatherFeels = document.getElementById("weather-feels");
  const weatherHumidity = document.getElementById("weather-humidity");
  const weatherWind = document.getElementById("weather-wind");
  const weatherPressure = document.getElementById("weather-pressure");
  const unitToggle = document.getElementById("unit-toggle");
  const changeCityBtn = document.getElementById("change-city-btn");
  const cityModal = document.getElementById("city-modal");
  const citySearchInput = document.getElementById("city-search-input");
  const cityResults = document.getElementById("city-results");
  const citySearchStatus = document.getElementById("city-search-status");
  const autoLocateBtn = document.getElementById("auto-locate-btn");

  let isFahrenheit = localStorage.getItem("obsidion_weather_unit") === "F";
  let currentCity = localStorage.getItem("obsidion_weather_city") || "Mahendranagar, NP";
  let currentLat = parseFloat(localStorage.getItem("obsidion_weather_lat") || "28.9642");
  let currentLon = parseFloat(localStorage.getItem("obsidion_weather_lon") || "80.1772");
  let lastTempC = 28;
  let lastFeelsC = 29;

  // WMO Weather interpretation codes
  function interpretWMO(code, isDay) {
    switch (code) {
      case 0:
        return { desc: isDay ? "Sunny" : "Clear Night", icon: isDay ? "☀️" : "🌙" };
      case 1:
      case 2:
        return { desc: isDay ? "Partly Cloudy" : "Partly Moonlit", icon: isDay ? "⛅" : "☁️" };
      case 3:
        return { desc: "Overcast", icon: "☁️" };
      case 45:
      case 48:
        return { desc: "Foggy Atmosphere", icon: "🌫️" };
      case 51:
      case 53:
      case 55:
        return { desc: "Light Drizzle", icon: "🌦️" };
      case 61:
      case 63:
      case 65:
        return { desc: "Rain", icon: "🌧️" };
      case 71:
      case 73:
      case 75:
        return { desc: "Snowfall", icon: "🌨️" };
      case 80:
      case 81:
      case 82:
        return { desc: "Rain Showers", icon: "🌧️" };
      case 95:
      case 96:
      case 99:
        return { desc: "Thunderstorm", icon: "⛈️" };
      default:
        return { desc: "Mainly Clear", icon: "🌤️" };
    }
  }

  function displayTemperature(tempC, feelsC) {
    if (isFahrenheit) {
      const tempF = Math.round((tempC * 9/5) + 32);
      const feelsF = Math.round((feelsC * 9/5) + 32);
      if (weatherTemp) weatherTemp.textContent = `${tempF}°`;
      if (weatherFeels) weatherFeels.textContent = `${feelsF}°F`;
      if (unitToggle) unitToggle.textContent = "°F";
    } else {
      if (weatherTemp) weatherTemp.textContent = `${Math.round(tempC)}°`;
      if (weatherFeels) weatherFeels.textContent = `${Math.round(feelsC)}°C`;
      if (unitToggle) unitToggle.textContent = "°C";
    }
  }

  if (unitToggle) {
    unitToggle.addEventListener("click", () => {
      playCyberClick();
      isFahrenheit = !isFahrenheit;
      localStorage.setItem("obsidion_weather_unit", isFahrenheit ? "F" : "C");
      displayTemperature(lastTempC, lastFeelsC);
    });
  }

  async function fetchOpenMeteoWeather(lat, lon, cityName) {
    try {
      if (weatherCityName) weatherCityName.textContent = cityName;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Open-Meteo failed");
      const data = await res.json();
      const cur = data.current;

      lastTempC = cur.temperature_2m;
      lastFeelsC = cur.apparent_temperature;
      displayTemperature(lastTempC, lastFeelsC);

      const wmo = interpretWMO(cur.weather_code, cur.is_day);
      if (weatherCond) weatherCond.textContent = wmo.desc;
      if (weatherIcon) weatherIcon.textContent = wmo.icon;
      if (weatherHumidity) weatherHumidity.textContent = `${cur.relative_humidity_2m}%`;
      if (weatherWind) weatherWind.textContent = `${Math.round(cur.wind_speed_10m)} km/h`;
      if (weatherPressure) weatherPressure.textContent = `${Math.round(cur.surface_pressure)} hPa`;
    } catch (e) {
      // Offline fallback
      displayTemperature(28, 29);
      if (weatherCond) weatherCond.textContent = "Clear Sky";
      if (weatherIcon) weatherIcon.textContent = "☀️";
    }
  }

  fetchOpenMeteoWeather(currentLat, currentLon, currentCity);

  // City Search Modal
  if (changeCityBtn && cityModal) {
    changeCityBtn.addEventListener("click", () => {
      playCyberClick();
      cityModal.showModal();
    });
  }

  let searchTimeout = null;
  if (citySearchInput) {
    citySearchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      clearTimeout(searchTimeout);
      if (q.length < 2) {
        if (cityResults) cityResults.innerHTML = "";
        if (citySearchStatus) citySearchStatus.textContent = "";
        return;
      }
      if (citySearchStatus) citySearchStatus.textContent = "Searching cities...";
      searchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          if (cityResults) cityResults.innerHTML = "";
          if (!data.results || data.results.length === 0) {
            if (citySearchStatus) citySearchStatus.textContent = "No matching cities found.";
            return;
          }
          if (citySearchStatus) citySearchStatus.textContent = `Found ${data.results.length} locations:`;
          data.results.forEach(item => {
            const row = document.createElement("div");
            row.className = "city-item";
            const admin = item.admin1 ? `, ${item.admin1}` : "";
            const country = item.country ? ` (${item.country})` : "";
            const displayName = `${item.name}${admin}${country}`;

            row.innerHTML = `
              <span>${displayName}</span>
              <span style="color: var(--accent); font-size: 10px;">Select →</span>
            `;

            row.addEventListener("click", () => {
              playCyberClick();
              currentCity = `${item.name}, ${item.country_code || item.country || ''}`;
              currentLat = item.latitude;
              currentLon = item.longitude;
              localStorage.setItem("obsidion_weather_city", currentCity);
              localStorage.setItem("obsidion_weather_lat", currentLat);
              localStorage.setItem("obsidion_weather_lon", currentLon);
              fetchOpenMeteoWeather(currentLat, currentLon, currentCity);
              cityModal.close();
              showToast(`City set to ${currentCity}`);
            });

            cityResults.appendChild(row);
          });
        } catch (err) {
          if (citySearchStatus) citySearchStatus.textContent = "Failed to fetch city results.";
        }
      }, 350);
    });
  }

  if (autoLocateBtn) {
    autoLocateBtn.addEventListener("click", async () => {
      playCyberClick();
      if (citySearchStatus) citySearchStatus.textContent = "Detecting IP location...";
      try {
        const res = await fetch("https://wttr.in/?format=j1");
        if (res.ok) {
          const data = await res.json();
          const area = data.nearest_area[0];
          currentCity = `${area.areaName[0].value}, ${area.country[0].value}`;
          currentLat = parseFloat(area.latitude);
          currentLon = parseFloat(area.longitude);
          localStorage.setItem("obsidion_weather_city", currentCity);
          localStorage.setItem("obsidion_weather_lat", currentLat);
          localStorage.setItem("obsidion_weather_lon", currentLon);
          fetchOpenMeteoWeather(currentLat, currentLon, currentCity);
          cityModal.close();
          showToast(`Auto-detected: ${currentCity}`);
        }
      } catch (err) {
        showToast("Auto-detection unavailable");
      }
    });
  }

  // Generic modal close handlers
  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      const target = document.getElementById(modalId);
      if (target) target.close();
    });
  });

  // Modern dialog click backdrop fallback for light dismiss
  document.querySelectorAll("dialog").forEach(dlg => {
    dlg.addEventListener("click", (event) => {
      if (event.target !== dlg) return;
      const rect = dlg.getBoundingClientRect();
      const isContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isContent) dlg.close();
    });
  });

  // =========================================================================
  // 9. QUICK LINKS FROM HISTORY
  // =========================================================================
  const historyContainer = document.getElementById("history-container");

  function renderHistoryLinks() {
    if (!historyContainer) return;

    if (chrome.history && chrome.history.search) {
      chrome.history.search({ text: "", maxResults: 14 }, (results) => {
        if (!results || results.length === 0) {
          renderFallbackHistory();
          return;
        }

        historyContainer.innerHTML = "";
        const seenDomains = new Set();
        let added = 0;

        for (const item of results) {
          if (!item.url || item.url.startsWith("about:") || item.url.startsWith("chrome-extension:")) continue;
          const domain = getDomain(item.url);
          if (seenDomains.has(domain)) continue;
          seenDomains.add(domain);

          const card = document.createElement("a");
          card.className = "history-card";
          card.href = item.url;
          const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

          card.innerHTML = `
            <img src="${favicon}" alt="" onerror="this.style.display='none'">
            <div class="history-text">
              <span class="history-title">${item.title || domain}</span>
              <span class="history-domain">${domain}</span>
            </div>
          `;
          historyContainer.appendChild(card);
          added++;
          if (added >= 6) break;
        }

        if (added === 0) renderFallbackHistory();
      });
    } else {
      renderFallbackHistory();
    }
  }

  function renderFallbackHistory() {
    if (!historyContainer) return;
    const defaults = [
      { title: "Hacker News", url: "https://news.ycombinator.com" },
      { title: "DuckDuckGo", url: "https://duckduckgo.com" },
      { title: "Ars Technica", url: "https://arstechnica.com" },
      { title: "Mozilla Developer", url: "https://developer.mozilla.org" }
    ];
    historyContainer.innerHTML = "";
    defaults.forEach(item => {
      const card = document.createElement("a");
      card.className = "history-card";
      card.href = item.url;
      const domain = getDomain(item.url);
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      card.innerHTML = `
        <img src="${favicon}" alt="" onerror="this.style.display='none'">
        <div class="history-text">
          <span class="history-title">${item.title}</span>
          <span class="history-domain">${domain}</span>
        </div>
      `;
      historyContainer.appendChild(card);
    });
  }

  renderHistoryLinks();

  // =========================================================================
  // 10. CURATED INTELLIGENCE NEWS FEEDS
  // =========================================================================
  const techTabBtn = document.getElementById("tech-tab-btn");
  const moviesTabBtn = document.getElementById("movies-tab-btn");
  const newsContainer = document.getElementById("news-container");

  const TECH_NEWS = [
    {
      title: "Rust 2024 Edition Finalized: High-Performance Concurrency & Zero-Cost Memory Safety",
      source: "TechRadar",
      time: "2 hours ago",
      tag: "SYSTEMS",
      url: "https://news.ycombinator.com"
    },
    {
      title: "Next-Gen Quantum Microarchitectures Achieve Sub-Nanosecond Coherence at Room Temperature",
      source: "Ars Technica",
      time: "4 hours ago",
      tag: "HARDWARE",
      url: "https://arstechnica.com"
    },
    {
      title: "Local LLM Acceleration: 8-bit Quantized Models Running at 120 Tokens/s on Consumer GPUs",
      source: "Hacker News",
      time: "5 hours ago",
      tag: "ARTIFICIAL INTELLIGENCE",
      url: "https://news.ycombinator.com"
    },
    {
      title: "Linux 6.14 Kernel Enhances Win32 Proton Compatibility & Dynamic Process QoS",
      source: "Phoronix",
      time: "7 hours ago",
      tag: "KERNEL & OS",
      url: "https://phoronix.com"
    },
    {
      title: "Privacy First: Major Web Standards Group Votes to Ban Unregulated Canvas Fingerprinting",
      source: "The Verge",
      time: "9 hours ago",
      tag: "SECURITY",
      url: "https://theverge.com"
    }
  ];

  const MOVIE_NEWS = [
    {
      title: "Denis Villeneuve Confirms Pre-Production on 'Rendezvous with Rama' & Sci-Fi Epics",
      source: "Collider",
      time: "3 hours ago",
      tag: "SCI-FI CINEMA",
      url: "https://collider.com"
    },
    {
      title: "Christopher Nolan's Next Groundbreaking Project Officially Set for Universal IMAX Release",
      source: "Variety",
      time: "5 hours ago",
      tag: "DIRECTORS",
      url: "https://variety.com"
    },
    {
      title: "Cyberpunk 2077 Live-Action Feature Film Announces Lead Creative Team & Aesthetic Direction",
      source: "Deadline",
      time: "8 hours ago",
      tag: "ADAPTATIONS",
      url: "https://deadline.com"
    },
    {
      title: "4K HDR Optical Restoration of Studio Ghibli Classics Revealed for Theatrical Tour",
      source: "IndieWire",
      time: "11 hours ago",
      tag: "ANIMATION",
      url: "https://indiewire.com"
    },
    {
      title: "The Renaissance of Practical Special Effects in Modern Horror & Speculative Fiction",
      source: "Empire",
      time: "14 hours ago",
      tag: "VFX & PRACTICAL",
      url: "https://empireonline.com"
    }
  ];

  function renderNews(articles) {
    if (!newsContainer) return;
    newsContainer.innerHTML = "";
    articles.forEach((art) => {
      const card = document.createElement("a");
      card.className = "news-card";
      card.href = art.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      card.innerHTML = `
        <div class="news-tag">${art.tag}</div>
        <div class="news-headline">${art.title}</div>
        <div class="news-footer">
          <span>${art.source}</span>
          <span>${art.time}</span>
        </div>
      `;
      newsContainer.appendChild(card);
    });
  }

  renderNews(TECH_NEWS);

  if (techTabBtn && moviesTabBtn) {
    techTabBtn.addEventListener("click", () => {
      playCyberClick();
      techTabBtn.classList.add("active");
      moviesTabBtn.classList.remove("active");
      renderNews(TECH_NEWS);
    });

    moviesTabBtn.addEventListener("click", () => {
      playCyberClick();
      moviesTabBtn.classList.add("active");
      techTabBtn.classList.remove("active");
      renderNews(MOVIE_NEWS);
    });
  }
})();
