import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { useWebSocket } from '../hooks/useWebSocket'

function StreamsPage() {
  const [streamInput, setStreamInput] = useState('application_state')
  const [activeStream, setActiveStream] = useState('application_state')
  const [paused, setPaused] = useState(false)
  const [latestMessage, setLatestMessage] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(null)

  const pausedRef = useRef(false)

  const { data, status, lastReceived, retryCount, retryTimeout, reconnect } = useWebSocket(activeStream || null)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    if (data && !pausedRef.current) {
      setLatestMessage({ content: data, timestamp: Date.now() })
    }
  }, [data])

  useEffect(() => {
    if (!lastReceived) { setElapsedSeconds(null); return }
    setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    const id = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000)), 1000)
    return () => clearInterval(id)
  }, [lastReceived])

  const applyStream = () => {
    const name = streamInput.trim()
    setActiveStream(name)
    setLatestMessage(null)
    setPaused(false)
  }

  return (
    <div className="state-page" style={{ textAlign: 'left' }}>
      <PageHeader
        title="Streams"
        status={status}
        lastReceived={lastReceived}
        elapsedSeconds={elapsedSeconds}
        retryTimeout={retryTimeout}
        retryCount={retryCount}
        onReconnect={reconnect}
      />

      {/* Controls bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        marginBottom: 12,
        padding: '12px 16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        flexWrap: 'wrap'
      }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
          Stream name:
        </label>
        <input
          value={streamInput}
          onChange={e => setStreamInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyStream()}
          placeholder="e.g. application_state"
          style={{
            flex: 1,
            minWidth: 160,
            padding: '8px 12px',
            fontSize: 14,
            border: '2px solid #e5e7eb',
            borderRadius: 6,
            outline: 'none',
            fontFamily: 'monospace',
            background: 'white'
          }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        <button
          onClick={applyStream}
          style={{ padding: '8px 18px', fontSize: 14, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.target.style.background = '#2563eb'}
          onMouseLeave={e => e.target.style.background = '#3b82f6'}
        >
          Apply
        </button>
        <button
          onClick={() => setPaused(p => !p)}
          style={{ padding: '8px 18px', fontSize: 14, background: paused ? '#10b981' : '#f59e0b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 100 }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={() => setLatestMessage(null)}
          style={{ padding: '8px 18px', fontSize: 14, background: '#6b7280', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.target.style.background = '#4b5563'}
          onMouseLeave={e => e.target.style.background = '#6b7280'}
        >
          Clear
        </button>
      </div>

      {/* Active stream status */}
      {activeStream && (
        <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
          Listening:{' '}
          <span style={{ fontFamily: 'monospace', color: '#1f2937', fontWeight: 600 }}>{activeStream}</span>
          {paused && (
            <span style={{ marginLeft: 12, color: '#f59e0b', fontWeight: 600 }}>⏸ PAUSED</span>
          )}
        </div>
      )}

      {/* Message feed */}
      <div style={{
        height: 'calc(100vh - 330px)',
        minHeight: 300,
        background: '#1e1e1e',
        borderRadius: 8,
        overflow: 'auto',
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#d4d4d4',
        boxSizing: 'border-box'
      }}>
        {!latestMessage ? (
          <div style={{ color: '#6b7280', fontStyle: 'italic', paddingTop: 8 }}>
            {activeStream
              ? `Waiting for messages on "${activeStream}"…`
              : 'Enter a stream name above and click Apply to start.'}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#6a9955' }}>[{new Date(latestMessage.timestamp).toLocaleTimeString()}]</span>
              {' '}
              <span style={{ color: '#9cdcfe' }}>{activeStream}</span>
            </div>
            <pre style={{ margin: 0, color: '#d4d4d4', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(latestMessage.content, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  )
}

export default StreamsPage
