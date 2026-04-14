import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import appConfig from '../config/appConfig'
import { useWebSocket } from '../hooks/useWebSocket'

function OpenPositionsPage() {
  const { data: wsData, status, lastReceived, retryCount, retryTimeout, reconnect } = useWebSocket('application_state')
  const [elapsedSeconds, setElapsedSeconds] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedPositions, setSelectedPositions] = useState({})
  const [selectAll, setSelectAll] = useState(false)

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

  const positions = wsData?.data?.['ib_positions'] || wsData?.['ib_positions'] || []
  
  // Initialize quantities with default values from positions
  useEffect(() => {
    if (Array.isArray(positions) && positions.length > 0) {
      const defaultQties = {}
      positions.forEach((pos, idx) => {
        if (!quantities[idx]) {
          defaultQties[idx] = Math.abs(pos.qty || pos.abs_qty || pos.quantity || pos.position || 0)
        }
      })
      setQuantities((prev) => ({ ...prev, ...defaultQties }))
    }
  }, [positions])

  // Sort positions based on sortConfig
  const sortedPositions = [...positions].sort((a, b) => {
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPositions({})
    } else {
      const allSelected = {}
      sortedPositions.forEach((_, idx) => {
        allSelected[idx] = true
      })
      setSelectedPositions(allSelected)
    }
    setSelectAll(!selectAll)
  }

  const handleSelectPosition = (idx) => {
    setSelectedPositions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  const sendCloseRequestsWithDelay = async (closeOrders) => {
    for (let i = 0; i < closeOrders.length; i++) {
      try {
        const response = await fetch(`${appConfig.api?.tradingEngineAPI}${appConfig.api?.endpoints?.sendRequest}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(closeOrders[i]),
        })
        const data = await response.json()
        console.log(`Close request ${i + 1}/${closeOrders.length}:`, data)
        
        // Wait 400ms before next request (except for the last one)
        if (i < closeOrders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400))
        }
      } catch (err) {
        console.error(`Error sending close request ${i + 1}:`, err)
      }
    }
  }

  const handleCloseSelected = () => {
    const selectedIndices = Object.keys(selectedPositions).filter(idx => selectedPositions[idx])
    
    if (selectedIndices.length === 0) {
      alert('Please select at least one position to close')
      return
    }

    const confirmed = window.confirm(
      `Close ${selectedIndices.length} selected position(s)?\n\nThis will send ${selectedIndices.length} close request(s). Click Yes to confirm or No to cancel.`
    )

    if (!confirmed) {
      return
    }

    const closeOrders = selectedIndices.map(idx => {
      const pos = sortedPositions[idx]
      const qty = quantities[idx] || pos.quantity || pos.position
      const now = new Date()
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}_${idx}`
      
      return {
        request_type: 'CLOSE_POSITION',
        symbol: pos.symbol || pos.contract,
        contract_id: pos.contract_id,
        contract_type: pos.contract_type, // Added contract_type
        quantity: parseFloat(qty),
        status: 'WEB_SENT',
        web_request_id: `close_${timestamp}`,
      }
    })

    console.log(`Sending ${closeOrders.length} close requests with 200ms delay...`)
    sendCloseRequestsWithDelay(closeOrders)
      .then(() => {
        alert(`${closeOrders.length} close request(s) sent successfully`)
        setSelectedPositions({})
        setSelectAll(false)
      })
  }

  return (
    <div className="state-page">
      <PageHeader 
        title="Open Positions"
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
              'Close ALL open positions?\n\nThis will send a close request for all positions. Click Yes to confirm or No to cancel.'
            )
            
            if (!confirmed) {
              return
            }
            
            const now = new Date()
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
            
            const closeAllOrder = {
              request_type: 'CLOSE_ALL_POSITIONS',
              status: 'WEB_SENT',
              web_request_id: `close_all_${timestamp}`,
            }
            console.log('Sending close all order:', closeAllOrder)
            
            fetch(`${appConfig.api?.baseUrl}${appConfig.api?.endpoints?.sendRequest}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(closeAllOrder),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Response:', data)
                alert('Close all positions request sent')
              })
              .catch((err) => {
                console.error('Error:', err)
                alert(`Error sending close all request: ${err.message}`)
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
          Close All Open Positions
        </button>
        
        <button 
          onClick={handleCloseSelected}
          style={{
            padding: '8px 16px',
            background: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: 8
          }}
        >
          Close Selected Positions
        </button>
      </div>

      {Array.isArray(positions) && positions.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <h3>IB Positions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: '#fff', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', background: '#f5f5f5' }}>
                <th style={{ padding: 10, textAlign: 'center', width: 50 }}>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                {positions.length > 0 && Object.keys(positions[0]).map((key) => (
                  <th 
                    key={key} 
                    onClick={() => handleSort(key)}
                    style={{ 
                      padding: 10, 
                      textAlign: 'left',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative'
                    }}
                  >
                    {key}
                    {sortConfig.key === key && (
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
              {sortedPositions.map((pos, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedPositions[idx] || false}
                      onChange={() => handleSelectPosition(idx)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {Object.entries(pos).map(([key, value]) => (
                    <td key={key} style={{ padding: 10 }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={quantities[idx] || ''}
                        onChange={(e) => setQuantities({ ...quantities, [idx]: e.target.value })}
                        style={{
                          width: 80,
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                        }}
                      />
                      <button
                        onClick={() => {
                          const qty = quantities[idx] || pos.quantity || pos.position
                          if (!qty) {
                            alert('Please enter a quantity')
                            return
                          }
                          
                          const confirmed = window.confirm(
                            `Close ${pos.symbol || pos.contract} with quantity ${qty}?\n\nClick Yes to confirm or No to cancel.`
                          )
                          
                          if (!confirmed) {
                            return
                          }
                          
                          const now = new Date()
                          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
                          
                          const closeOrder = {
                            request_type: 'CLOSE_POSITION',
                            symbol: pos.symbol || pos.contract,
                            contract_id: pos.contract_id,
                            contract_type: pos.contract_type, // Added contract_type
                            quantity: parseFloat(qty),
                            status: 'WEB_SENT',
                            web_request_id: `close_${timestamp}`,
                          }
                          console.log('Sending close order:', closeOrder)
                          
                          fetch(`${appConfig.api?.tradingEngineAPI}${appConfig.api?.endpoints?.sendRequest}`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(closeOrder),
                          })
                            .then((res) => res.json())
                            .then((data) => {
                              console.log('Response:', data)
                              alert(`Close order sent for ${closeOrder.symbol} (qty: ${closeOrder.quantity})`)
                            })
                            .catch((err) => {
                              console.error('Error:', err)
                              alert(`Error sending close order: ${err.message}`)
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
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#666' }}>No positions available</p>
          {wsData && (
            <details style={{ marginTop: 10, background: '#f6f8fa', padding: 12, borderRadius: 6 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug: View raw data</summary>
              <pre style={{ marginTop: 10, fontSize: 12 }}>{JSON.stringify(wsData, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      <Link to="/">
        <button>Back</button>
      </Link>
      
      <PageFooter />
    </div>
  )
}

export default OpenPositionsPage
