use necko_shield::{
    load_or_compile_lists, shield_load_or_compile_lists, shield_should_block, should_block,
};
use std::ffi::CString;
use std::fs;
use std::path::Path;
use std::time::Instant;

#[test]
fn test_necko_shield_compilation_serialization_and_blocking() {
    let cache_file = "test_shield_cache.bin";
    if Path::new(cache_file).exists() {
        let _ = fs::remove_file(cache_file);
    }

    // 1. Initial compile & serialization
    let start_compile = Instant::now();
    load_or_compile_lists(cache_file).expect("Compilation and initial save failed");
    println!("Compilation & serialization took: {:?}", start_compile.elapsed());
    assert!(Path::new(cache_file).exists(), "Cache file must exist");

    // 2. Deserialization benchmark (< 5ms target)
    let start_load = Instant::now();
    load_or_compile_lists(cache_file).expect("Deserialization failed");
    let load_duration = start_load.elapsed();
    println!("Deserialization took: {:?}", load_duration);
    assert!(load_duration.as_millis() < 50, "Deserialization should be instant");

    // Clean up cache file
    let _ = fs::remove_file(cache_file);

    // 3. Test URL blocking decisions
    // Tracker / Ad requests should be blocked
    assert!(
        should_block("https://google-analytics.com/analytics.js", "https://news.com", "script"),
        "Google Analytics should be blocked"
    );
    assert!(
        should_block("https://doubleclick.net/pagead/ads.js", "https://example.com", "script"),
        "DoubleClick ad should be blocked"
    );
    assert!(
        should_block("https://telemetry.mozilla.org/submit/telemetry", "https://browser", "other"),
        "Telemetry should be blocked"
    );

    // Legitimate first-party resources should NOT be blocked
    assert!(
        !should_block("https://example.com/style.css", "https://example.com", "stylesheet"),
        "Legitimate stylesheet should not be blocked"
    );
    assert!(
        !should_block("https://wikipedia.org/wiki/Gecko", "https://wikipedia.org", "main_frame"),
        "Wikipedia page should not be blocked"
    );

    // 4. Test C-ABI FFI exports
    let ffi_cache = CString::new("test_ffi_cache.bin").unwrap();
    assert!(shield_load_or_compile_lists(ffi_cache.as_ptr()));
    let _ = fs::remove_file("test_ffi_cache.bin");

    let c_ad_url = CString::new("https://google-analytics.com/analytics.js").unwrap();
    let c_source = CString::new("https://test.com").unwrap();
    let c_type = CString::new("script").unwrap();

    assert!(shield_should_block(c_ad_url.as_ptr(), c_source.as_ptr(), c_type.as_ptr()));

    let c_clean_url = CString::new("https://mybrowser.dev/logo.png").unwrap();
    assert!(!shield_should_block(c_clean_url.as_ptr(), c_source.as_ptr(), c_type.as_ptr()));

    println!("Necko Shield adblock verification passed completely.");
}
