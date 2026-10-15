param([string]$CsvPath)
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '../..')
if ($CsvPath) {
  $rows = Import-Csv -LiteralPath $CsvPath -Encoding utf8
} else {
  $response = Invoke-WebRequest -Uri 'https://davidmegginson.github.io/ourairports-data/airports.csv' -TimeoutSec 90
  $rows = $response.Content | ConvertFrom-Csv
}
$airports = @($rows | Where-Object { $_.iata_code -cmatch '^[A-Z]{3}$' -and $_.type -in @('large_airport', 'medium_airport', 'small_airport', 'seaplane_base') } |
  Sort-Object iata_code, @{Expression = { $_.scheduled_service -eq 'yes' }; Descending = $true} |
  Group-Object iata_code | ForEach-Object {
    $a = $_.Group[0]
    ,@($a.iata_code, $a.name, $a.municipality, $a.iso_country, $a.iso_region, [int]($a.scheduled_service -eq 'yes'))
  })
if ($airports.Count -lt 5000) { throw 'Airport directory is unexpectedly incomplete.' }
$data = [ordered]@{ source = 'https://ourairports.com/data/'; license = 'Public domain'; updated = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd'); fields = @('iata', 'name', 'city', 'country', 'region', 'scheduled'); airports = $airports }
$target = Join-Path $root 'output/bazi-ziwei/price-watch/airports-data.json'
$data | ConvertTo-Json -Depth 5 -Compress | Set-Content -LiteralPath $target -Encoding utf8NoBOM
Write-Output "Generated $($airports.Count) airports in $target"
