import { Link } from 'react-router-dom'
import ConnectionStatus from './ConnectionStatus'

function PageHeader({ title, status, lastReceived, elapsedSeconds, retryTimeout, retryCount, onReconnect }) {
  const statusColor =
    status === 'connected'
      ? '#22c55e'
      : status === 'error'
      ? '#ef4444'
      : status === 'closed'
      ? '#6b7280'
      : '#f59e0b'

  return (
    <div style={{ 
      marginBottom: 24,
      padding: '16px 20px',
      background: '#f9fafb',
      borderRadius: 8,
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/">
            <button style={{ 
              padding: '6px 12px',
              fontSize: 14,
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              cursor: 'pointer'
            }}>
              ← Home
            </button>
          </Link>
          
          <h2 style={{ margin: 0, fontSize: 20, color: '#111' }}>{title}</h2>
        </div>
        
        <ConnectionStatus />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#555' }}>Status:</span>
          <span
            aria-hidden="true"
            style={{ width: 10, height: 10, borderRadius: 10, background: statusColor }}
          />
          <span style={{ fontSize: 14, color: '#666' }}>{status}</span>
        </div>
        
        {lastReceived && (
          <div style={{ fontSize: 14, color: '#666' }}>
            Last: {new Date(lastReceived).toLocaleTimeString()} ({elapsedSeconds ?? 0}s ago)
          </div>
        )}
        
        {(status === 'closed' || status === 'error') && retryTimeout && (
          <div style={{ fontSize: 14, color: '#f59e0b' }}>
            Retry in {Math.ceil(retryTimeout / 1000)}s (#{retryCount + 1})
          </div>
        )}
        
        <button 
          onClick={onReconnect}
          style={{ 
            padding: '6px 12px',
            fontSize: 14,
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Reconnect
        </button>
      </div>
    </div>
  )
}

export default PageHeader
