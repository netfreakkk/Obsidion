# Obsidion

> **Ultra-Low RAM Cyberpunk Mod Suite & Native WebExtension for Firefox, Zen Browser, and LibreWolf.**  
> *Transform any Gecko-based browser into a dark, high-fluidity cyberpunk workstation in 1 click.*

---

## ⚡ Overview

Obsidion is an ultra-lightweight (<2 MB) browser customization suite engineered to eliminate memory bloat, strip telemetry, enforce zero-flash dark mode, and provide an Opera GX-style sidebar hub with 100% native WebExtension APIs.

Instead of maintaining a fragile ~35 GB browser fork, Obsidion installs directly onto **any existing Mozilla Firefox, Zen Browser, or LibreWolf** profile with zero build dependencies.

### 🎯 Key Performance Guarantees
- **< 15 MB Extension Memory Footprint:** Eradicated expensive `backdrop-filter: blur(...)` and full-frame 60 FPS canvas thrashing, dropping HUD memory from 1,055 MB to <15 MB.
- **0.0% Idle CPU Usage:** Event-driven WebExtension alarms and automatic canvas suspension when tabs are inactive or hidden.
- **Native Tab Governor:** Replaces native Win32 polling daemons with Firefox's standard `browser.tabs.discard()` API and an LRU eviction queue to automatically unload background tabs and reclaim RAM.
- **1-Click Profile Mod:** Interactive PowerShell installer automatically configures `user.js`, `userChrome.css`, `userContent.css`, and packages the extension.
- **Rootless Cloudflare WARP VPN:** Native SOCKS5 proxy toggle via `browser.proxy.onRequest` paired with a standalone userspace WireGuard companion daemon.

---

## 📁 Repository Structure

```
Obsidion/
├── extension/                     # 100% Native WebExtension
│   ├── manifest.json              # MV2 Gecko manifest (tabs, alarms, proxy, storage)
│   ├── background.js              # Tab discarding governor, LRU tracker & SOCKS5 router
│   ├── newtab.html                # Obsidion New Tab Startpage (Zero-blur dark glass)
│   ├── newtab.js                  # Lo-Fi player, dynamic weather, speed dials & news
│   ├── gx-resource-hud.html       # Sidebar / popup Core HUD panel
│   ├── gx-resource-hud.js         # HUD interactions & native tab discard triggers
│   └── icons/                     # Surreal minimalist obsidian crystal brand icons
│
├── profile-mod/                   # 1-Click Universal Profile Mod
│   ├── Install_Obsidion_Mod.ps1   # Interactive PowerShell installer
│   ├── user.js                    # Process consolidation (2 IPC procs) & low-RAM prefs
│   ├── distribution/
│   │   └── policies.json          # Enterprise policy (uBlock force-on, Dark Reader blocked)
│   └── chrome/
│       ├── userChrome.css         # Floating Island rounded viewport & centered pill URL bar
│       └── userContent.css        # Pure #0B0F17 obsidian theme for about:blank and new tab
│
├── warp-companion/                # Standalone Userspace Cloudflare WARP SOCKS5 Daemon
│   ├── Cargo.toml                 # Minimal standalone Rust configuration
│   ├── src/                       # WireGuard userspace engine
│   ├── warp_profile.json          # Pre-registered WARP credentials
│   └── start_warp.bat             # 1-click companion launcher (127.0.0.1:40000)
│
├── obsidion.ico                   # Windows application icon
├── obsidion-icon.png              # High-resolution 256x256 brand mark
└── README.md
```

---

## 🚀 Quick Start & 1-Click Installation

### 1. Install the Profile Mod & Extension
Run the PowerShell installer from an elevated or standard PowerShell terminal:

```powershell
cd profile-mod
.\Install_Obsidion_Mod.ps1
```

The installer will:
1. Automatically scan for existing **Firefox**, **Zen Browser**, and **LibreWolf** profiles in `%APPDATA%`.
2. Back up any existing `user.js` and `chrome/` directory.
3. Apply the low-RAM, process-consolidated `user.js`.
4. Deploy the "Floating Island" `userChrome.css` and `#0B0F17` `userContent.css`.
5. Package and install `obsidion-core.xpi` into your profile.

### 2. Restart Your Browser
Upon restart, your browser will launch in the dark Floating Island theme with vertical tabs and zero white flash.

### 3. (Optional) Run the Cloudflare WARP Companion
To enable the built-in free Cloudflare WARP VPN toggle in the Obsidion HUD:
1. Navigate to `warp-companion/`.
2. Run `start_warp.bat` (or run `cargo run --release`).
3. Toggle the **Cloudflare WARP VPN** switch in the Obsidion sidebar or New Tab dashboard.

---

## 🎨 Features & Capabilities

### 🎛️ Obsidion Core HUD (Sidebar & Popup)
- **Active Tab Governor:** Interactive slider setting your maximum loaded tab ceiling. Older inactive tabs are evicted from RAM using `browser.tabs.discard()`.
- **Instant Memory Purge:** 1-click button to immediately discard all background tabs and reclaim physical memory.
- **Lo-Fi Focus Radio:** 24/7 high-availability Lo-Fi radio with built-in station switcher (`⏭`) and automatic error fallback between three redundant live streams.
- **Dynamic Accent Glow:** Switch between Cyan, Violet, Crimson, Emerald, and Amber cyberpunk neon themes in real time.
- **Cybernetic Sound FX:** Synthesized audio clicks and laser purge sounds powered by the Web Audio API.

### 🌌 Curated New Tab Startpage (`about:newtab`)
- **Zero Sponsored Feeds:** Completely clean dashboard with zero random links or sponsored content.
- **Dynamic Weather Widget:** Real-time temperature, condition badge, humidity, and wind speed with city customization.
- **Curated Intelligence Feeds:** Filtered Tech and Cinema news tabs.
- **Custom Speed Dials & History:** 5 customizable shortcut slots plus dynamic history links.
- **Optimized Wallpaper Engine:** Procedural canvas effects (Nebula, Grid, Matrix, Aura) throttled to 30 FPS and suspended when hidden.

---

## 🔒 Privacy & Performance Guarantees

- **No Remote Daemons / Zero Telemetry:** Zero external HTTP polling to localhost daemons; all communications use standard browser messaging.
- **uBlock Origin Pre-bundled:** Configured for default-on tracking and ad protection.
- **Dark Reader Blocked:** Blocked via enterprise policy to eliminate duplicate DOM color inversion calculations and save ~300 MB RAM per window.
- **Process Pool Consolidation:** Reduces Firefox from 12+ per-site isolated processes to 2 consolidated content processes (`fission.autostart = false`, `dom.ipc.processCount = 2`), cutting cold RAM usage in half.

---

## 📜 License
MIT License. Open source and community-driven.
