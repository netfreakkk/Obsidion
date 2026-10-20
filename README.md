# Obsidion Browser

> **A lean, privacy-first, high-fluidity Windows web browser based on Mozilla Gecko 158, `@zen-browser/surfer`, and native Rust/C++.**

---

## ⚡ Overview & Architectural Goals

Obsidion is engineered from the ground up to eliminate the memory bloat, telemetry, and CPU overhead present in standard modern web browsers while maintaining complete Web standard and extension compatibility.

- **Sub-350MB Cold/Static RAM Footprint:** Aggressive process pool consolidation, inlined media decoding, and 32MB capped memory cache cuts typical browser memory consumption by ~65%.
- **Zero-Latency Network Filter (`necko_shield`):** In-engine ad and tracker blocking implemented in Rust via a high-performance C-ABI bridge hooked directly into Gecko's `nsHttpChannel::AsyncOpen`.
- **Rootless Userspace Cloudflare WARP VPN (`warp_socks_bridge`):** Built-in WireGuard SOCKS5 proxy running entirely in userspace with remote DNS resolution (`127.0.0.1:40000`).
- **Obsidian Pure Dark UI (`#0B0F17`) & Floating Island:** "Floating Island" web viewport with rounded corners (`12px`), dark glass shadow, centered floating pill URL bar, and native 120Hz vertical tabs.
- **Opera GX-Style Sidebar Hub:** Full-height Obsidion Core Hub with circular animated RAM capacity gauge, hard cap slider, CPU rate limiter with EcoQoS, Cloudflare WARP VPN toggle with live ping, Necko Shield live ad counter, Web Audio API synthesized cybernetic sound FX, Lo-Fi chill beats stream, and dynamic accent color glow picker.
- **Curated Startpage & Intelligence Hub (`about:newtab`):** Completely clean startpage free of random sponsored links or explore feeds; features a digital cyber clock, live weather widget, and curated Tech & Cinema news tabs.
- **Complete Rebranding & Windows Integration:** All executables (`obsidion.exe`, `plugin-container.exe`, `private_browsing.exe`, `default-browser-agent.exe`) have their Win32 PE version resources compiled to `Obsidion`, ensuring Windows Task Manager and OS task lists display `Obsidion` exclusively with the surreal minimalist crystal monolith icon.

---

## 📁 Repository Structure

```
MyBrowser/
├── crates/
│   ├── necko_shield/         # Native Rust adblock engine (C-ABI hooked into Gecko Necko)
│   ├── resource_governor/    # Win32 Job Objects & EcoQoS background process throttle
│   └── warp_socks_bridge/    # Userspace SOCKS5 WireGuard tunnel for Cloudflare WARP
├── distribution/
│   ├── policies.json         # Enterprise distribution policies & extension settings
│   └── extensions/
│       └── obsidion-hud@obsidion.org/  # Live GX Resource HUD & WARP VPN toolbar panel
├── patches/
│   └── 01-necko-adblock-rust.patch     # Gecko C++ patch for Necko async open interception
├── src/
│   └── browser/
│       ├── app/profile/vendor.js       # Hardened vendor preferences (RAM caps, dark mode)
│       └── chrome/                     # userChrome.css & userContent.css Obsidian styling
├── configs/                  # Build configurations & mozconfig templates
├── Launch_Obsidion.bat       # Launcher script initiating WARP proxy & browser
├── surfer.json               # Surfer build definition
└── Cargo.toml                # Rust workspace configuration
```

---

## 🚀 Native Rust Crates

### 1. `necko_shield`
- **Location:** `crates/necko_shield/`
- **Purpose:** In-engine network blocker. Exposes `shield_should_block(url, source_url, request_type)` over C-ABI to Gecko C++. Blocks trackers and ad requests prior to TCP socket creation, saving bandwidth and rendering time.

### 2. `warp_socks_bridge`
- **Location:** `crates/warp_socks_bridge/`
- **Purpose:** Standalone userspace WireGuard proxy. Automatically provisions WARP credentials via Cloudflare's consumer registration flow and exposes an authenticated SOCKS5 proxy on `127.0.0.1:40000` with remote DNS resolution (`network.proxy.socks_remote_dns = true`).

### 3. `resource_governor`
- **Location:** `crates/resource_governor/`
- **Purpose:** Windows Win32 memory and process governor. Employs Win32 Job Objects (`JOB_OBJECT_LIMIT_PROCESS_MEMORY`), EcoQoS power throttling (`SetProcessInformation`), and physical working set trimming (`EmptyWorkingSet`).

---

## 🎨 Interface & GX HUD

- **Obsidian Dark Canvas:** Configured with `#0B0F17` canvas background, `#182235` card containers, and glowing cyan `#00F0FF` URL focus state.
- **Native Vertical Tabs:** Native Gecko 158 sidebar revamp enabled via `sidebar.revamp = true` and `sidebar.verticalTabs = true`.
- **GX Resource HUD:** Toolbar and sidebar panel providing live RAM caps, CPU rate limiting, tab discarding, and Cloudflare WARP VPN toggle.

---

## 🛠️ Building & Running

### Prerequisites
- Windows 10/11 x86_64
- Visual Studio 2022 (MSVC 14.4x toolchain + Windows 11 SDK)
- Rust (edition 2021/2024, `x86_64-pc-windows-msvc` target)
- Python 3 & MozillaBuild / Surfer toolchain

### Build Commands
```powershell
# 1. Build native Rust crates in release mode
cargo build --release

# 2. Build Gecko engine via Surfer / mozconfig
./build_browser.bat

# 3. Launch Obsidion
./Launch_Obsidion.bat
```

---

## 🔒 Privacy & Hardening Guarantees
- Zero telemetry, Mozilla studies, Pocket, or Normandy experiments enabled.
- WebRTC IP leak protection via `media.peerconnection.ice.proxy_only = true`.
- Native ad blocking hooked directly into the network stack before network requests leave the browser.
