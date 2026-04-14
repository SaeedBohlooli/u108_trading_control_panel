@echo off
cd /d "%~dp0.."
pip install -r requirements.txt
python api/control_panel_api.py
pause