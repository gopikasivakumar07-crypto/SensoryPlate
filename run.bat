@echo off
echo ========================================================
echo   Starting SENSEPLATE - Sensory Food Accessibility Engine
echo ========================================================

echo.
echo [1/2] Installing backend dependencies...
cd backend
python -m pip install -r requirements.txt
echo.
echo [2/2] Starting FastAPI backend on http://localhost:8000 ...
start "SENSEPLATE Backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

cd ..\frontend
echo.
echo Installing frontend packages...
call npm install
echo.
echo Starting Vite frontend on http://localhost:5173 ...
call npm run dev

pause
