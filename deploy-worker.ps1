param(
  [Parameter(Mandatory = $true)]
  [string]$AccountId,
  [Parameter(Mandatory = $true)]
  [string]$ApiToken,
  [Parameter(Mandatory = $true)]
  [string]$D1DatabaseId
)

$workerName = "resultadosjb"
$scriptPath = "dist\worker.js"

Write-Host "Building worker (esbuild)..." -ForegroundColor Cyan
npm run worker:build
if ($LASTEXITCODE -ne 0) {
  Write-Host "`u{274C} Build falhou" -ForegroundColor Red
  exit 1
}

$metadata = @{
  main_module = "worker.js"
  compatibility_date = "2024-01-01"
  compatibility_flags = @("nodejs_compat")
  workers_dev = $true
  observability = @{ enabled = $true; head_sampling_rate = 1 }
  triggers = @{ crons = @("3-58/5 * * * *") }
  bindings = @(
    @{
      type = "d1"
      name = "DB"
      id = $D1DatabaseId
    },
    @{
      type = "service"
      name = "API_NOVA"
      service = "resultadosjb-api"
    }
  )
}

$metadataJson = $metadata | ConvertTo-Json -Depth 5 -Compress

$crlf = [System.Text.Encoding]::UTF8.GetBytes("`r`n")
$boundary = "----Boundary$(Get-Random)"
$boundaryBytes = [System.Text.Encoding]::UTF8.GetBytes("--$boundary")

$ms = New-Object System.IO.MemoryStream

function Add-Bytes([byte[]]$data) { $ms.Write($data, 0, $data.Length) }

Add-Bytes $boundaryBytes
Add-Bytes $crlf
Add-Bytes ([System.Text.Encoding]::UTF8.GetBytes('Content-Disposition: form-data; name="metadata"'))
Add-Bytes $crlf
Add-Bytes ([System.Text.Encoding]::UTF8.GetBytes('Content-Type: application/json'))
Add-Bytes $crlf
Add-Bytes $crlf
Add-Bytes ([System.Text.Encoding]::UTF8.GetBytes($metadataJson))

Add-Bytes $crlf
Add-Bytes $boundaryBytes
Add-Bytes $crlf
Add-Bytes ([System.Text.Encoding]::UTF8.GetBytes('Content-Disposition: form-data; name="script"; filename="worker.js"'))
Add-Bytes $crlf
Add-Bytes ([System.Text.Encoding]::UTF8.GetBytes('Content-Type: application/javascript+module'))
Add-Bytes $crlf
Add-Bytes $crlf
Add-Bytes ([System.IO.File]::ReadAllBytes((Resolve-Path $scriptPath)))

Add-Bytes $crlf
Add-Bytes $boundaryBytes
Add-Bytes ([System.Text.Encoding]::UTF8.GetBytes('--'))
Add-Bytes $crlf

$bodyBytes = $ms.ToArray()
$ms.Dispose()

$url = "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/$workerName"

$headers = @{
  Authorization = "Bearer $ApiToken"
  "Content-Type" = "multipart/form-data; boundary=$boundary"
}

Write-Host "Deploying worker to Cloudflare..." -ForegroundColor Cyan

try {
  $response = Invoke-RestMethod -Uri $url -Method Put -Headers $headers -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary"

  if ($response.success) {
    Write-Host "`n`u{2705} Worker '$workerName' deployed successfully!" -ForegroundColor Green
    Write-Host "   Cron: 3-58/5 * * * * (every 5 min, offset -3)" -ForegroundColor Green

    $scheduleUrl = "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/$workerName/schedules"
    $scheduleBody = '[{"cron":"3-58/5 * * * *"}]'
    try {
      $scheduleResponse = Invoke-RestMethod -Uri $scheduleUrl -Method Put -Headers @{ Authorization = "Bearer $ApiToken" } -ContentType "application/json" -Body $scheduleBody
      if ($scheduleResponse.success) {
        Write-Host "   Cron trigger registered via /schedules" -ForegroundColor Green
      } else {
        Write-Host "   `u{26A0} Falha ao registrar cron: $($scheduleResponse.errors | ConvertTo-Json -Compress)" -ForegroundColor Yellow
      }
    } catch {
      Write-Host "   `u{26A0} Erro ao registrar cron: $_" -ForegroundColor Yellow
    }
  } else {
    Write-Host "`n`u{274C} Deploy failed:" -ForegroundColor Red
    $response.errors | ConvertTo-Json
  }
} catch {
  Write-Host "`n`u{274C} Error: $_" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Response: $($reader.ReadToEnd())" -ForegroundColor Red
    $reader.Close()
  }
}