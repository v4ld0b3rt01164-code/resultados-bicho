param([string]$EnvFile = ".env")

if (!(Test-Path $EnvFile)) {
  Write-Host "`u{274C} .env n`o encontrado. Crie com CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN e D1_DATABASE_ID" -ForegroundColor Red
  exit 1
}

$vars = Get-Content $EnvFile | Where-Object { $_ -match '^\s*[A-Z0-9_]+\s*=' }
foreach ($line in $vars) {
  $parts = $line -split '=', 2
  $name = $parts[0].Trim()
  $value = $parts[1].Trim().Trim('"', "'")
  Set-Item -Path "Env:$name" -Value $value
}

& "$PSScriptRoot\deploy-worker.ps1" -AccountId $env:CLOUDFLARE_ACCOUNT_ID -ApiToken $env:CLOUDFLARE_API_TOKEN -D1DatabaseId $env:D1_DATABASE_ID