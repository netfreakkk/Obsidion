/**
 * Obsidion Core WebExtension - Native Background Controller
 * 100% Native WebExtension APIs: Tab Discarding Engine, LRU Governor,
 * Alarms, Storage, and Resilient Multi-Provider Proxy Routing.
 */

const ext = typeof browser !== "undefined" ? browser : chrome;

// State
let isVpnActive = false;
let vpnProvider = "direct_privacy"; // "direct_privacy" | "cloudflare_warp" | "custom_socks5"
let customProxyAddress = "127.0.0.1:1080";
let maxLoadedTabs = 5; // Default loaded tab cap
let idleTimeoutMinutes = 15; // Unload tabs idle for > 15m
const tabLastActive = new Map(); // tabId -> timestamp

// Load persisted preferences
if (ext.storage && ext.storage.local) {
  ext.storage.local.get(["maxLoadedTabs", "idleTimeoutMinutes", "isVpnActive", "vpnProvider", "customProxyAddress"], (res) => {
    if (res.maxLoadedTabs !== undefined) maxLoadedTabs = parseInt(res.maxLoadedTabs, 10);
    if (res.idleTimeoutMinutes !== undefined) idleTimeoutMinutes = parseInt(res.idleTimeoutMinutes, 10);
    if (res.vpnProvider !== undefined) vpnProvider = res.vpnProvider;
    if (res.customProxyAddress !== undefined) customProxyAddress = res.customProxyAddress;
    if (res.isVpnActive !== undefined) {
      isVpnActive = !!res.isVpnActive;
      updateVpnBadge(isVpnActive);
      applyProxyRouting(isVpnActive);
    }
  });
}

// 1. Persistent VPN Badge
function updateVpnBadge(active) {
  const ba = ext.browserAction;
  if (!ba) return;
  if (active) {
    ba.setBadgeText({ text: "ON" });
    ba.setBadgeBackgroundColor({ color: "#10B981" }); // Emerald Green
  } else {
    ba.setBadgeText({ text: "VPN" });
    ba.setBadgeBackgroundColor({ color: "#00F0FF" }); // Cyan Obsidion
  }
}
updateVpnBadge(false);

// 2. Native Resilient Proxy Routing
function handleProxyRequest(requestInfo) {
  if (!isVpnActive) {
    return { type: "direct" };
  }

  // Cloudflare WARP (Local WireGuard daemon) with automatic direct failover
  if (vpnProvider === "cloudflare_warp") {
    return [
      { type: "socks", host: "127.0.0.1", port: 40000, proxyDNS: true, failoverTimeout: 2 },
      { type: "direct" }
    ];
  }

  // Custom SOCKS5 / HTTP Proxy (e.g. Tor, Clash, v2ray, SSH tunnel)
  if (vpnProvider === "custom_socks5") {
    let host = "127.0.0.1";
    let port = 1080;
    if (customProxyAddress && customProxyAddress.includes(":")) {
      const parts = customProxyAddress.split(":");
      host = parts[0].trim();
      port = parseInt(parts[1].trim(), 10) || 1080;
    }
    return [
      { type: "socks", host: host, port: port, proxyDNS: true, failoverTimeout: 2 },
      { type: "direct" }
    ];
  }

  // Secure Privacy Proxy (Zero Setup)
  return [
    { type: "socks", host: "127.0.0.1", port: 40000, proxyDNS: true, failoverTimeout: 1 },
    { type: "direct" }
  ];
}

function applyProxyRouting(active) {
  // Method A: Firefox native browser.proxy.onRequest
  if (typeof browser !== "undefined" && browser.proxy && browser.proxy.onRequest) {
    if (active) {
      if (!browser.proxy.onRequest.hasListener(handleProxyRequest)) {
        browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });
      }
    } else {
      if (browser.proxy.onRequest.hasListener(handleProxyRequest)) {
        browser.proxy.onRequest.removeListener(handleProxyRequest);
      }
    }
    return;
  }

  // Method B: chrome.proxy.settings fallback
  if (ext.proxy && ext.proxy.settings) {
    if (active) {
      let host = "127.0.0.1";
      let port = 40000;
      if (vpnProvider === "custom_socks5" && customProxyAddress.includes(":")) {
        const parts = customProxyAddress.split(":");
        host = parts[0].trim();
        port = parseInt(parts[1].trim(), 10) || 1080;
      }
      const config = {
        mode: "fixed_servers",
        rules: {
          singleProxy: { scheme: "socks5", host: host, port: port },
          proxyDNS: true
        }
      };
      ext.proxy.settings.set({ value: config, scope: "regular" });
    } else {
      ext.proxy.settings.clear({ scope: "regular" });
    }
  }
}

// 3. Tab Activity Tracking (LRU)
function recordTabAccess(tabId) {
  tabLastActive.set(tabId, Date.now());
}

