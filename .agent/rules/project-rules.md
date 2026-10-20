# Project Architecture & Agent Rules
You are building a lean, privacy-first, high-fluidity Windows web browser based on Mozilla Gecko (Firefox Release/ESR) using `@zen-browser/surfer` and Rust/C++.

## Hard Engineering Constraints
1. NEVER traverse or bulk-read the `./engine/` directory. Only inspect specific files inside `./engine/` using targeted `rg` or line-bounded reads when creating a `.patch`.
2. Do NOT modify completed crates once their verification tests pass unless explicitly instructed.
3. Build all custom native logic in Rust (edition 2021/2024) inside `./crates/` as standalone testable libraries first, exposing thin C-ABI (`extern "C"`) or Rust XPCOM bridges to Gecko C++.
4. Enforce strict memory efficiency:
   - Use Win32 Job Objects (`SetInformationJobObject` with `JOB_OBJECT_LIMIT_PROCESS_MEMORY` and `JOB_OBJECT_LIMIT_JOB_MEMORY`) for hard RAM caps.
   - Use `SetProcessInformation` (`ProcessPowerThrottling` / EcoQoS) paired with DOM tab unloading and `EmptyWorkingSet` / `SetProcessWorkingSetSizeEx` to reclaim physical pages from idle background tabs.
5. Keep the VPN 100% userspace and rootless:
   - Provision free Cloudflare WARP WireGuard credentials via the `wgcf` consumer registration flow.
   - Run the WireGuard tunnel in userspace (`boringtun` / `wireproxy` architecture) exposed as an authenticated localhost SOCKS5 proxy (`127.0.0.1`), routing Gecko via `network.proxy.socks` and `network.proxy.socks_remote_dns = true`.
6. Pre-bundle `uBlock Origin` and `Dark Reader` via `distribution/policies.json` (`ExtensionSettings`), and force native dark mode via `layout.css.prefers-color-scheme.content-override = 0` and `#0B0F17` `about:blank` styling.
