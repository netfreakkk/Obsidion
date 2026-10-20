@echo off
title MyBrowser - Compiling Custom Gecko Browser
echo =====================================================================
echo  MyBrowser - Building Lean Gecko Browser (Firefox 158.0 + Rust/C++)
echo =====================================================================
echo.
set PATH=C:\Program Files\7-Zip;C:\mozilla-build\bin;C:\mozilla-build\python3;%PATH%

echo 1. Verifying environment...
if not exist "C:\mozilla-build\start-shell.bat" (
    echo [ERROR] C:\mozilla-build not found.
    pause
    exit /b 1
)

echo 2. Ensuring custom patches and configs are imported...
call npx.cmd @zen-browser/surfer import

echo.
echo 3. Launching Mach build with Clang-CL and Rust LTO...
call npx.cmd @zen-browser/surfer build

echo.
echo 4. Deploying vendor preferences, policies, and distribution configs...
if exist "engine\obj-x86_64-pc-windows-msvc\dist\bin" (
    if not exist "engine\obj-x86_64-pc-windows-msvc\dist\bin\defaults\pref" mkdir "engine\obj-x86_64-pc-windows-msvc\dist\bin\defaults\pref"
    if not exist "engine\obj-x86_64-pc-windows-msvc\dist\bin\distribution" mkdir "engine\obj-x86_64-pc-windows-msvc\dist\bin\distribution"
    copy /y "src\browser\app\profile\vendor.js" "engine\obj-x86_64-pc-windows-msvc\dist\bin\defaults\pref\vendor.js"
    copy /y "distribution\policies.json" "engine\obj-x86_64-pc-windows-msvc\dist\bin\distribution\policies.json"
)

echo.
echo =====================================================================
echo Build process finished!
echo =====================================================================
pause