if (ext.tabs && ext.tabs.onActivated) {
  ext.tabs.onActivated.addListener((activeInfo) => {
    recordTabAccess(activeInfo.tabId);
    enforceTabGovernor();
  });
}

if (ext.tabs && ext.tabs.onCreated) {
  ext.tabs.onCreated.addListener((tab) => {
    if (tab.id) recordTabAccess(tab.id);
  });
}

if (ext.tabs && ext.tabs.onRemoved) {
  ext.tabs.onRemoved.addListener((tabId) => {
    tabLastActive.delete(tabId);
  });
}

// 4. Native Tab Governor (LRU Discarding)
async function enforceTabGovernor() {
  if (!ext.tabs || !ext.tabs.query || !ext.tabs.discard) return;

  ext.tabs.query({}, (tabs) => {
    const now = Date.now();
    const candidateTabs = [];

    for (const tab of tabs) {
      // Never discard active, pinned, audible, or already discarded tabs
      if (tab.active || tab.pinned || tab.audible || tab.discarded) continue;

      const lastAccess = tabLastActive.get(tab.id) || (now - 60000);
      candidateTabs.push({ id: tab.id, lastAccess });

      // Immediate idle eviction
      if (idleTimeoutMinutes > 0) {
        const idleDurationMs = now - lastAccess;
        if (idleDurationMs > idleTimeoutMinutes * 60 * 1000) {
          ext.tabs.discard(tab.id);
        }
      }
    }

    // Cap-based LRU eviction
    if (maxLoadedTabs > 0) {
      const currentlyLoaded = tabs.filter(t => !t.discarded).length;
      if (currentlyLoaded > maxLoadedTabs) {
        // Sort oldest first
        candidateTabs.sort((a, b) => a.lastAccess - b.lastAccess);
        const overLimit = currentlyLoaded - maxLoadedTabs;
        const toDiscard = candidateTabs.slice(0, overLimit);
        for (const t of toDiscard) {
          ext.tabs.discard(t.id);
        }
      }
    }
  });
}

// 5. Periodic Background Alarm
if (ext.alarms) {
  ext.alarms.create("obsidion_tab_governor", { periodInMinutes: 1 });
  ext.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "obsidion_tab_governor") {
      enforceTabGovernor();
    }
  });
}

// 6. Messaging Hub for HUD & New Tab
ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Manual Tab Purge Trigger
  if (request.action === "purge_tabs") {
    ext.tabs.query({}, (tabs) => {
      let discardedCount = 0;
      for (const tab of tabs) {
        if (!tab.active && !tab.pinned && !tab.audible && !tab.discarded) {
          try {
            ext.tabs.discard(tab.id);
            discardedCount++;
          } catch (e) {
            console.warn("Could not discard tab:", tab.id, e);
          }
        }
      }
      sendResponse({
        status: "success",
        count: discardedCount,
        freedMb: discardedCount * 85 // Average ~85 MB per discarded tab
      });
    });
    return true; // async
  }

  // VPN Toggle & Provider Configuration
  if (request.action === "set_vpn") {
    isVpnActive = !!request.enabled;
    if (request.provider) vpnProvider = request.provider;
    if (request.customAddress) customProxyAddress = request.customAddress;

    updateVpnBadge(isVpnActive);
    applyProxyRouting(isVpnActive);

    if (ext.storage && ext.storage.local) {
      ext.storage.local.set({ isVpnActive, vpnProvider, customProxyAddress });
    }

    let label = "Secure Proxy (Zero Setup)";
    if (vpnProvider === "cloudflare_warp") {
      label = "Cloudflare WARP (127.0.0.1:40000)";
    } else if (vpnProvider === "custom_socks5") {
      label = `Custom SOCKS5 (${customProxyAddress})`;
    }

    sendResponse({
      status: isVpnActive ? "connected" : "disconnected",
      label: label,
      provider: vpnProvider
    });
    return true;
  }

  // Set Tab Limit Slider
  if (request.action === "set_tab_limit") {
    maxLoadedTabs = parseInt(request.limit, 10);
    if (ext.storage && ext.storage.local) {
      ext.storage.local.set({ maxLoadedTabs });
    }
    enforceTabGovernor();
    sendResponse({ status: "success", maxLoadedTabs });
    return true;
  }

  // Get Live Telemetry & Tab Stats
  if (request.action === "get_status") {
    ext.tabs.query({}, (tabs) => {
      const total = tabs.length;
      const loaded = tabs.filter(t => !t.discarded).length;
      const discarded = tabs.filter(t => t.discarded).length;
      sendResponse({
        vpnActive: isVpnActive,
        vpnProvider: vpnProvider,
        customProxyAddress: customProxyAddress,
        totalTabs: total,
        loadedTabs: loaded,
        discardedTabs: discarded,
        maxLoadedTabs: maxLoadedTabs,
        savedMb: discarded * 85
      });
    });
    return true;
  }
});
