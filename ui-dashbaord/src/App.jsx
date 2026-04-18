import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'
import WebSocketPage from './pages/WebSocketPage'
import OpenPositionsPage from './pages/OpenPositionsPage'
import OpenOrdersPage from './pages/OpenOrdersPage'
import AccountSummaryPage from './pages/AccountSummaryPage'
import ApplicationStateDetailsPage from './pages/ApplicationStateDetailsPage'
import ConnectionConfigsPage from './pages/ConnectionConfigsPage'
import SendOrderPage from './pages/SendOrderPage'
import ExecuteCommandPage from './pages/ExecuteCommandPage'
import OSCommandsPage from './pages/OSCommandsPage'
import appConfig from './config/appConfig'

function App() {
  const [count, setCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Set browser title from config
  useEffect(() => {
    document.title = appConfig.browserTitle || 'Control Panel'
  }, [])

  // Check if user was previously authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
  }

  const appState = { count, onLogout: handleLogout }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Home count={count} onIncrement={() => setCount((c) => c + 1)} onLogout={handleLogout} />}
      />
      <Route
        path="/application_state"
        element={<WebSocketPage title="Application state" messageType="application_state" state={appState} />}
      />
      <Route
        path="/application_state_details"
        element={<ApplicationStateDetailsPage state={appState} />}
      />
      <Route
        path="/application_config"
        element={<WebSocketPage title="Application config" messageType="app_config" state={appState} />}
      />
      <Route
        path="/open_positions"
        element={<OpenPositionsPage state={appState} />}
      />
      <Route
        path="/open_orders"
        element={<OpenOrdersPage state={appState} />}
      />
      <Route
        path="/account_summary"
        element={<AccountSummaryPage state={appState} />}
      />
      <Route
        path="/connection_configs"
        element={<ConnectionConfigsPage state={appState} />}
      />
      <Route
        path="/send_order"
        element={<SendOrderPage state={appState} />}
      />
      <Route
        path="/execute_command"
        element={<ExecuteCommandPage />}
      />
      <Route
        path="/os_commands"
        element={<OSCommandsPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
