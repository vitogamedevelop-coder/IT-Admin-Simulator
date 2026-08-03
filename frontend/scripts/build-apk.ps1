# Build APK and archive with rotation (keep last 3)
param([string]$JavaHome = "C:\Program Files\Android\Android Studio\jbr")

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$frontend = Join-Path $root "frontend"
$archive = Join-Path $frontend "apk-archive"
$apkOutput = Join-Path $frontend "android\app\build\outputs\apk\debug\IT-Admin-Simulator.apk"

Write-Host "=== Building Frontend ===" -ForegroundColor Cyan
Set-Location $frontend
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host "=== Capacitor Sync ===" -ForegroundColor Cyan
npx cap sync
if ($LASTEXITCODE -ne 0) { throw "Cap sync failed" }

Write-Host "=== Gradle assembleDebug ===" -ForegroundColor Cyan
$env:JAVA_HOME = $JavaHome
Set-Location (Join-Path $frontend "android")
./gradlew assembleDebug
if ($LASTEXITCODE -ne 0) { throw "Gradle build failed" }

Write-Host "=== Archiving APK ===" -ForegroundColor Cyan
if (-not (Test-Path $archive)) { New-Item -ItemType Directory -Path $archive | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$destName = "IT-Admin-Simulator_$timestamp.apk"
Copy-Item $apkOutput (Join-Path $archive $destName)
Write-Host "Archived: $destName" -ForegroundColor Green

# Keep only last 3
$apks = Get-ChildItem $archive -Filter "*.apk" | Sort-Object LastWriteTime -Descending
if ($apks.Count -gt 3) {
    $apks | Select-Object -Skip 3 | ForEach-Object {
        Write-Host "Removing old: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName
    }
}

Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "APK: $apkOutput"
Write-Host "Archive: $archive ($($apks.Count) versions)"
