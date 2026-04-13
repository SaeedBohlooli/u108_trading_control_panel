/**
 * React Hook for Shared WebSocket
 * Usage: const { data, status, lastReceived, reconnect } = useWebSocket('application_state')
 */

import { useState, useEffect, useRef } from 'react'
import websocketService from '../services/websocketService'

export function useWebSocket(messageType = null) {
  const [wsData, setWsData] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [lastReceived, setLastReceived] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState(null)
  const subscriberIdRef = useRef(`subscriber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    const subscriberId = subscriberIdRef.current

    const handleMessage = (event) => {
      if (event.type === 'message') {
        // If messageType is specified, filter messages
        if (!messageType || event.data.type === messageType) {
          setLastReceived(event.timestamp)
          setWsData(event.data)
        }
      } else if (event.type === 'status') {
        setStatus(event.status)
        setRetryCount(event.retryCount)
      } else if (event.type === 'retry') {
        setRetryTimeout(event.delay)
      }
    }

    const unsubscribe = websocketService.subscribe(subscriberId, handleMessage)

    return () => {
      unsubscribe()
    }
  }, [messageType])

  const reconnect = () => {
    websocketService.reconnect()
  }

  return {
    data: wsData,
    status,
    lastReceived,
    retryCount,
    retryTimeout,
    reconnect
  }
}
