use adblock::engine::Engine;
use adblock::request::Request;
use std::ffi::{c_char, CStr};
use std::fs;
use std::path::Path;
use std::sync::RwLock;

static GLOBAL_ENGINE: RwLock<Option<Engine>> = RwLock::new(None);

/// Default built-in tracker and telemetry blocking rules (EasyList / EasyPrivacy subset)
const DEFAULT_RULES: &str = r#"
||google-analytics.com^
||analytics.google.com^
||googletagmanager.com^
||doubleclick.net^
||adnxs.com^
||criteo.com^
||scorecardresearch.com^
||facebook.com/tr/*
||telemetry.mozilla.org^
||incoming.telemetry.mozilla.org^
||tracking.*^
||ads.*^
/tracker.js
/analytics.js
"#;

/// Loads a serialized Engine from cache or compiles EasyList/EasyPrivacy filter rules and saves the cache.
pub fn load_or_compile_lists(cache_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let path = Path::new(cache_path);
    if path.exists() {
        if let Ok(bytes) = fs::read(path) {
            let mut engine = Engine::default();
            if engine.deserialize(&bytes).is_ok() {
                let mut lock = GLOBAL_ENGINE.write().map_err(|_| "Lock poisoned")?;
                *lock = Some(engine);
                return Ok(());
            }
        }
    }

    // Compile engine from list text
    let engine = Engine::new_with_list_text(DEFAULT_RULES);

    // Serialize engine to disk for sub-5ms instant boot
    let serialized = engine.serialize();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(path, serialized);

    let mut lock = GLOBAL_ENGINE.write().map_err(|_| "Lock poisoned")?;
    *lock = Some(engine);
    Ok(())
}

/// Checks if a network request matching url, source_url, and request_type should be blocked.
pub fn should_block(url: &str, source_url: &str, request_type: &str) -> bool {
    let lock = match GLOBAL_ENGINE.read() {
        Ok(l) => l,
        Err(_) => return false,
    };

    if let Some(ref engine) = *lock {
        if let Ok(request) = Request::new(url, source_url, request_type, "GET") {
            let result = engine.check_network_request(&request);
            // Matched if a filter rule was found and no exception allowed it
            result.filter.is_some() && result.exception.is_none()
        } else {
            false
        }
    } else {
        false
    }
}

// =========================================================================
// C-ABI FFI Exports for Gecko Necko (nsHttpChannel.cpp)
// =========================================================================

#[no_mangle]
pub extern "C" fn shield_load_or_compile_lists(cache_path: *const c_char) -> bool {
    let path = if cache_path.is_null() {
        "shield_cache.bin"
    } else {
        unsafe {
            match CStr::from_ptr(cache_path).to_str() {
                Ok(s) => s,
                Err(_) => "shield_cache.bin",
            }
        }
    };

    load_or_compile_lists(path).is_ok()
}

#[no_mangle]
pub extern "C" fn shield_should_block(
    url: *const c_char,
    source_url: *const c_char,
    request_type: *const c_char,
) -> bool {
    if url.is_null() {
        return false;
    }

    let url_str = unsafe {
        match CStr::from_ptr(url).to_str() {
            Ok(s) => s,
            Err(_) => return false,
        }
    };

    let source_str = if source_url.is_null() {
        ""
    } else {
        unsafe { CStr::from_ptr(source_url).to_str().unwrap_or("") }
    };

    let req_type_str = if request_type.is_null() {
        "other"
    } else {
        unsafe { CStr::from_ptr(request_type).to_str().unwrap_or("other") }
    };

    should_block(url_str, source_str, req_type_str)
}
