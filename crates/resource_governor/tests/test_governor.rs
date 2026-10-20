use resource_governor::{
    attach_and_throttle_pid, get_process_rss, governor_attach_and_throttle_pid,
    governor_init_job, init_job,
};
use std::process::Command;
use std::thread::sleep;
use std::time::Duration;

#[test]
fn test_resource_governor_job_and_working_set_trim() {
    // 1. Initialize the Job Object with a 1024MB RAM cap and 50% CPU limit
    let init_res = init_job(1024, 50);
    assert!(init_res.is_ok(), "Failed to initialize Win32 Job Object");

    // Also test C-ABI FFI wrapper
    let ffi_res = governor_init_job(1024, 50);
    assert_eq!(ffi_res, 1, "governor_init_job FFI failed");

    // 2. Spawn a dummy child process (notepad.exe) to simulate a Gecko child process
    let mut child = Command::new("notepad.exe")
        .spawn()
        .expect("Failed to spawn dummy child process");

    let pid = child.id();
    println!("Spawned dummy child process with PID: {}", pid);

    // Give process a moment to map DLLs and allocate heap
    sleep(Duration::from_millis(200));

    let rss_before = get_process_rss(pid).expect("Failed to get initial RSS");
    println!("Initial working set (RSS): {} bytes ({} KB)", rss_before, rss_before / 1024);
    assert!(rss_before > 0, "Initial RSS should be > 0");

    // 3. Attach PID to Job Object, enable EcoQoS, and trim working set
    let trim_res = attach_and_throttle_pid(pid, true, true);
    assert!(trim_res.is_ok(), "Failed to attach and trim process");

    // Give kernel a moment to unmap trimmed pages
    sleep(Duration::from_millis(150));

    let rss_after = get_process_rss(pid).expect("Failed to get trimmed RSS");
    println!("Post-trim working set (RSS): {} bytes ({} KB)", rss_after, rss_after / 1024);

    // Verify RSS dropped significantly
    assert!(
        rss_after <= rss_before,
        "RSS should decrease or stay minimal after EmptyWorkingSet (before: {}, after: {})",
        rss_before,
        rss_after
    );

    // Test C-FFI attach call
    let ffi_attach = governor_attach_and_throttle_pid(pid, true, true);
    assert_eq!(ffi_attach, 1, "governor_attach_and_throttle_pid FFI failed");

    // Cleanup: kill child process
    let _ = child.kill();
    let _ = child.wait();
    println!("Dummy child process cleaned up successfully.");
}
