import { Link } from 'react-router-dom'
import PageFooter from '../components/PageFooter'
import ConnectionStatus from '../components/ConnectionStatus'
import appConfig from '../config/appConfig'
import { configMetadata } from '../config/configLoader'
import yaml from 'js-yaml'

function ConnectionConfigsPage({ state }) {
  // Convert config object back to YAML string
  const yamlContent = yaml.dump({ control_panel: appConfig }, { indent: 2 })

  return (
    <div style={{ padding: 40, minHeight: '100vh' }}>
      <div style={{ 
        marginBottom: 24,
        padding: '16px 20px',
        background: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            
            <h2 style={{ margin: 0, fontSize: 20, color: '#111' }}>Connection Configs</h2>
          </div>
          
          <ConnectionStatus />
        </div>
      </div>

      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto 20px auto',
        padding: '12px 16px',
        background: '#e0f2fe',
        border: '1px solid #7dd3fc',
        borderRadius: 8,
        fontSize: 14,
        color: '#0c4a6e'
      }}>
        <strong>Config Source:</strong> {configMetadata.source}
      </div>

      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto'
      }}>
        <div style={{
          background: '#f5f5f5',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          padding: 20,
          overflow: 'auto'
        }}>
          <pre style={{
            margin: 0,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            lineHeight: 1.6,
            color: '#333',
            whiteSpace: 'pre',
            textAlign: 'left'
          }}>
            {yamlContent}
          </pre>
        </div>
      </div>

      <PageFooter />
    </div>
  )
}

export default ConnectionConfigsPage
