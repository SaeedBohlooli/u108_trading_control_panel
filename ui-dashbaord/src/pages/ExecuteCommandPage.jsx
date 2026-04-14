import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import appConfig from '../config/appConfig'

function ExecuteCommandPage() {
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExecute = async () => {
    if (!command.trim()) {
      setError('Please enter a command')
      return
    }

    setIsLoading(true)
    setError(null)
    setOutput(null)

    try {
      const response = await fetch(`${appConfig.api?.baseUrl}/api/execute-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: command.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setOutput(data)
    } catch (err) {
      setError(err.message || 'Failed to execute command')
      console.error('Error executing command:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setCommand('')
    setOutput(null)
    setError(null)
  }

  return (
    <div className="state-page">
      <div style={{ marginBottom: 24, padding: '16px 20px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Link to="/">
            <button style={{ padding: '6px 12px', fontSize: 14, background: '#fff', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer' }}>
              ← Home
            </button>
          </Link>
          <h2 style={{ margin: 0, fontSize: 20, color: '#111' }}>Execute OS Command</h2>
        </div>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#92400e' }}>
          ⚠️ <strong>Warning:</strong> This interface allows executing arbitrary OS commands. Use with caution.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
          Command to Execute:
        </label>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter OS command (e.g., ls, dir, python script.py, etc.)"
          style={{
            width: '100%',
            height: 120,
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 14,
            boxSizing: 'border-box'
          }}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <button
          onClick={handleExecute}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: 14
          }}
        >
          {isLoading ? 'Executing...' : 'Execute'}
        </button>
        <button
          onClick={handleClear}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: 14
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 24, padding: 12, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6 }}>
          <p style={{ margin: 0, color: '#991b1b', fontWeight: 'bold' }}>Error:</p>
          <pre style={{ margin: '8px 0 0 0', fontSize: 12, color: '#7f1d1d', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {output && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12, color: '#333' }}>Output:</h3>
          <div style={{ background: '#1f2937', color: '#e5e7eb', padding: 16, borderRadius: 6, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {output.stdout || output.stderr || 'Command executed successfully with no output'}
            </pre>
            {output.returnCode !== undefined && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #4b5563', fontSize: 12, color: '#9ca3af' }}>
                Return Code: <strong style={{ color: output.returnCode === 0 ? '#10b981' : '#ef4444' }}>{output.returnCode}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      <Link to="/">
        <button>Back</button>
      </Link>

      <PageFooter />
    </div>
  )
}

export default ExecuteCommandPage
