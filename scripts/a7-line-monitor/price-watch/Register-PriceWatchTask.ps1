param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot "price-watch.env"),
    [string]$TaskName = "Jarvis-PriceWatch",
    [string]$Time = "",
    [int]$IntervalMinutes = 0,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Read-EnvFile {
    param([string]$Path)

    $values = @{}
    if (-not (Test-Path -LiteralPath $Path)) {
        return $values
    }

    foreach ($rawLine in Get-Content -LiteralPath $Path) {
        $line = $rawLine.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            continue
        }

        $separator = $line.IndexOf("=")
        if ($separator -lt 1) {
            continue
        }

        $key = $line.Substring(0, $separator).Trim()
        $value = $line.Substring($separator + 1).Trim()
        $values[$key] = $value
    }

    return $values
}

function Get-ConfigValue {
    param(
        [hashtable]$FileConfig,
        [string]$Key,
        [string]$Default = ""
    )

    $envValue = [Environment]::GetEnvironmentVariable($Key)
    if (-not [string]::IsNullOrWhiteSpace($envValue)) {
        return $envValue
    }

    if ($FileConfig.ContainsKey($Key) -and -not [string]::IsNullOrWhiteSpace($FileConfig[$Key])) {
        return $FileConfig[$Key]
    }

    return $Default
}

$fileConfig = Read-EnvFile -Path $ConfigPath
$scheduledTime = $Time
if ([string]::IsNullOrWhiteSpace($scheduledTime)) {
    $scheduledTime = Get-ConfigValue -FileConfig $fileConfig -Key "TASK_TIME" -Default "09:00"
}

if ($IntervalMinutes -le 0) {
    $intervalText = Get-ConfigValue -FileConfig $fileConfig -Key "TASK_INTERVAL_MINUTES" -Default "60"
    $IntervalMinutes = [int]$intervalText
}

$scriptPath = Join-Path $PSScriptRoot "Invoke-PriceWatch.ps1"
$resolvedScriptPath = [System.IO.Path]::GetFullPath($scriptPath)
$resolvedConfigPath = [System.IO.Path]::GetFullPath($ConfigPath)
$workingDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))

$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask -and -not $Force) {
    throw "Scheduled task '$TaskName' already exists. Re-run with -Force to replace it."
}

if ($existingTask -and $Force) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$resolvedScriptPath`" -ConfigPath `"$resolvedConfigPath`"" `
    -WorkingDirectory $workingDirectory

$startAt = [DateTime]::Today.Add([TimeSpan]::Parse($scheduledTime))
if ($IntervalMinutes -gt 0) {
    $trigger = New-ScheduledTaskTrigger `
        -Once `
        -At $startAt `
        -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
        -RepetitionDuration (New-TimeSpan -Days 3650)
} else {
    $trigger = New-ScheduledTaskTrigger -Daily -At $startAt
}

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask `
    -TaskName $TaskName `
    -Description "Jarvis product and flight price watcher to LINE." `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings | Out-Null

Write-Host "Scheduled task '$TaskName' registered from $scheduledTime every $IntervalMinutes minute(s)."
