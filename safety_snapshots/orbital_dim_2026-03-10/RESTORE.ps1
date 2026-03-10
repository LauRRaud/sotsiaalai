$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$snapshot = $PSScriptRoot

Copy-Item "$snapshot\app\styles\theme\mid.css" "$root\app\styles\theme\mid.css" -Force
Copy-Item "$snapshot\app\styles\mobile.css" "$root\app\styles\mobile.css" -Force
Copy-Item "$snapshot\components\effects\Components\OrbitalMenu\OrbitalMenu.css" "$root\components\effects\Components\OrbitalMenu\OrbitalMenu.css" -Force
Copy-Item "$snapshot\components\effects\Components\OrbitalMenu\OrbitalMenu.jsx" "$root\components\effects\Components\OrbitalMenu\OrbitalMenu.jsx" -Force

Write-Output "Restored orbital dim snapshot files."
