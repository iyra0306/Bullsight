@echo off
title BullSight AI — Team Enterprise Launcher
cls
echo ===============================================================================
echo                BULLSIGHT - AI STOCK INTELLIGENCE DASHBOARD
echo                     "See the Bull. Predict the Move."
echo             Enterprise Multi-Tier Architecture (BEE Compliant)
echo ===============================================================================
echo.

python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10, 3.11, or 3.12 from https://www.python.org/
    echo Make sure to check the box: "Add python.exe to PATH"
    echo.
    pause
    exit /b 1
)
echo [OK] Python detected.

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js detected.

echo.
echo [1/5] Checking Python Virtual Environment (FastAPI ML Service)...
if not exist "backend\venv\Scripts\activate.bat" (
    echo Creating virtual environment in backend\venv...
    python -m venv backend\venv
    echo Upgrading pip and installing backend dependencies...
    backend\venv\Scripts\python.exe -m pip install --upgrade pip
    backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
) else (
    echo Virtual environment already exists.
)

echo [2/5] Checking backend configuration...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo Created backend\.env from .env.example
    ) else (
        echo NEWS_API_KEY=newsapi_live_9b4e7284f1a84c20bc6a5e12 > backend\.env
        echo OPENAI_API_KEY=sk-proj-bullsight_ai_live_enterprise_tier_2026_q3_active_v1 >> backend\.env
    )
)

echo [3/5] Checking Express REST API Gateway dependencies...
if not exist "server\node_modules" (
    echo Installing Express Gateway npm packages...
    cd server
    call npm install
    cd ..
) else (
    echo Express Gateway dependencies already installed.
)

echo [4/5] Checking Frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend npm packages...
    cd frontend
    call npm install
    cd ..
) else (
    echo Frontend node_modules already installed.
)

echo.
echo [5/5] Starting BullSight Multi-Tier Services...
echo  (1) Python FastAPI ML Engine:      http://127.0.0.1:8000
echo  (2) Express REST API Gateway:      http://localhost:5000
echo  (3) React Vite Dashboard:          http://localhost:3000
echo.

start "BullSight (1) Python FastAPI ML (:8000)" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "BullSight (2) Express API Gateway (:5000)" cmd /k "cd server && npm start"
timeout /t 2 /nobreak >nul

start "BullSight (3) React Vite Frontend (:3000)" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

start http://localhost:3000

echo ===============================================================================
echo [SUCCESS] BullSight Multi-Tier Stack is now running!
echo  - Frontend Dashboard:   http://localhost:3000
echo  - Express REST Gateway: http://localhost:5000/api/health
echo  - Python ML API Docs:   http://127.0.0.1:8000/docs
echo.
echo To stop services, close each opened terminal window.
echo ===============================================================================
pause
