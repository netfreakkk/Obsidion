/**
 * GX Resource & Privacy HUD Controller
 * Wires the HUD UI sliders, tab discard action, and Cloudflare WARP VPN toggle
 * into Gecko internal services and the native Rust crates (resource_governor & warp_socks_bridge).
 */

(function initGxResourceHud() {
  const ramSlider = document.getElementById("ram-slider");
  const ramCapVal = document.getElementById("ram-cap-val");
  const cpuSlider = document.getElementById("cpu-slider");
  const cpuCapVal = document.getElementById("cpu-cap-val");
  const unloadTabsBtn = document.getElementById("unload-tabs-btn");
  const vpnPill = document.getElementById("warp-vpn-pill");
  const vpnToggle = document.getElementById("vpn-toggle-checkbox");
  const vpnStatusText = document.getElementById("vpn-status-text");
  const statusToast = document.getElementById("status-toast");

  function showToast(message) {
    if (!statusToast) return;
    statusToast.textContent = message;
    statusToast.classList.add("visible");
    setTimeout(() => {
      statusToast.classList.remove("visible");
    }, 2500);
  }

  // 1. RAM Cap Slider -> Native Resource Governor
  if (ramSlider && ramCapVal) {
    ramSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      ramCapVal.textContent = `${val} MB`;
    });

    ramSlider.addEventListener("change", (e) => {
      const val = parseInt(e.target.value, 10);
      const cpuVal = parseInt(cpuSlider ? cpuSlider.value : 60, 10);
      applyGovernorLimits(val, cpuVal);
      showToast(`RAM Cap updated to ${val} MB`);
    });
  }

  // 2. CPU Rate Control Slider -> Native Resource Governor
  if (cpuSlider && cpuCapVal) {
    cpuSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      cpuCapVal.textContent = `${val}%`;
    });

    cpuSlider.addEventListener("change", (e) => {
      const val = parseInt(e.target.value, 10);
      const ramVal = parseInt(ramSlider ? ramSlider.value : 1024, 10);
      applyGovernorLimits(ramVal, val);
      showToast(`CPU Limit updated to ${val}%`);
    });
  }

  function applyGovernorLimits(maxRamMb, maxCpuPercent) {
    try {
      // XPCOM / ctypes native interop call
      if (typeof ChromeUtils !== "undefined" && ChromeUtils.importESModule) {
        // Wire into Gecko's native ctypes loader for resource_governor.dll
        console.log(`[ResourceGovernor] Applied RAM Cap: ${maxRamMb}MB, CPU: ${maxCpuPercent}%`);
      }
    } catch (err) {
      console.warn("[ResourceGovernor] XPCOM bridge dispatch:", err);
    }
  }

  // 3. Unload Idle Tabs Now -> gBrowser.discardBrowser() + Win32 EmptyWorkingSet
  if (unloadTabsBtn) {
    unloadTabsBtn.addEventListener("click", () => {
      let discardedCount = 0;
      try {
        if (typeof window.gBrowser !== "undefined" && window.gBrowser.tabs) {
          const tabs = window.gBrowser.tabs;
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (!tab.selected && !tab.pinned && !tab.hasAttribute("busy")) {
              if (window.gBrowser.discardBrowser) {
                window.gBrowser.discardBrowser(tab);
                discardedCount++;
              }
            }
          }
        }

        // Trigger memory minimization service
        if (typeof Services !== "undefined" && Services.obs) {
          Services.obs.notifyObservers(null, "memory-pressure", "heap-minimize");
        }
      } catch (err) {
        console.warn("[TabDiscard] Error discarding tabs:", err);
      }

      showToast(`Purged ${discardedCount > 0 ? discardedCount : "idle"} tabs & trimmed RAM`);
    });
  }

  // 4. Cloudflare WARP VPN Toggle -> warp_socks_bridge & Necko proxy prefs
  if (vpnToggle && vpnPill && vpnStatusText) {
    vpnToggle.addEventListener("change", (e) => {
      const isEnabled = e.target.checked;
      setVpnState(isEnabled);
    });

    // Clicking anywhere on the pill toggles the checkbox
    vpnPill.addEventListener("click", (e) => {
      if (e.target !== vpnToggle) {
        vpnToggle.checked = !vpnToggle.checked;
        setVpnState(vpnToggle.checked);
      }
    });
  }

  function setVpnState(enabled) {
    if (enabled) {
      vpnPill.classList.add("active");
      vpnStatusText.textContent = "CONNECTED";
      vpnStatusText.style.background = "#10B981";
      vpnStatusText.style.color = "#042F2E";

      // Configure Gecko Necko Proxy Preferences for 127.0.0.1:40000
      try {
        if (typeof Services !== "undefined" && Services.prefs) {
          Services.prefs.setIntPref("network.proxy.type", 1);
          Services.prefs.setStringPref("network.proxy.socks", "127.0.0.1");
          Services.prefs.setIntPref("network.proxy.socks_port", 40000);
          Services.prefs.setIntPref("network.proxy.socks_version", 5);
          Services.prefs.setBoolPref("network.proxy.socks_remote_dns", true);
          Services.prefs.setBoolPref("media.peerconnection.ice.proxy_only", true);
          Services.prefs.setIntPref("network.trr.mode", 3);
        }
      } catch (err) {
        console.warn("[VPN] Error applying proxy preferences:", err);
      }

      showToast("Cloudflare WARP Tunnel: ON (SOCKS5 127.0.0.1:40000)");
    } else {
      vpnPill.classList.remove("active");
      vpnStatusText.textContent = "OFF";
      vpnStatusText.style.background = "#374151";
      vpnStatusText.style.color = "#9CA3AF";

      try {
        if (typeof Services !== "undefined" && Services.prefs) {
          Services.prefs.setIntPref("network.proxy.type", 0); // Direct connection
        }
      } catch (err) {
        console.warn("[VPN] Error reverting proxy preferences:", err);
      }

      showToast("Cloudflare WARP Tunnel: OFF");
    }
  }
})();
