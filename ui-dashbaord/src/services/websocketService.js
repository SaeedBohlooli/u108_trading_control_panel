/**
 * Shared WebSocket Service
 * Provides a single WebSocket connection shared across all pages
 */

import appConfig from '../config/appConfig'

class WebSocketService {
  constructor() {
    this.ws = null
    this.subscribers = new Map()
    this.status = 'disconnected'
    this.retryCount = 0
    this.retryTimeoutId = null
    this.reconnectConfig = appConfig.websocket?.reconnect || { initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 }
    this.lastMessage = null
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting')
      return
    }

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }

    try {
      console.log('Connecting to WebSocket:', appConfig.websocket?.url)
      this.ws = new WebSocket(appConfig.websocket?.url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.status = 'connected'
        this.retryCount = 0
        this.notifyStatusChange()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.lastMessage = {
            data,
            timestamp: Date.now()
          }
          this.notifySubscribers(data)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.status = 'error'
        this.notifyStatusChange()
      }

      this.ws.onclose = () => {
        console.log('WebSocket closed')
        this.status = 'closed'
        this.notifyStatusChange()
        this.scheduleReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.status = 'error'
      this.notifyStatusChange()
      this.scheduleReconnect()
    }
  }

  scheduleReconnect() {
    if (this.retryTimeoutId) {
      return
    }

    const delay = Math.min(
      this.reconnectConfig.initialDelay * Math.pow(this.reconnectConfig.backoffMultiplier, this.retryCount),
      this.reconnectConfig.maxDelay
    )

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.retryCount + 1})`)
    
    this.retryTimeoutId = setTimeout(() => {
      this.retryCount++
      this.retryTimeoutId = null
      this.connect()
    }, delay)

    this.notifyRetryScheduled(delay)
  }

  disconnect() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.status = 'disconnected'
  }

  subscribe(id, callback) {
    console.log('Subscriber added:', id)
    this.subscribers.set(id, callback)
    
    // If we have a cached message, send it immediately
    if (this.lastMessage) {
      callback({
        type: 'message',
        data: this.lastMessage.data,
        timestamp: this.lastMessage.timestamp
      })
    }

    // Send current status
    callback({
      type: 'status',
      status: this.status,
      retryCount: this.retryCount
    })

    // Auto-connect if not connected
    if (this.subscribers.size === 1 && this.status === 'disconnected') {
      this.connect()
    }

    return () => this.unsubscribe(id)
  }

  unsubscribe(id) {
    console.log('Subscriber removed:', id)
    this.subscribers.delete(id)

    // Disconnect if no more subscribers
    if (this.subscribers.size === 0) {
      console.log('No more subscribers, disconnecting WebSocket')
      this.disconnect()
    }
  }

  notifySubscribers(data) {
    this.subscribers.forEach((callback) => {
      callback({
        type: 'message',
        data,
        timestamp: Date.now()
      })
    })
  }

  notifyStatusChange() {
    this.subscribers.forEach((callback) => {
      callback({
        type: 'status',
        status: this.status,
        retryCount: this.retryCount
      })
    })
  }

  notifyRetryScheduled(delay) {
    this.subscribers.forEach((callback) => {
      callback({
        type: 'retry',
        delay
      })
    })
  }

  reconnect() {
    console.log('Manual reconnect requested')
    this.retryCount = 0
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
    this.disconnect()
    this.connect()
  }

  getStatus() {
    return this.status
  }

  getLastMessage() {
    return this.lastMessage
  }
}

// Singleton instance
const websocketService = new WebSocketService()

export default websocketService
