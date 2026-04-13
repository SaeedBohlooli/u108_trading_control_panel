import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import appConfig from '../config/appConfig'
import { useWebSocket } from '../hooks/useWebSocket'

function OpenOrdersPage() {
  const { data: rawWsData, status, lastReceived, retryCount, retryTimeout, reconnect } = useWebSocket('application_state')
  const [elapsedSeconds, setElapsedSeconds] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  // Extract ib_open_orders from application_state
  const wsData = rawWsData?.data?.ib_open_orders ? { data: rawWsData.data.ib_open_orders } : null

  useEffect(() => {
    if (!lastReceived) {
      setElapsedSeconds(null)
      return
    }
    setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - lastReceived) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [lastReceived])

  const orders = wsData?.data || []

  // Sort orders based on sortConfig
  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    
    if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
    if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="state-page">
      <PageHeader 
        title="Open Orders"
        status={status}
        lastReceived={lastReceived}
        elapsedSeconds={elapsedSeconds}
        retryTimeout={retryTimeout}
        retryCount={retryCount}
        onReconnect={reconnect}
      />

      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => {
            const confirmed = window.confirm(
              'Cancel ALL open orders?\n\nThis will send a cancel request for all orders. Click Yes to confirm or No to cancel.'
            )
            
            if (!confirmed) {
              return
            }
            
            const now = new Date()
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
            
            const cancelAllOrder = {
              request_type: 'CANCEL_ALL_ORDERS',
              status: 'WEB_SENT',
              web_request_id: `cancel_all_${timestamp}`,
            }
            console.log('Sending cancel all order:', cancelAllOrder)
            
            fetch(`${appConfig.api?.baseUrl}${appConfig.api?.endpoints?.sendRequest}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(cancelAllOrder),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Response:', data)
                alert('Cancel all orders request sent')
              })
              .catch((err) => {
                console.error('Error:', err)
                alert(`Error sending cancel all request: ${err.message}`)
              })
          }}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Cancel All Open Orders
        </button>
      </div>

      {Array.isArray(orders) && orders.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: '#fff', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', background: '#f5f5f5' }}>
              {Object.keys(orders[0]).map((colKey) => (
                <th 
                  key={colKey} 
                  onClick={() => handleSort(colKey)}
                  style={{ 
                    padding: 10, 
                    textAlign: 'left',
                    cursor: 'pointer',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  {colKey}
                  {sortConfig.key === colKey && (
                    <span style={{ marginLeft: 6 }}>
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
              <th style={{ padding: 10, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                {Object.entries(order).map(([colKey, colValue]) => (
                  <td key={colKey} style={{ padding: 10 }}>
                    {typeof colValue === 'object' && colValue !== null ? 
                      JSON.stringify(colValue) : 
                      typeof colValue === 'number' ?
                      colValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) :
                      String(colValue)
                    }
                  </td>
                ))}
                <td style={{ padding: 10, textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      const orderId = order.order_id || order.orderId || order.id
                      const symbol = order.symbol || order.contract
                      
                      if (!orderId) {
                        alert('Order ID not found')
                        return
                      }
                      
                      const confirmed = window.confirm(
                        `Cancel order for ${symbol || 'this symbol'}?\n\nOrder ID: ${orderId}\n\nClick Yes to confirm or No to cancel.`
                      )
                      
                      if (!confirmed) {
                        return
                      }
                      
                      const now = new Date()
                      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
                      
                      const cancelOrder = {
                        request_type: 'CANCEL_ORDER',
                        order_id: orderId,
                        status: 'WEB_SENT',
                        web_request_id: `cancel_${timestamp}`,
                      }
                      console.log('Sending cancel order:', cancelOrder)
                      
                      fetch(`${appConfig.api?.baseUrl}${appConfig.api?.endpoints?.sendRequest}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cancelOrder),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          console.log('Response:', data)
                          alert(`Cancel order sent for Order ID: ${orderId}`)
                        })
                        .catch((err) => {
                          console.error('Error:', err)
                          alert(`Error sending cancel order: ${err.message}`)
                        })
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#666' }}>No open orders</p>
        </div>
      )}

      <Link to="/">
        <button>Back</button>
      </Link>
      
      <PageFooter />
    </div>
  )
}

export default OpenOrdersPage
