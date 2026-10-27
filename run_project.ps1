# BullSight AI — Team Enterprise PowerShell Launcher
$Host.UI.RawUI.WindowTitle = "BullSight AI — Team Enterprise Launcher"
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               BULLSIGHT - AI STOCK INTELLIGENCE DASHBOARD" -ForegroundColor Cyan
Write-Host "                    'See the Bull. Predict the Move.'" -ForegroundColor Cyan
Write-Host "             Enterprise Multi-Tier Architecture (BEE Compliant)" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python
try {
    $pyVer = python --version 2>&1
    Write-Host "[OK] Python detected: $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check Node
try {
    $nodeVer = node --version 2>&1
    Write-Host "[OK] Node.js detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 3. Setup Virtual Environment
Write-Host ""
Write-Host "[1/5] Checking Python Virtual Environment (FastAPI ML Service)..." -ForegroundColor Yellow
if (-not (Test-Path "backend\venv\Scripts\Activate.ps1")) {
    Write-Host "Creating Python virtual environment in backend\venv..."
    python -m venv backend\venv
    Write-Host "Installing backend dependencies from requirements.txt..."
    & "backend\venv\Scripts\python.exe" -m pip install --upgrade pip
    & "backend\venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
} else {
    Write-Host "Python virtual environment already configured." -ForegroundColor Green
}

# 4. Setup .env
Write-Host "[2/5] Checking backend environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "Created backend\.env from template." -ForegroundColor Green
    }
}

# 5. Setup Express Gateway
Write-Host "[3/5] Checking Express REST API Gateway dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing Express Gateway npm packages..."
    Push-Location server
    npm install
    Pop-Location
} else {
    Write-Host "Express Gateway dependencies already configured." -ForegroundColor Green
}

# 6. Setup Frontend
Write-Host "[4/5] Checking frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend npm packages..."
    Push-Location frontend
    npm install
    Pop-Location
} else {
    Write-Host "Frontend node_modules already configured." -ForegroundColor Green
}

# 7. Launch Services
Write-Host ""
Write-Host "[5/5] Starting BullSight Multi-Tier Stack..." -ForegroundColor Yellow
Write-Host " (1) Python FastAPI ML Engine:      http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host " (2) Express REST API Gateway:      http://localhost:5000" -ForegroundColor Cyan
Write-Host " (3) React Vite Dashboard:          http://localhost:3000" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 3

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "[SUCCESS] BullSight Multi-Tier Stack is running!" -ForegroundColor Green
Write-Host " - Frontend Dashboard:   http://localhost:3000" -ForegroundColor Cyan
Write-Host " - Express REST Gateway: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host " - Python ML API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Green
