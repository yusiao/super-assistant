param([string]$PythonPath = $env:JARVIS_PYTHON_PATH)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($PythonPath)) {
    $PythonPath = "C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
}
if (-not (Test-Path -LiteralPath $PythonPath)) {
    throw "Set JARVIS_PYTHON_PATH to a working Python executable."
}
$runtime = Join-Path $PSScriptRoot ".venv"
$python = Join-Path $runtime "Scripts\python.exe"
if (-not (Test-Path -LiteralPath $python)) {
    & $PythonPath -m venv $runtime
    if ($LASTEXITCODE -ne 0) { throw "Could not create A7 Python environment." }
}
& $python -m ensurepip --upgrade
if ($LASTEXITCODE -ne 0) { throw "Could not initialize pip in the A7 environment." }
& $python -m pip install --disable-pip-version-check -r (Join-Path $PSScriptRoot "requirements.txt")
if ($LASTEXITCODE -ne 0) { throw "Could not install A7 dependencies." }
& $python -m playwright install --only-shell chromium
if ($LASTEXITCODE -ne 0) { throw "Could not install Chromium for A7." }
& $python -c "import curl_cffi, playwright, reportlab; from zoneinfo import ZoneInfo; print('A7 runtime ready:', ZoneInfo('Asia/Taipei'))"
if ($LASTEXITCODE -ne 0) { throw "A7 runtime validation failed." }
