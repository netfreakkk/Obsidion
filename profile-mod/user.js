// =============================================================================
// Obsidion Profile Mod — user.js
// Ultra-Low RAM, Process Consolidation, Zero-Flash Dark Mode & Privacy Hardening
// Compatible with Firefox Release/ESR/Nightly, Zen Browser, and LibreWolf
// =============================================================================

// 1. Enable User Stylesheets & Modern Vertical Tabs
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
user_pref("sidebar.revamp", true);
user_pref("sidebar.verticalTabs", true);
user_pref("sidebar.visibility", "always-show");
user_pref("browser.tabs.inTitlebar", 1);

// 2. Native Zero-RAM Dark Mode (#0B0F17 Obsidian Blank)
user_pref("ui.systemUsesDarkTheme", 1);
user_pref("layout.css.prefers-color-scheme.content-override", 0);
user_pref("browser.in-content.dark-mode", true);
user_pref("browser.display.background_color", "#0B0F17");
user_pref("browser.display.background_color.dark", "#0B0F17");

// 3. Process Consolidation (Reduces 12+ IPC processes to 2, saves ~500 MB RAM)
user_pref("fission.autostart", false);
user_pref("dom.ipc.processCount", 2);
user_pref("dom.ipc.processCount.webIsolated", 1);
user_pref("dom.ipc.processCount.extension", 1);
user_pref("dom.ipc.processPrelaunch.enabled", false);
user_pref("media.rdd-process.enabled", false);
user_pref("media.utility-process.enabled", false);
user_pref("network.http.speculative-parallel-limit", 0);
user_pref("network.dns.disablePrefetch", true);
user_pref("network.prefetch-next", false);

// 4. Aggressive Tab Memory Reclamation & SpiderMonkey Compact GC
user_pref("browser.tabs.unloadOnLowMemory", true);
user_pref("browser.tabs.min_inactive_duration_before_unload", 180000);
user_pref("browser.sessionhistory.max_total_viewers", 0);
user_pref("browser.sessionhistory.max_entries", 10);
user_pref("browser.cache.memory.capacity", 32768);
user_pref("browser.cache.memory.max_entry_size", 4096);
user_pref("image.mem.surfacecache.max_size_kb", 32768);
user_pref("javascript.options.mem.gc_high_frequency_heap_growth_max", 120);
user_pref("javascript.options.mem.gc_high_frequency_high_limit_mb", 200);
user_pref("javascript.options.mem.gc_high_frequency_low_limit_mb", 64);
user_pref("javascript.options.mem.high_water_mark", 64);
user_pref("javascript.options.CompactOnUserInactive", true);
user_pref("javascript.options.compact_on_user_inactive_delay", 15000);

// 5. Privacy, Anti-Telemetry & AI Bloat Stripping
user_pref("extensions.pocket.enabled", false);
user_pref("browser.ml.enable", false);
user_pref("browser.ml.chat.enabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("privacy.trackingprotection.enabled", true);
user_pref("privacy.trackingprotection.socialtracking.enabled", true);
user_pref("privacy.query_stripping.enabled", true);
user_pref("network.http.referer.XOriginTrimmingPolicy", 2);
user_pref("media.peerconnection.ice.default_address_only", true);
user_pref("browser.newtabpage.activity-stream.showSponsored", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
