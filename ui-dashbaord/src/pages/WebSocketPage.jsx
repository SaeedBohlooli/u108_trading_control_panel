import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import appConfig from '../config/appConfig'

function WebSocketPage({ title, messageType }) {
  const [wsData, setWsData] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [lastReceived, setLastReceived] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState(null)
  const wsRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  const connectWs = () => {
    // clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
      setRetryTimeout(null)
    }

    let mounted = true
    try {
      const ws = new WebSocket(appConfig.websocket?.url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!mounted) return
        setStatus('connected')
        setRetryCount(0)
      }

      ws.onmessage = (ev) => {
        if (!mounted) return
        const raw = ev.data
        // try parse JSON, otherwise skip
        try {
          const parsed = JSON.parse(raw)
          // only show messages with specified type
          if (parsed.type === messageType) {
            setLastReceived(Date.now())
            setWsData(parsed)
          }
        } catch (e) {
          // ignore non-JSON messages
        }
      }

      ws.onerror = (err) => {
        if (!mounted) return
        setStatus('error')
        console.error('WebSocket error', err)
      }

      ws.onclose = () => {
        if (!mounted) return
        setStatus('closed')
        // schedule retry with exponential backoff (1s, 2s, 4s, 8s, ... max 30s)
        const nextRetry = Math.min(1000 * Math.pow(2, retryCount), 30000)
        setRetryTimeout(nextRetry)
        retryTimeoutRef.current = setTimeout(() => {
          if (mounted) {
            setRetryCount((c) => c + 1)
            connectWs()
          }
        }, nextRetry)
      }
    } catch (err) {
      setStatus('error')
      console.error('WebSocket failed to construct', err)
      // retry on construction error too
      const nextRetry = Math.min(1000 * Math.pow(2, retryCount), 30000)
      setRetryTimeout(nextRetry)
      retryTimeoutRef.current = setTimeout(() => {
        if (mounted) {
          setRetryCount((c) => c + 1)
          connectWs()
        }
      }, nextRetry)
    }

    return () => {
      mounted = false
    }
  }

  useEffect(() => {
    connectWs()
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // update elapsed seconds since last message
  useEffect(() => {
    if (!lastReceived) {
      setElapsedSeconds(null)
      return
    }
    // set initial
    setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [lastReceived])

  return (
    <div className="state-page">
      <PageHeader 
        title={title}
        status={status}
        lastReceived={lastReceived}
        elapsedSeconds={elapsedSeconds}
        retryTimeout={retryTimeout}
        retryCount={retryCount}
        onReconnect={() => {
          setRetryCount(0)
          connectWs()
        }}
      />
      <div style={{whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12, borderRadius: 6}}>
        {wsData ? (
          typeof wsData === 'string' ? (
            <div>
              <strong>Raw message:</strong>
              <pre>{wsData}</pre>
            </div>
          ) : (
            <div>
              <strong>JSON message:</strong>
              <pre style={{ textAlign: 'left' }}>{JSON.stringify(wsData, null, 2)}</pre>
            </div>
          )
        ) : (
          <div>No messages received yet.</div>
        )}
      </div>

      <Link to="/">
        <button>Back</button>
      </Link>
      
      <PageFooter />
    </div>
  )
}

export default WebSocketPage
