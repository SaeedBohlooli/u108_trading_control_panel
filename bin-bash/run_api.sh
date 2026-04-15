#!/bin/bash
# filepath: c:\Users\saeed\Documents\13-code-git\u108_trading_control_panel\bin-bash\run_api.sh
cd "$(dirname "$0")/.."
if [ ! -d .venv ]; then
  python -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
python api/control_panel_api.py