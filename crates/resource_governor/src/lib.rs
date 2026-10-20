use std::ffi::c_void;
use std::mem::size_of;
use std::ptr::null_mut;
use std::sync::atomic::{AtomicIsize, Ordering};
use windows_sys::Win32::Foundation::{CloseHandle, BOOL, FALSE, HANDLE, TRUE};
use windows_sys::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
};
use windows_sys::Win32::System::JobObjects::{
    AssignProcessToJobObject, CreateJobObjectW, SetInformationJobObject,
    JobObjectCpuRateControlInformation, JobObjectExtendedLimitInformation,
    JOBOBJECT_CPU_RATE_CONTROL_INFORMATION, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
    JOB_OBJECT_CPU_RATE_CONTROL_ENABLE, JOB_OBJECT_CPU_RATE_CONTROL_HARD_CAP,
    JOB_OBJECT_LIMIT_JOB_MEMORY,
};
use windows_sys::Win32::System::Memory::SetProcessWorkingSetSizeEx;
use windows_sys::Win32::System::ProcessStatus::{EmptyWorkingSet, K32GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS};
use windows_sys::Win32::System::Threading::{
    OpenProcess, SetProcessInformation, ProcessPowerThrottling,
    PROCESS_POWER_THROTTLING_CURRENT_VERSION, PROCESS_POWER_THROTTLING_EXECUTION_SPEED,
    PROCESS_POWER_THROTTLING_STATE, PROCESS_QUERY_INFORMATION, PROCESS_SET_INFORMATION,
    PROCESS_SET_QUOTA, PROCESS_TERMINATE, PROCESS_VM_READ,
};

static GLOBAL_JOB_HANDLE: AtomicIsize = AtomicIsize::new(0);

/// Safe Rust wrapper to initialize or update the Win32 Job Object with RAM and CPU limits.
pub fn init_job(max_total_ram_mb: usize, max_cpu_percent: u32) -> Result<isize, &'static str> {
    unsafe {
        let mut handle = GLOBAL_JOB_HANDLE.load(Ordering::SeqCst) as HANDLE;
        if handle.is_null() {
            handle = CreateJobObjectW(null_mut(), null_mut());
            if handle.is_null() {
                return Err("Failed to create Job Object");
            }
            GLOBAL_JOB_HANDLE.store(handle as isize, Ordering::SeqCst);
        }

        // Apply RAM Cap if specified (> 0)
        if max_total_ram_mb > 0 {
            let mut limit_info: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = std::mem::zeroed();
            limit_info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_JOB_MEMORY;
            limit_info.JobMemoryLimit = max_total_ram_mb.saturating_mul(1024 * 1024);

            let res = SetInformationJobObject(
                handle,
                JobObjectExtendedLimitInformation,
                &limit_info as *const _ as *const c_void,
                size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
            );
            if res == 0 {
                return Err("Failed to set Job Object memory limit");
            }
        }

        // Apply CPU Rate Control Cap if specified (> 0 and <= 100)
        if max_cpu_percent > 0 && max_cpu_percent <= 100 {
            let mut cpu_info: JOBOBJECT_CPU_RATE_CONTROL_INFORMATION = std::mem::zeroed();
            cpu_info.ControlFlags =
                JOB_OBJECT_CPU_RATE_CONTROL_ENABLE | JOB_OBJECT_CPU_RATE_CONTROL_HARD_CAP;
            // The rate is specified in units of 0.01% (i.e., 100% = 10,000)
            cpu_info.Anonymous.CpuRate = max_cpu_percent * 100;

            let res = SetInformationJobObject(
                handle,
                JobObjectCpuRateControlInformation,
                &cpu_info as *const _ as *const c_void,
                size_of::<JOBOBJECT_CPU_RATE_CONTROL_INFORMATION>() as u32,
            );
            if res == 0 {
                return Err("Failed to set Job Object CPU rate control");
            }
        }

        Ok(handle as isize)
    }
}

/// Attach a process to the Job Object, optionally apply EcoQoS throttling, and trim physical RAM working set.
pub fn attach_and_throttle_pid(
    pid: u32,
    enable_ecoqos: bool,
    trim_working_set: bool,
) -> Result<(), &'static str> {
    unsafe {
        let job_handle = GLOBAL_JOB_HANDLE.load(Ordering::SeqCst) as HANDLE;

        let desired_access = PROCESS_SET_QUOTA
            | PROCESS_TERMINATE
            | PROCESS_SET_INFORMATION
            | PROCESS_QUERY_INFORMATION
            | PROCESS_VM_READ;

        let proc_handle = OpenProcess(desired_access, FALSE, pid);
        if proc_handle.is_null() {
            return Err("Failed to open process");
        }

        // Assign to Job Object if initialized
        if !job_handle.is_null() {
            let res = AssignProcessToJobObject(job_handle, proc_handle);
            if res == 0 {
                // If it's already assigned, ERROR_ACCESS_DENIED or similar might occur, but continue
            }
        }

        // Windows Efficiency Mode (EcoQoS) Power Throttling
        let mut throttling_state: PROCESS_POWER_THROTTLING_STATE = std::mem::zeroed();
        throttling_state.Version = PROCESS_POWER_THROTTLING_CURRENT_VERSION;
        throttling_state.ControlMask = PROCESS_POWER_THROTTLING_EXECUTION_SPEED;
        if enable_ecoqos {
            throttling_state.StateMask = PROCESS_POWER_THROTTLING_EXECUTION_SPEED;
        } else {
            throttling_state.StateMask = 0;
        }

        SetProcessInformation(
            proc_handle,
            ProcessPowerThrottling,
            &throttling_state as *const _ as *const c_void,
            size_of::<PROCESS_POWER_THROTTLING_STATE>() as u32,
        );

        // Reclaim physical RAM pages by trimming the working set
        if trim_working_set {
            EmptyWorkingSet(proc_handle);
            SetProcessWorkingSetSizeEx(proc_handle, usize::MAX, usize::MAX, 0);
        }

        CloseHandle(proc_handle);
        Ok(())
    }
}

