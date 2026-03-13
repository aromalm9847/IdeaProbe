@echo off
echo ⚡ Starting IdeaProbe...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is required. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing pnpm...
    npm install -g pnpm
)

REM Backend setup
echo 🔧 Setting up backend...
cd backend

if not exist ".env" (
    copy .env.example .env
    echo ⚠️  Created backend\.env from template.
    echo    Please add your OPENAI_API_KEY to backend\.env
    echo.
)

if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo 🚀 Starting backend on http://localhost:8000...
start "IdeaProbe Backend" cmd /k "call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000"

REM Frontend setup
echo.
echo 🔧 Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    pnpm install
)

echo 🚀 Starting frontend on http://localhost:5173...
start "IdeaProbe Frontend" cmd /k "pnpm run dev"

echo.
echo ✅ IdeaProbe is starting!
echo.
echo    🌐 Frontend: http://localhost:5173
echo    🔌 Backend:  http://localhost:8000
echo    📚 API Docs: http://localhost:8000/docs
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
