use warp_socks_bridge::{
    provision_warp_identity, warp_bridge_is_running, warp_bridge_provision, warp_bridge_start,
    warp_bridge_stop,
};
use std::io::{Read, Write};
use std::net::TcpStream;
use std::thread::sleep;
use std::time::Duration;

#[test]
fn test_warp_provision_and_socks5_server() {
    let temp_profile = "test_warp_profile.json";
    if std::path::Path::new(temp_profile).exists() {
        let _ = std::fs::remove_file(temp_profile);
    }

    // 1. Test provisioning logic
    let profile = provision_warp_identity(Some(temp_profile))
        .expect("Provisioning should succeed (with network or fallback)");

    assert!(!profile.public_key.is_empty(), "Public key should be populated");
    assert!(!profile.private_key.is_empty(), "Private key should be populated");
    assert!(std::path::Path::new(temp_profile).exists(), "Profile file should be written");

    // Clean up temp file
    let _ = std::fs::remove_file(temp_profile);

    // 2. Test C-FFI provisioning
    assert!(warp_bridge_provision(), "warp_bridge_provision should return true");

    // 3. Test SOCKS5 Server lifecycle
    let test_port = 40001;
    let started = warp_bridge_start(test_port);
    assert!(started, "warp_bridge_start should succeed");
    sleep(Duration::from_millis(300));
    assert!(warp_bridge_is_running(), "Bridge should report running");

    // 4. Test SOCKS5 handshake (RFC 1928) against 127.0.0.1:test_port
    let mut client = TcpStream::connect(format!("127.0.0.1:{}", test_port))
        .expect("Failed to connect to SOCKS5 server");

    // Send greeting: VER 5, 1 method: NO AUTH (0)
    client.write_all(&[0x05, 0x01, 0x00]).expect("Failed to write greeting");

    let mut response = [0u8; 2];
    client.read_exact(&mut response).expect("Failed to read server greeting response");
    assert_eq!(response, [0x05, 0x00], "Expected SOCKS5 NO AUTH acceptance");

    // 5. Test stop
    let stopped = warp_bridge_stop();
    assert!(stopped, "warp_bridge_stop should return true");
    sleep(Duration::from_millis(200));
    assert!(!warp_bridge_is_running(), "Bridge should report stopped");
    println!("WARP SOCKS5 bridge verified successfully.");
}
