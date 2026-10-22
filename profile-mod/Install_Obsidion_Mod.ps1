# =============================================================================
# Obsidion Universal Profile Mod & Extension Installer
# Installs Obsidion Dark Floating Island Theme, Low-RAM user.js, & Extension
# Supports Mozilla Firefox, Zen Browser, LibreWolf, and FloorP
# =============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host @"
====================================================================
           OBSIDION BROWSER MOD & EXTENSION INSTALLER
   Low-RAM Native Mod Suite for Firefox, Zen Browser & LibreWolf
====================================================================
"@ -ForegroundColor Cyan

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
$extensionDir = Join-Path $repoRoot "extension"
$chromeDir = Join-Path $scriptRoot "chrome"
$userJsFile = Join-Path $scriptRoot "user.js"
$policiesFile = Join-Path $scriptRoot "distribution\policies.json"

# 1. Search for Profiles
$profileCandidates = @()

$browserRoots = @(
    @{ Name = "Firefox"; Root = "$env:APPDATA\Mozilla\Firefox\Profiles" },
    @{ Name = "Zen Browser"; Root = "$env:APPDATA\zen\Profiles" },
    @{ Name = "LibreWolf"; Root = "$env:APPDATA\librewolf\Profiles" },
    @{ Name = "FloorP"; Root = "$env:APPDATA\FloorP\Profiles" }
)

foreach ($b in $browserRoots) {
    if (Test-Path $b.Root) {
        $dirs = Get-ChildItem -Path $b.Root -Directory
        foreach ($d in $dirs) {
            $profileCandidates += [PSCustomObject]@{
                Browser = $b.Name
                Name    = $d.Name
                Path    = $d.FullName
            }
        }
    }
}

if ($profileCandidates.Count -eq 0) {
    Write-Host "[!] No browser profiles detected in AppData." -ForegroundColor Red
    Write-Host "Please enter the absolute path to your browser profile folder manually:"
    $manualPath = Read-Host "Path"
    if (Test-Path $manualPath) {
        $profileCandidates += [PSCustomObject]@{
            Browser = "Manual"
            Name    = (Split-Path $manualPath -Leaf)
            Path    = $manualPath
        }
    } else {
        Write-Host "[X] Invalid directory. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nDiscovered Browser Profiles:" -ForegroundColor Yellow
for ($i = 0; $i -lt $profileCandidates.Count; $i++) {
    $p = $profileCandidates[$i]
    Write-Host ("  [{0}] {1} -> {2} ({3})" -f ($i + 1), $p.Browser, $p.Name, $p.Path) -ForegroundColor White
}
Write-Host "  [A] Install to ALL detected profiles" -ForegroundColor Green

$selection = Read-Host "`nSelect profile number to install [Default: 1]"
if ([string]::IsNullOrWhiteSpace($selection)) { $selection = "1" }

$targets = @()
if ($selection -eq "A" -or $selection -eq "a") {
    $targets = $profileCandidates
} else {
    $idx = [int]$selection - 1
    if ($idx -ge 0 -and $idx -lt $profileCandidates.Count) {
        $targets += $profileCandidates[$idx]
    } else {
        Write-Host "[!] Invalid selection. Defaulting to Profile 1." -ForegroundColor Yellow
        $targets += $profileCandidates[0]
    }
}

# 2. Package WebExtension to .XPI
Write-Host "`n[*] Packaging Obsidion Core WebExtension..." -ForegroundColor Cyan
$tempZip = Join-Path $scriptRoot "obsidion-core.zip"
$targetXpi = Join-Path $scriptRoot "obsidion-core.xpi"

if (Test-Path $tempZip) { Remove-Item -Force $tempZip }
if (Test-Path $targetXpi) { Remove-Item -Force $targetXpi }

Compress-Archive -Path "$extensionDir\*" -DestinationPath $tempZip
Move-Item -Force $tempZip $targetXpi
Write-Host "[+] WebExtension packaged: $targetXpi" -ForegroundColor Green

# 3. Apply Mod to Target Profiles
foreach ($target in $targets) {
    Write-Host ("`n--> Installing to {0} ({1})..." -f $target.Browser, $target.Name) -ForegroundColor Cyan
    $pPath = $target.Path

    # 3a. Backup existing user.js and chrome
    $targetChrome = Join-Path $pPath "chrome"
    $targetUserJs = Join-Path $pPath "user.js"
    $targetExtDir = Join-Path $pPath "extensions"

    if (Test-Path $targetUserJs) {
        Copy-Item -Path $targetUserJs -Destination (Join-Path $pPath "user.js.obsidion_backup") -Force
        Write-Host "    [i] Backed up existing user.js" -ForegroundColor Gray
    }
    if (Test-Path $targetChrome) {
        Copy-Item -Path $targetChrome -Destination (Join-Path $pPath "chrome_obsidion_backup") -Recurse -Force
        Write-Host "    [i] Backed up existing chrome/ directory" -ForegroundColor Gray
    }

    # 3b. Copy user.js
    Copy-Item -Path $userJsFile -Destination $targetUserJs -Force
    Write-Host "    [+] Applied low-RAM user.js" -ForegroundColor Green

    # 3c. Copy userChrome.css & userContent.css
    if (-not (Test-Path $targetChrome)) {
        New-Item -ItemType Directory -Path $targetChrome -Force | Out-Null
    }
    Copy-Item -Path "$chromeDir\userChrome.css" -Destination "$targetChrome\userChrome.css" -Force
    Copy-Item -Path "$chromeDir\userContent.css" -Destination "$targetChrome\userContent.css" -Force
    Write-Host "    [+] Applied Floating Island userChrome.css & userContent.css" -ForegroundColor Green

    # 3d. Install extension into profile extensions/
    if (-not (Test-Path $targetExtDir)) {
        New-Item -ItemType Directory -Path $targetExtDir -Force | Out-Null
    }
    Copy-Item -Path $targetXpi -Destination (Join-Path $targetExtDir "obsidion-hud@obsidion.org.xpi") -Force
    Write-Host "    [+] Installed Obsidion Core HUD extension" -ForegroundColor Green
}

Write-Host @"

====================================================================
                  INSTALLATION COMPLETE!
====================================================================
1. Restart your browser ($($targets[0].Browser)).
2. Your browser will launch in the Obsidion Dark Floating Island theme.
3. To enable the Obsidion Core sidebar HUD, click the Obsidion icon in
   your toolbar or open the sidebar (Ctrl+B).
4. If the extension needs approval on first launch, open about:addons
   and verify Obsidion Core HUD is enabled.
====================================================================
"@ -ForegroundColor Cyan
