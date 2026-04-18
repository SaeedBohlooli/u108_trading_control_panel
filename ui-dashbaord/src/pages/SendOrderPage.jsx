import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import appConfig from '../config/appConfig'
import { getSendRequestUrl } from '../config/apiUrls'

function SendOrderPage() {
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [side, setSide] = useState('long')
  const [orderType, setOrderType] = useState('Equity')
  const [strike, setStrike] = useState('')
  const [expiry, setExpiry] = useState('')
  const [right, setRight] = useState('C')

  // Set tomorrow's date as default for expiry
  useEffect(() => {
    if (orderType === 'Option' && !expiry) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const formattedDate = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD format
      setExpiry(formattedDate)
    }
  }, [orderType])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!symbol || !quantity) {
      alert('Symbol and Quantity are required')
      return
    }

    if (orderType === 'Option' && (!strike || !expiry)) {
      alert('Strike and Expiry are required for Option orders')
      return
    }
    if (orderType === 'Option' && !right) {
      alert('Right (Call/Put) is required for Option orders')
      return
    }

    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    
    const orderData = {
      request_type: 'OPEN_ORDER_FROM_CONTROL_PANEL',
      symbol: symbol,
      quantity: parseFloat(quantity),
      side: side,
      order_type: orderType,
      status: 'WEB_SENT',
      web_request_id: `order_${timestamp}`,
    }

    if (orderType === 'Option') {
      orderData.strike = parseFloat(strike)
      orderData.expiry = expiry.replace(/-/g, '') // Convert YYYY-MM-DD to YYYYMMDD
      orderData.right = right
    }

    console.log('Sending order:', orderData)

    fetch(getSendRequestUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Response:', data)
        alert('Order sent successfully')
        // Clear form
        setSymbol('')
        setQuantity('')
        setSide('long')
        setOrderType('Equity')
        setStrike('')
        setExpiry('')
        setRight('C')
      })
      .catch((err) => {
        console.error('Error:', err)
        alert(`Error sending order: ${err.message}`)
      })
  }

  const handleCancel = () => {
    setSymbol('')
    setQuantity('')
    setSide('long')
    setOrderType('Equity')
    setStrike('')
    setExpiry('')
    setRight('C')
  }

  return (
    <div className="state-page">
      <PageHeader 
        title="Send Order"
      />
      
      <div style={{ 
        maxWidth: 700, 
        margin: '0 auto',
        background: 'white',
        padding: '32px',
        borderRadius: 12,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 20,
            marginBottom: 20 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: '600',
                color: '#374151',
                fontSize: 14
              }}>
                Symbol *
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 15,
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="e.g., AAPL"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: '600',
                color: '#374151',
                fontSize: 14
              }}>
                Quantity *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 15,
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="e.g., 100"
              />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 20,
            marginBottom: 20 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: '600',
                color: '#374151',
                fontSize: 14
              }}>
                Side
              </label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 15,
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: '600',
                color: '#374151',
                fontSize: 14
              }}>
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 15,
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="Equity">Equity</option>
                <option value="Option">Option</option>
              </select>
            </div>
          </div>

          {orderType === 'Option' && (
            <div style={{
              background: '#f9fafb',
              padding: 20,
              borderRadius: 8,
              marginBottom: 20,
              border: '1px dashed #d1d5db'
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: 16, 
                fontSize: 15,
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Option Details
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: 16
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: 14
                  }}>
                    Strike *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={strike}
                    onChange={(e) => setStrike(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 15,
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="e.g., 150.00"
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: 14
                  }}>
                    Expiry *
                  </label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 15,
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: 14
                  }}>
                    Right *
                  </label>
                  <select
                    value={right}
                    onChange={e => setRight(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 15,
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      outline: 'none',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="C">Call</option>
                    <option value="P">Put</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: 16,
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.2s',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              }}
              onMouseEnter={(e) => e.target.style.background = '#059669'}
              onMouseLeave={(e) => e.target.style.background = '#10b981'}
            >
              Submit Order
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: 16,
                background: '#f3f4f6',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb'
                e.target.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6'
                e.target.style.borderColor = '#e5e7eb'
              }}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/">
          <button style={{
            padding: '10px 20px',
            fontSize: 14,
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}>
            ← Back to Home
          </button>
        </Link>
      </div>
      
      <PageFooter />
    </div>
  )
}

export default SendOrderPage
