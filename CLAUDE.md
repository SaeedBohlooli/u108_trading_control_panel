# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A reusable trading control panel dashboard designed to work with different trading algorithm backends. It consists of a Flask API backend (`api/`) and a React + Vite frontend (`ui-dashbaord/` — note the directory typo). The panel monitors trading state in real-time via WebSocket and executes shell commands on the host machine.

## Commands

### Backend (Python Flask)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python api/control_panel_api.py        # starts API on port from config
```

### Frontend (React + Vite)
```bash
cd ui-dashbaord
npm install
npm run dev        # dev server on port from config (default 7109)
npm run build
npm run lint
npm run preview
```

### Run Both Together
```bash
./bin-bash/run_all.sh
```

## Architecture

### Configuration System (critical to understand first)

Config loads in a three-tier priority chain:

1. **`ui-dashbaord/config-master.yaml`** — points to an external project config (e.g., `../../u110_long_target_algo/configs/config-control-panel.yaml`). This is how the dashboard is reused across different trading algorithm projects.
2. **`configs/config-control-panel.yaml`** — local project config (ports, API URLs, project name)
3. **`ui-dashbaord/config-default.yaml`** — fallback defaults

The Vite dev server in `vite.config.js` serves a custom `/api/config` endpoint that merges these configs. `src/config/configLoader.js` fetches from that endpoint; `src/config/appConfig.js` wraps the result and patches `localhost`/`127.0.0.1` URLs to the current browser hostname (allowing remote access).

### Backend

Single Flask app (`api/control_panel_api.py`) with two endpoints:
- `POST /api/execute-command` — runs arbitrary shell commands via `subprocess` (30s timeout). **This is intentionally privileged.**
- `GET /api/health` — status check

CORS is wide open (`origins: "*"`). Port is read from config YAML on startup.

### Frontend

React Router v6 with ~11 pages. Key architectural pieces:

- **WebSocket**: Singleton `src/services/websocketService.js` manages one shared connection with exponential backoff reconnect (1s → 30s). Components access it via the `src/hooks/useWebSocket.js` hook. The service caches the last message and delivers it to new subscribers.
- **API URLs**: `src/config/apiUrls.js` provides getters for the trading engine API and control panel API URLs, both sourced from config.
- **Auth**: Login form stores session in `localStorage`. Credentials come from config YAML — not production-grade.
- **Styling**: Inline CSS throughout — no separate stylesheet files.

### Data Flows

- **Trading data**: WebSocket from the trading engine → `websocketService` → subscribed page components → dynamic table rendering
- **Command execution**: Page form → `POST /api/execute-command` → subprocess → stdout/stderr displayed in output box
- **Config at startup**: Vite middleware reads YAML files → serves `/api/config` → frontend `appConfig.js` patches URLs

### Multi-Project Reuse

The `config-master.yaml` file is the key to reuse. Point it at a different project's `configs/config-control-panel.yaml` and the entire dashboard reconfigures itself (WebSocket URL, trading engine URL, project name, ports).
