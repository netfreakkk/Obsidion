$scriptRoot = $PSScriptRoot
$repoRoot = $scriptRoot
$extensionDir = Join-Path $repoRoot "extension"
$zipPath = Join-Path $repoRoot "profile-mod\obsidion-core.zip"
$xpiPath = Join-Path $repoRoot "profile-mod\obsidion-core.xpi"

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
if (Test-Path $xpiPath) { Remove-Item -Force $xpiPath }

Write-Host "Compressing extension into $zipPath..."
Compress-Archive -Path "$extensionDir\*" -DestinationPath $zipPath
Move-Item -Force $zipPath $xpiPath
Write-Host "Package created: $xpiPath ($((Get-Item $xpiPath).Length) bytes)"

$profiles = @(
    "C:\Users\soura\AppData\Roaming\Mozilla\Firefox\Profiles\7he3raj1.default-unofficial",
    "C:\Users\soura\AppData\Roaming\Mozilla\Firefox\Profiles\7mdlguz2.default-release"
)

foreach ($profile in $profiles) {
    if (Test-Path $profile) {
        $extDir = Join-Path $profile "extensions"
        if (-not (Test-Path $extDir)) {
            New-Item -ItemType Directory -Path $extDir -Force | Out-Null
        }
        $targetFile = Join-Path $extDir "obsidion-hud@obsidion.org.xpi"
        Copy-Item -Path $xpiPath -Destination $targetFile -Force
        Write-Host "Deployed to $targetFile"
    } else {
        Write-Host "Profile path not found: $profile"
    }
}
Write-Host "Deployment finished successfully."
