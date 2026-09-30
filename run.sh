#!/bin/bash
echo "========================================================"
echo "  Starting SENSEPLATE - Sensory Food Accessibility Engine"
echo "========================================================"

cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"
wait
