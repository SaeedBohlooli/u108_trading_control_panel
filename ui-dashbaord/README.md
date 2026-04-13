# Multi-Project Control Panel Dashboard

A React-based control panel dashboard for monitoring and managing multiple projects with WebSocket connectivity and API integration.

## Features

- 📊 **Real-time Monitoring** - WebSocket connections for live data updates
- 🔄 **Auto-Reconnect** - Configurable exponential backoff retry logic
- 🎯 **Multi-Project Support** - Easy switching between different projects
- ⚙️ **Centralized Configuration** - All URLs and settings in one place
- 📱 **Trading Interface** - Manage positions, view accounts, and execute trades
- 🔍 **Dynamic Tables** - Auto-rendering tables for arrays of objects

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template (first time only)
cp .env.example .env.local

# Edit .env.local with your project settings
# VITE_WS_URL=ws://127.0.0.1:6106
# VITE_API_URL=http://127.0.0.1:5106

# Start development server (runs on port 7106)
npm run dev

# Build for production
npm run build
```

## Configuration

### Environment Variables (Recommended for Submodule Usage)

Create a `.env.local` file in the root directory:

```bash
# Project identifier
VITE_PROJECT_NAME=u106_multi_account_algo_trading

# WebSocket server
VITE_WS_URL=ws://127.0.0.1:6106

# API server
VITE_API_URL=http://127.0.0.1:5106
```

### Configuration File

Alternatively, edit `src/config/appConfig.js` directly. See [CONFIG.md](./CONFIG.md) for detailed documentation.

## Using as a Git Submodule

This dashboard is designed to be reusable across multiple projects. See [SUBMODULE.md](./SUBMODULE.md) for complete guide on:
- Setting up as a Git submodule
- Configuring for different projects
- Managing updates across projects

## Project Structure

```
src/
├── config/
│   └── appConfig.js          # Centralized configuration
├── components/
│   ├── PageHeader.jsx        # Common header component
│   └── PageFooter.jsx        # Common footer component
├── pages/
│   ├── Home.jsx              # Landing page
│   ├── WebSocketPage.jsx    # Generic WebSocket page
│   ├── OpenPositionsPage.jsx
│   ├── AccountSummaryPage.jsx
│   └── ApplicationStateDetailsPage.jsx
├── App.jsx                   # Main app with routes
└── main.jsx                  # Entry point
```

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
