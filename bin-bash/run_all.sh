#!/bin/bash
# filepath: c:\Users\saeed\Documents\13-code-git\u108_trading_control_panel\bin-bash\run_all.sh
cd "$(dirname "$0")/.."

echo "Starting Control Panel API..."
python api/control_panel_api.py &
API_PID=$!

sleep 2

echo "Starting UI Dashboard..."
cd ui-dashbaord
npm install
npm run dev &
UI_PID=$!

echo "API running on PID $API_PID"
echo "UI running on PID $UI_PID"
echo "Press Ctrl+C to stop both services"

wait