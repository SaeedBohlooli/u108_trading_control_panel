import { useState, useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import appConfig from '../config/appConfig'
import { getTradingEngineHealthUrl, getControlPanelHealthUrl } from '../config/apiUrls'

function ConnectionStatus() {
  const { status: wsStatus } = useWebSocket('application_state')
  const [cpApiStatus, setCpApiStatus] = useState('checking')
  const [tradingEngineStatus, setTradingEngineStatus] = useState('checking')
  const [cpApiHealthUrl, setCpApiHealthUrl] = useState('')
  const [tradingEngineHealthUrl, setTradingEngineHealthUrl] = useState('')

  useEffect(() => {
    const checkCpApiHealth = async () => {
      try {
        const healthUrl = getControlPanelHealthUrl()
        setCpApiHealthUrl(healthUrl)
        const response = await fetch(healthUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        
        if (response.ok) {
          setCpApiStatus('connected')
        } else {
          setCpApiStatus('error')
        }
      } catch (error) {
        setCpApiStatus('disconnected')
      }
    }

    // Check immediately
    checkCpApiHealth()

    // Check every 10 seconds
    const interval = setInterval(checkCpApiHealth, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkTradingEngineHealth = async () => {
      try {
        const healthUrl = getTradingEngineHealthUrl()
        setTradingEngineHealthUrl(healthUrl)
        const response = await fetch(healthUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        
        if (response.ok) {
          setTradingEngineStatus('connected')
        } else {
          setTradingEngineStatus('error')
        }
      } catch (error) {
        setTradingEngineStatus('disconnected')
      }
    }

    // Check immediately
    checkTradingEngineHealth()

    // Check every 10 seconds
    const interval = setInterval(checkTradingEngineHealth, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return '#10b981' // green
      case 'connecting':
      case 'checking':
        return '#f59e0b' // orange
      case 'disconnected':
      case 'error':
        return '#ef4444' // red
      default:
        return '#9ca3af' // gray
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'connecting':
      case 'checking':
        return 'Checking...'
      case 'disconnected':
      case 'error':
        return 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      background: '#f9fafb',
      padding: '8px 16px',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      fontSize: 13
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`WebSocket: ${appConfig.websocketUrl || 'ws://127.0.0.1:5106'}`}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: getStatusColor(wsStatus),
          boxShadow: `0 0 8px ${getStatusColor(wsStatus)}`
        }} />
        <span style={{ color: '#6b7280', fontWeight: 500 }}>
          WebSocket: <span style={{ color: '#1f2937' }}>{getStatusText(wsStatus)}</span>
        </span>
      </div>

      <div style={{
        width: 1,
        height: 20,
        background: '#e5e7eb'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={cpApiHealthUrl || 'Loading...'}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: getStatusColor(cpApiStatus),
          boxShadow: `0 0 8px ${getStatusColor(cpApiStatus)}`
        }} />
        <span style={{ color: '#6b7280', fontWeight: 500 }}>
          CP API: <span style={{ color: '#1f2937' }}>{getStatusText(cpApiStatus)}</span>
        </span>
      </div>

      <div style={{
        width: 1,
        height: 20,
        background: '#e5e7eb'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={tradingEngineHealthUrl || 'Loading...'}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: getStatusColor(tradingEngineStatus),
          boxShadow: `0 0 8px ${getStatusColor(tradingEngineStatus)}`
        }} />
        <span style={{ color: '#6b7280', fontWeight: 500 }}>
          Trading Engine: <span style={{ color: '#1f2937' }}>{getStatusText(tradingEngineStatus)}</span>
        </span>
      </div>
    </div>
  )
}

export default ConnectionStatus
