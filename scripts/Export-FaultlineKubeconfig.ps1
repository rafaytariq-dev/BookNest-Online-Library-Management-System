[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^(?:\d{1,3}\.){3}\d{1,3}$')]
  [string]$BookNestAddress,

  [ValidateRange(1, 65535)]
  [int]$ApiPort = 36443,

  [string]$OutputPath = (Join-Path $PSScriptRoot '..\.local\booknest-faultline-kubeconfig.yaml')
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  throw 'kubectl is required. Install it or add it to PATH, then run this command again.'
}

$octets = $BookNestAddress.Split('.')
if ($octets.Count -ne 4 -or $octets.Where({ [int]$_ -gt 255 }).Count -gt 0) {
  throw "BookNestAddress is not a valid IPv4 address: $BookNestAddress"
}

$context = (& kubectl config current-context).Trim()
if (-not $context) {
  throw 'kubectl has no current context. Select the BookNest cluster first.'
}

$config = (& kubectl config view --raw --minify --flatten | Out-String)
if ($LASTEXITCODE -ne 0 -or -not $config.Trim()) {
  throw 'Could not export the current kubectl context.'
}

$remoteServer = "https://${BookNestAddress}:$ApiPort"
$config = $config -replace '(?m)^\s*server:\s*https://[^\s]+\s*$', "    server: $remoteServer"

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutput
New-Item -ItemType Directory -Force $outputDirectory | Out-Null
[System.IO.File]::WriteAllText(
  $resolvedOutput,
  $config,
  [System.Text.UTF8Encoding]::new($false)
)

try {
  $readyOutput = (& kubectl --kubeconfig $resolvedOutput get --raw=/readyz --request-timeout=10s 2>&1 | Out-String)
  $readyExitCode = $LASTEXITCODE
  $ready = $readyOutput.Trim()
  if ($readyExitCode -ne 0 -or $ready -ne 'ok') {
    $details = if ($ready) { " Response: $ready" } else { '' }
    throw "The remote API readiness check did not return ok.$details"
  }
} catch {
  Remove-Item -LiteralPath $resolvedOutput -Force -ErrorAction SilentlyContinue
  throw "The exported kubeconfig could not reach $remoteServer. Check the certificate SAN, port forwarding, and firewall. $($_.Exception.Message)"
}

Write-Host "Faultline access file created: $resolvedOutput"
Write-Warning 'This file contains Kubernetes administrator credentials. Transfer it securely and delete the transferred copy after onboarding succeeds.'
Write-Host 'Open Faultline > Clusters > Cluster Onboarding and select this file under Cluster access file.'
