param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot "price-watch.env"),
    [switch]$Force,
    [switch]$SkipLine,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$defaultPython = "C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$pythonPath = [Environment]::GetEnvironmentVariable("JARVIS_PYTHON_PATH")
if ([string]::IsNullOrWhiteSpace($pythonPath)) {
    $pythonPath = $defaultPython
}

if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "Python runtime not found at '$pythonPath'. Set JARVIS_PYTHON_PATH to a valid python executable."
}

$scriptPath = Join-Path $PSScriptRoot "price_watch.py"
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
