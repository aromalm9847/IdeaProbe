#!/bin/bash

# IdeaProbe — One-command startup script
# Usage: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚡ Starting IdeaProbe..."
echo ""

# Check for required tools
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3.11+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found. Installing..."
    npm install -g pnpm
fi

# Backend setup
echo "🔧 Setting up backend..."
cd "$SCRIPT_DIR/backend"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created backend/.env from template."
    echo "   Please add your OPENAI_API_KEY to backend/.env"
    echo ""
fi

if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

# Load env vars
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs) 2>/dev/null || true
fi

# Start backend in background
echo "🚀 Starting backend on http://localhost:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Frontend setup
echo ""
echo "🔧 Setting up frontend..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    pnpm install
fi

# Start frontend
echo "🚀 Starting frontend on http://localhost:5173..."
pnpm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ IdeaProbe is running!"
echo ""
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔌 Backend:  http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait for both processes
trap "echo ''; echo 'Stopping IdeaProbe...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
