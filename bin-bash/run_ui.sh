#!/bin/bash
# filepath: c:\Users\saeed\Documents\13-code-git\u108_trading_control_panel\bin-bash\run_ui.sh
cd "$(dirname "$0")/../ui-dashbaord"
npm install
npm run dev  -- --host 0.0.0.0