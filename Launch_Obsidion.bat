@echo off
setlocal
set "BIN_DIR=%~dp0engine\obj-x86_64-pc-windows-msvc\dist\bin"

rem Start unified Rust WARP SOCKS5 + Resource Governor daemon (ports 40000 & 40001)
tasklist /fi "imagename eq warp_socks_bridge.exe" 2>NUL | find /i "warp_socks_bridge.exe" >NUL
if errorlevel 1 (
    start "" /B "%BIN_DIR%\warp_socks_bridge.exe"
)

rem Launch Obsidion Browser
start "" "%BIN_DIR%\obsidion.exe" %*
endlocal
