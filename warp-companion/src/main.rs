use warp_companion::{provision_warp_identity, WarpSocksServer};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("============================================================");
    println!("     OBSIDION - Cloudflare WARP SOCKS5 Userspace Proxy      ");
    println!("============================================================");

    println!("1. Checking / provisioning WARP identity via wgcf API...");
    match provision_warp_identity(Some("warp_profile.json")) {
        Ok(profile) => {
            println!("  [+] WARP Identity active!");
            println!("  [+] Client ID: {}", profile.client_id);
            println!("  [+] Endpoint:  {}", profile.endpoint);
            println!("  [+] IPv4:      {}", profile.ipv4_address);
        }
        Err(e) => {
            eprintln!("  [-] Notice: {}. Using fallback profile.", e);
        }
    }

    let port = 40000;
    println!("\n2. Starting local SOCKS5 proxy server on 127.0.0.1:{}...", port);
    println!("   Test with: curl.exe --socks5-hostname 127.0.0.1:{} https://1.1.1.1/cdn-cgi/trace", port);
    println!("   Obsidion Extension routes through this proxy when VPN is ON.\n");

    let server = WarpSocksServer::new(port);
    if let Err(e) = server.run() {
        eprintln!("SOCKS5 server error: {}", e);
    }

    Ok(())
}
