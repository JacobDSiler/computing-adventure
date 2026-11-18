@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'ca-watch\.ps1|ca-watch-hidden\.vbs' -and $_.ProcessId -ne $PID } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('stopped ' + $_.ProcessId) }; Write-Host 'Computing Adventure watcher stopped.'; Start-Sleep 2"
