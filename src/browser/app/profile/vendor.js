// Obsidion Browser — Default Profile Preferences
pref("sidebar.revamp", true);
pref("sidebar.verticalTabs", true);
pref("sidebar.visibility", "always-show");
pref("browser.tabs.inTitlebar", 1);
pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);

// Native Zero-RAM Dark Mode
pref("ui.systemUsesDarkTheme", 1);
pref("layout.css.prefers-color-scheme.content-override", 0);
pref("browser.in-content.dark-mode", true);
pref("browser.display.background_color", "#0B0F17");
pref("browser.display.background_color.dark", "#0B0F17");

// Strict Process Consolidation (Disables Fission Per-Site Process Spawning)
pref("fission.autostart", false);
pref("dom.ipc.processCount", 2);
pref("dom.ipc.processCount.webIsolated", 1);
pref("dom.ipc.processCount.extension", 1);
pref("dom.ipc.processPrelaunch.enabled", false);
pref("media.rdd-process.enabled", false);
pref("media.utility-process.enabled", false);
pref("network.http.speculative-parallel-limit", 0);
pref("network.dns.disablePrefetch", true);
pref("network.prefetch-next", false);

// Aggressive Tab Unloading & SpiderMonkey GC Compaction
pref("browser.tabs.unloadOnLowMemory", true);
pref("browser.tabs.min_inactive_duration_before_unload", 180000);
pref("browser.sessionhistory.max_total_viewers", 0);
pref("browser.sessionhistory.max_entries", 10);
pref("browser.cache.memory.capacity", 32768);
pref("browser.cache.memory.max_entry_size", 4096);
pref("image.mem.surfacecache.max_size_kb", 32768);
pref("javascript.options.mem.gc_high_frequency_heap_growth_max", 120);
pref("javascript.options.mem.gc_high_frequency_high_limit_mb", 200);
pref("javascript.options.mem.gc_high_frequency_low_limit_mb", 64);
pref("javascript.options.mem.high_water_mark", 64);
pref("javascript.options.CompactOnUserInactive", true);
pref("javascript.options.compact_on_user_inactive_delay", 15000);

// Privacy Hardening & Telemetry Strip
pref("extensions.pocket.enabled", false);
pref("browser.ml.enable", false);
pref("browser.ml.chat.enabled", false);
pref("toolkit.telemetry.enabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("privacy.trackingprotection.enabled", true);
pref("privacy.trackingprotection.socialtracking.enabled", true);
pref("privacy.query_stripping.enabled", true);
pref("network.http.referer.XOriginTrimmingPolicy", 2);
pref("media.peerconnection.ice.default_address_only", true);
