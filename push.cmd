@echo off
REM Computing Adventure - double-click to commit + push everything to GitHub (-> computing.jacobsiler.com).
setlocal
set "PS1=%~dp0scripts\ca-push.ps1"
if not exist "%PS1%" (
  echo Could not find %PS1%
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
endlocal
