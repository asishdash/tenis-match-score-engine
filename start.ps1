$ErrorActionPreference = "Stop"

$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"
$API_PORT = 8000
$UI_PORT = 5173

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Error "'$Name' is required but not installed."
        exit 1
    }
}

function Free-Port {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Where-Object { $_.State -eq "Listen" }

    if (-not $connections) {
        Write-Host "Port $Port is free."
        return
    }

    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "Port $Port is in use by PID(s): $($pids -join ', ')"
    $answer = Read-Host "Do you want to free port $Port now? (y/n)"
    if ($answer -notmatch "^[Yy]$") {
        Write-Host "Port $Port remains in use. Please free it manually and rerun start.ps1"
        exit 1
    }

    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Stopped PID $pid"
        } catch {
            Write-Host "Failed to stop PID $pid automatically. Run as Administrator if needed."
            throw
        }
    }
}

Require-Command python
Require-Command node
Require-Command npm

Free-Port -Port $API_PORT
Free-Port -Port $UI_PORT

$venvPath = Join-Path $BACKEND_DIR ".venv"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"

if (-not (Test-Path $venvPath)) {
    Write-Host "Creating Python virtual environment..."
    Push-Location $BACKEND_DIR
    try {
        python -m venv .venv
    } finally {
        Pop-Location
    }
}

Write-Host "Installing backend requirements..."
& $pythonExe -m pip install -r (Join-Path $BACKEND_DIR "requirements.txt")

Write-Host "Starting backend API..."
$backendProcess = Start-Process -FilePath $pythonExe -ArgumentList @("-m", "uvicorn", "app.main:app", "--reload", "--port", "$API_PORT") -WorkingDirectory $BACKEND_DIR -PassThru

try {
    Write-Host "Installing frontend requirements..."
    Push-Location $FRONTEND_DIR
    try {
        npm install
        Write-Host "API: http://127.0.0.1:$API_PORT"
        Write-Host "UI:  http://127.0.0.1:$UI_PORT"
        npm run dev -- --host 127.0.0.1 --port $UI_PORT --strictPort
    } finally {
        Pop-Location
    }
} finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
