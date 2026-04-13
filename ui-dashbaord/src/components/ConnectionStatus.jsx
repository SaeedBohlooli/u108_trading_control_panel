import { useState, useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import appConfig from '../config/appConfig'

function ConnectionStatus() {
  const { status: wsStatus } = useWebSocket('application_state')
  const [flaskStatus, setFlaskStatus] = useState('checking')

  useEffect(() => {
    const checkFlaskHealth = async () => {
      try {
        const healthUrl = `${appConfig.api.baseUrl}/api/health`
        const response = await fetch(healthUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        
        if (response.ok) {
          setFlaskStatus('connected')
        } else {
          setFlaskStatus('error')
        }
      } catch (error) {
        setFlaskStatus('disconnected')
      }
    }

    // Check immediately
    checkFlaskHealth()

    // Check every 10 seconds
    const interval = setInterval(checkFlaskHealth, 10000)

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: getStatusColor(flaskStatus),
          boxShadow: `0 0 8px ${getStatusColor(flaskStatus)}`
        }} />
        <span style={{ color: '#6b7280', fontWeight: 500 }}>
          Flask API: <span style={{ color: '#1f2937' }}>{getStatusText(flaskStatus)}</span>
        </span>
      </div>
    </div>
  )
}

export default ConnectionStatus
