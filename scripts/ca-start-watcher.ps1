# Starts (or restarts) the Computing Adventure tray watcher and makes it start at every login.
$here = $PSScriptRoot
$repo = Split-Path -Parent $here
$logDir = Join-Path $repo 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
function L($m, $c = 'Gray') { Write-Host ('{0}  {1}' -f (Get-Date -Format 'HH:mm:ss'), $m) -ForegroundColor $c }

L 'Computing Adventure watcher launcher' 'Cyan'
$old = @(Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -match 'ca-watch\.ps1|ca-watch-hidden\.vbs' })
foreach ($p in $old) { L "Stopping old watcher process $($p.ProcessId)"; try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {} }
Start-Sleep -Seconds 2

try {
    $vbs = Join-Path $here 'ca-watch-hidden.vbs'
    $wscript = Join-Path $env:WINDIR 'System32\wscript.exe'
    $lnk = Join-Path ([Environment]::GetFolderPath('Startup')) 'Computing Adventure-Watcher.lnk'
    $sh = New-Object -ComObject WScript.Shell
    $s = $sh.CreateShortcut($lnk)
    $s.TargetPath = $wscript; $s.Arguments = '"' + $vbs + '"'; $s.WorkingDirectory = $here; $s.WindowStyle = 7
    $s.Description = 'Computing Adventure auto-push watcher'; $s.Save()
    L "Startup shortcut OK: $lnk"
} catch { L "Could not create the startup shortcut: $($_.Exception.Message)" 'Yellow' }

$hb = Join-Path $logDir 'heartbeat.txt'
Remove-Item $hb -ErrorAction SilentlyContinue
Start-Process -FilePath (Join-Path $env:WINDIR 'System32\wscript.exe') -ArgumentList ('"' + (Join-Path $here 'ca-watch-hidden.vbs') + '"') -WorkingDirectory $here
L 'Started. Waiting for the watcher to report in...'
$ok = $false
for ($i = 0; $i -lt 30 -and -not $ok; $i++) { Start-Sleep -Seconds 1; if (Test-Path $hb) { $ok = $true } }
if ($ok) { L ('WATCHER IS RUNNING -> ' + (Get-Content $hb -Raw).Trim()) 'Green'; L 'Look for the green H icon in the tray (click ^ if hidden).'; Start-Sleep -Seconds 5; exit 0 }
L 'No heartbeat after 30 s. See logs\watcher.log in the repo folder.' 'Red'
Read-Host 'Press Enter to close'
exit 1