/// Helper function to query the current Working Set Size (RSS) in bytes for a given PID.
pub fn get_process_rss(pid: u32) -> Result<usize, &'static str> {
    unsafe {
        let proc_handle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
        if proc_handle.is_null() {
            return Err("Failed to open process for query");
        }

        let mut pmc: PROCESS_MEMORY_COUNTERS = std::mem::zeroed();
        let success = K32GetProcessMemoryInfo(
            proc_handle,
            &mut pmc,
            size_of::<PROCESS_MEMORY_COUNTERS>() as u32,
        );

        CloseHandle(proc_handle);

        if success != 0 {
            Ok(pmc.WorkingSetSize)
        } else {
            Err("Failed to get process memory info")
        }
    }
}

// =========================================================================
// C-ABI FFI Exports for Gecko XPCOM Interop
// =========================================================================

#[no_mangle]
pub extern "C" fn governor_init_job(max_total_ram_mb: usize, max_cpu_percent: u32) -> BOOL {
    match init_job(max_total_ram_mb, max_cpu_percent) {
        Ok(_) => TRUE,
        Err(_) => FALSE,
    }
}

#[no_mangle]
pub extern "C" fn governor_attach_and_throttle_pid(
    pid: u32,
    enable_ecoqos: bool,
    trim_working_set: bool,
) -> BOOL {
    match attach_and_throttle_pid(pid, enable_ecoqos, trim_working_set) {
        Ok(_) => TRUE,
        Err(_) => FALSE,
    }
}

#[no_mangle]
pub extern "C" fn governor_get_pid_rss(pid: u32) -> usize {
    get_process_rss(pid).unwrap_or(0)
}

#[no_mangle]
pub extern "C" fn governor_query_obsidion_stats() -> (usize, usize) {
    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if snapshot.is_null() || snapshot == windows_sys::Win32::Foundation::INVALID_HANDLE_VALUE {
            return (0, 0);
        }

        let mut entry: PROCESSENTRY32W = std::mem::zeroed();
        entry.dwSize = size_of::<PROCESSENTRY32W>() as u32;

        let mut total_bytes: usize = 0;
        let mut count: usize = 0;

        if Process32FirstW(snapshot, &mut entry) != 0 {
            loop {
                let name = String::from_utf16_lossy(&entry.szExeFile);
                let lower = name.trim_matches('\0').to_ascii_lowercase();
                if lower == "obsidion.exe" || lower == "firefox.exe" {
                    if let Ok(bytes) = get_process_rss(entry.th32ProcessID) {
                        total_bytes += bytes;
                        count += 1;
                    }
                }

                if Process32NextW(snapshot, &mut entry) == 0 {
                    break;
                }
            }
        }

        CloseHandle(snapshot);
        (total_bytes / (1024 * 1024), count)
    }
}

#[no_mangle]
pub extern "C" fn governor_purge_all_obsidion_processes() -> usize {
    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if snapshot.is_null() || snapshot == windows_sys::Win32::Foundation::INVALID_HANDLE_VALUE {
            return 0;
        }

        let mut entry: PROCESSENTRY32W = std::mem::zeroed();
        entry.dwSize = size_of::<PROCESSENTRY32W>() as u32;

        let mut count: usize = 0;

        if Process32FirstW(snapshot, &mut entry) != 0 {
            loop {
                let name = String::from_utf16_lossy(&entry.szExeFile);
                let lower = name.trim_matches('\0').to_ascii_lowercase();
                if lower == "obsidion.exe" || lower == "firefox.exe" {
                    let desired_access = PROCESS_SET_QUOTA | PROCESS_QUERY_INFORMATION;
                    let proc_handle = OpenProcess(desired_access, FALSE, entry.th32ProcessID);
                    if !proc_handle.is_null() {
                        EmptyWorkingSet(proc_handle);
                        SetProcessWorkingSetSizeEx(proc_handle, usize::MAX, usize::MAX, 0);
                        CloseHandle(proc_handle);
                        count += 1;
                    }
                }

                if Process32NextW(snapshot, &mut entry) == 0 {
                    break;
                }
            }
        }

        CloseHandle(snapshot);
        count
    }
}

