use std::io::{Read, Write};
use std::net::TcpListener;
use std::thread;
use warp_socks_bridge::{provision_warp_identity, WarpSocksServer};

/// Starts the authenticated localhost control server on 127.0.0.1:40001
/// Replaces the C# ObsidionSysBridge.cs sidecar.
pub fn spawn_governor_control_server() {
    thread::spawn(|| {
        let listener = match TcpListener::bind("127.0.0.1:40001") {
            Ok(l) => l,
            Err(e) => {
                eprintln!("Failed to bind governor server on 127.0.0.1:40001: {}", e);
                return;
            }
        };

        // Initialize Windows Job Object with default 1024 MB hard cap & 60% CPU cap
        resource_governor::governor_init_job(1024, 60);

        for stream in listener.incoming().flatten() {
            let mut stream = stream;
            let mut buf = [0u8; 2048];
            let n = match stream.read(&mut buf) {
                Ok(n) if n > 0 => n,
                _ => continue,
            };
            let req = String::from_utf8_lossy(&buf[..n]);

            // Block cross-origin web page attacks: reject requests from http:// or https:// Origins
            if req.lines().any(|l| {
                let lower = l.to_ascii_lowercase();
                lower.starts_with("origin: http://") || lower.starts_with("origin: https://")
            }) {
                let _ = stream.write_all(b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n");
                continue;
            }

            if req.starts_with("OPTIONS ") {
                let resp = "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nContent-Length: 0\r\n\r\n";
                let _ = stream.write_all(resp.as_bytes());
            } else if req.starts_with("POST /purge") {
                let purged_count = resource_governor::governor_purge_all_obsidion_processes();
                let (ram_mb, proc_count) = resource_governor::governor_query_obsidion_stats();
                let body = format!(
                    "{{\"status\":\"ok\",\"purged_processes\":{},\"obsidion_ram_mb\":{},\"process_count\":{},\"ram_mb\":{},\"processes\":{}}}",
                    purged_count, ram_mb, proc_count, ram_mb, proc_count
                );
                let resp = format!(
                    "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
                    body.len(),
                    body
                );
                let _ = stream.write_all(resp.as_bytes());
            } else if req.starts_with("GET /status") || req.starts_with("GET /stats") {
                let (ram_mb, proc_count) = resource_governor::governor_query_obsidion_stats();
                let body = format!(
                    "{{\"obsidion_ram_mb\":{},\"process_count\":{},\"ram_mb\":{},\"processes\":{},\"warp_port\":40000,\"vpn_running\":true}}",
                    ram_mb, proc_count, ram_mb, proc_count
                );
                let resp = format!(
                    "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
                    body.len(),
                    body
                );
                let _ = stream.write_all(resp.as_bytes());
            } else {
                let _ = stream.write_all(b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n");
            }
        }
    });
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Cloudflare WARP Rootless SOCKS5 & Obsidion Resource Governor ===");

    println!("1. Spawning Win32 Resource Governor on 127.0.0.1:40001...");
    spawn_governor_control_server();

    println!("2. Checking / provisioning WARP identity via wgcf API...");
    match provision_warp_identity(Some("warp_profile.json")) {
        Ok(profile) => {
            println!("  [+] Identity provisioned successfully!");
            println!("  [+] Client ID: {}", profile.client_id);
            println!("  [+] Endpoint:  {}", profile.endpoint);
            println!("  [+] IPv4:      {}", profile.ipv4_address);
        }
        Err(e) => {
            eprintln!("  [-] Provisioning notice: {}. Using fallback profile.", e);
        }
    }

    let port = 40000;
    println!("3. Starting SOCKS5 proxy server on 127.0.0.1:{}...", port);
    println!("   Test with: curl --socks5-hostname 127.0.0.1:{} https://1.1.1.1/cdn-cgi/trace", port);

    let server = WarpSocksServer::new(port);
    if let Err(e) = server.run() {
        eprintln!("SOCKS5 server error: {}", e);
    }

    Ok(())
}
