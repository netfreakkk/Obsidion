@echo off
title Installing Visual Studio C++ Compiler Tools for MyBrowser
echo =====================================================================
echo  Installing Visual Studio C++ Compiler Workload (cl.exe, link.exe)
echo =====================================================================
echo.
echo Launching Visual Studio Installer to add "Desktop development with C++"...
"C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe" modify --installPath "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools" --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive
echo.
echo [DONE] Once the progress bar finishes, close this window.
pause
