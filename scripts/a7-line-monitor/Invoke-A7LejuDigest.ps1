param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot "a7-leju-monitor.env"),
    [switch]$Force,
    [switch]$SkipLine,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$defaultPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$pythonPath = [Environment]::GetEnvironmentVariable("JARVIS_PYTHON_PATH")
if ([string]::IsNullOrWhiteSpace($pythonPath)) {
    $pythonPath = $defaultPython
}

if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "A7 runtime not found. Run scripts/a7-line-monitor/Initialize-A7Runtime.ps1 first, or set JARVIS_PYTHON_PATH."
}

& $pythonPath -c "import curl_cffi, playwright, reportlab; from zoneinfo import ZoneInfo; ZoneInfo('Asia/Taipei')"
if ($LASTEXITCODE -ne 0) { throw "A7 dependencies are missing. Run Initialize-A7Runtime.ps1 before retrying." }

$scriptPath = Join-Path $PSScriptRoot "a7_leju_digest.py"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Python implementation not found at '$scriptPath'."
}

$arguments = @(
    $scriptPath,
    "--config-path", $ConfigPath
)

if ($Force) {
    $arguments += "--force"
}
if ($SkipLine) {
    $arguments += "--skip-line"
}
if ($DryRun) {
    $arguments += "--dry-run"
}

& $pythonPath @arguments
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
