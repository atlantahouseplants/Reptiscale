param(
  [string]$ProjectName = "reptiscale-demo",
  [string]$DotEnvPath = ".env",
  [string[]]$Targets = @("production"),
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"

$RequiredKeys = @(
  "GHL_PRIVATE_TOKEN",
  "GHL_LOCATION_ID",
  "GHL_API_BASE",
  "GHL_API_VERSION",
  "OPENWEATHERMAP_API_KEY",
  "ANTHROPIC_API_KEY",
  "CLAUDE_MODEL"
)

function Get-VercelCommand {
  $cmd = Get-Command vercel.cmd -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $cmd = Get-Command vercel -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $localCmd = Join-Path $script:RepoRoot ".npm-cache\_npx\423346726b67bc37\node_modules\.bin\vercel.cmd"
  if (Test-Path $localCmd) { return $localCmd }

  throw "Vercel CLI was not found. Open a normal PowerShell window and run: npm install -g vercel"
}

function Invoke-VercelCli {
  param(
    [string[]]$Arguments,
    [string]$InputFile,
    [switch]$AllowFailure
  )

  $quotedExe = '"' + $script:VercelCommand + '"'
  $quotedArgs = ($Arguments | ForEach-Object { '"' + ($_ -replace '"', '\"') + '"' }) -join " "

  if ($InputFile) {
    $cmdLine = "$quotedExe $quotedArgs < `"$InputFile`""
  } else {
    $cmdLine = "$quotedExe $quotedArgs"
  }

  cmd.exe /d /s /c $cmdLine
  $exitCode = $LASTEXITCODE

  if ($exitCode -ne 0 -and -not $AllowFailure) {
    throw "Vercel command failed: vercel $($Arguments -join ' ')"
  }

  return $exitCode
}

function Read-DotEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    throw "Could not find $Path"
  }

  $map = @{}
  foreach ($line in Get-Content $Path) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }

    $equalsIndex = $line.IndexOf("=")
    if ($equalsIndex -lt 1) { continue }

    $key = $line.Substring(0, $equalsIndex).Trim()
    $value = $line.Substring($equalsIndex + 1).Trim()

    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    $map[$key] = $value
  }

  return $map
}

$script:RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$previousLocation = Get-Location

try {
  Set-Location $script:RepoRoot

  if (-not [System.IO.Path]::IsPathRooted($DotEnvPath)) {
    $DotEnvPath = Join-Path $script:RepoRoot $DotEnvPath
  }

  $envMap = Read-DotEnv -Path $DotEnvPath
  $missing = @()

  foreach ($key in $RequiredKeys) {
    if (-not $envMap.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envMap[$key])) {
      $missing += $key
    }
  }

  if ($missing.Count -gt 0) {
    throw "Missing required keys in ${DotEnvPath}: $($missing -join ', ')"
  }

  $script:VercelCommand = Get-VercelCommand

  Write-Host "Linking Vercel project: $ProjectName"
  Invoke-VercelCli -Arguments @("link", "--yes", "--project", $ProjectName) | Out-Null

  foreach ($target in $Targets) {
    Write-Host "Syncing Vercel environment variables for target: $target"

    foreach ($key in $RequiredKeys) {
      Write-Host "  Upserting $key"
      Invoke-VercelCli -Arguments @("env", "rm", $key, $target, "--yes") -AllowFailure | Out-Null

      $tempFile = Join-Path ([System.IO.Path]::GetTempPath()) ("reptiscale-vercel-env-" + [guid]::NewGuid().ToString("N") + ".txt")
      try {
        [System.IO.File]::WriteAllText($tempFile, $envMap[$key])
        Invoke-VercelCli -Arguments @("env", "add", $key, $target) -InputFile $tempFile | Out-Null
      } finally {
        Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
      }
    }
  }

  if (-not $SkipDeploy -and ($Targets -contains "production")) {
    Write-Host "Redeploying production build so the new variables take effect"
    Invoke-VercelCli -Arguments @("deploy", "--prod") | Out-Null
  }

  Write-Host "Vercel environment sync complete."
} finally {
  Set-Location $previousLocation
}
