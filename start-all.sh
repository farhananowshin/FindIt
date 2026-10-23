#!/usr/bin/env bash
echo "========================================================"
echo "  FindIt Platform Launcher (Sylhet City Network)"
echo "========================================================"

# Start backend
echo "[1/3] Starting Express Backend API (:5000)..."
(cd backend && npm run dev) &

sleep 2

# Start AI Service
echo "[2/3] Starting FastAPI AI Microservice (:8001)..."
(cd ai-service && .venv/Scripts/python.exe main.py) &

sleep 2

# Start Frontend
echo "[3/3] Starting Next.js Frontend (:3000)..."
(cd frontend && npm run dev) &

echo "All services started! Press Ctrl+C to terminate."
wait
