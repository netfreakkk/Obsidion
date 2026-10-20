/**
 * Obsidion HUD & VPN Background Controller
 * Handles Tab Memory Purging, SOCKS5 WARP Proxy Routing, and Persistent VPN Badge
 */

let isVpnActive = false;

function updateVpnBadge(active) {
  if (chrome.browserAction && chrome.browserAction.setBadgeText) {
    if (active) {
      chrome.browserAction.setBadgeText({ text: "ON" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#10B981" }); // Bright Green
    } else {
      chrome.browserAction.setBadgeText({ text: "VPN" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#00F0FF" }); // Cyan Obsidion
    }
  }
}

// Initialize badge immediately
updateVpnBadge(false);

chrome.runtime.onInstalled?.addListener(() => {
  updateVpnBadge(false);
});

chrome.runtime.onStartup?.addListener(() => {
  updateVpnBadge(false);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "purge_tabs") {
    chrome.tabs.query({}, (tabs) => {
      let discarded = 0;
      for (const tab of tabs) {
        if (!tab.active && !tab.pinned && !tab.audible) {
          if (chrome.tabs.discard) {
            chrome.tabs.discard(tab.id);
            discarded++;
          }
        }
      }
      sendResponse({ status: "success", count: discarded });
    });
    return true; // async
  }

  if (request.action === "set_vpn") {
    isVpnActive = !!request.enabled;
    updateVpnBadge(isVpnActive);

    if (isVpnActive) {
      const config = {
        mode: "fixed_servers",
        rules: {
          singleProxy: {
            scheme: "socks5",
            host: "127.0.0.1",
            port: 40000
          },
          proxyDNS: true
        }
      };
      if (chrome.proxy && chrome.proxy.settings) {
        chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
          sendResponse({ status: "connected", host: "127.0.0.1:40000" });
        });
      } else {
        sendResponse({ status: "proxy_api_unavailable" });
      }
    } else {
      if (chrome.proxy && chrome.proxy.settings) {
        chrome.proxy.settings.clear({ scope: "regular" }, () => {
          sendResponse({ status: "disconnected" });
        });
      } else {
        sendResponse({ status: "disconnected" });
      }
    }
    return true; // async
  }

  if (request.action === "get_status") {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({
        vpnActive: isVpnActive,
        totalTabs: tabs.length,
        inactiveTabs: tabs.filter(t => !t.active).length
      });
    });
    return true;
  }
});
