/**
 * Configuration Loader
 * Priority: project config (from master) → default config
 * Only ONE config is loaded
 */

let yamlConfig = {}
let configSource = 'none'

// Development: fetch from backend API
if (import.meta.env.DEV) {
  try {
    console.log('\n========== Frontend Config Loader ==========')
    console.log('Fetching config from /api/config...')
    
    const response = await fetch('/api/config')
    const data = await response.json()
    
    console.log('✓ Response received from API')
    console.log('Source:', data.source)
    console.log('Config data:', data.config)
    
    yamlConfig = data.config || {}
    configSource = data.source
    
    console.log(`✓✓ Config loaded from: ${configSource}`)
    console.log('Full config:', yamlConfig)
    console.log('==========================================\n')
  } catch (error) {
    console.error('❌ Could not fetch config from API:', error)
    console.log('Error details:', error.message)
  }
} else {
  console.warn('Production config loading not implemented')
}

// Error if no config loaded
if (!yamlConfig || Object.keys(yamlConfig).length === 0) {
  console.error('❌ CRITICAL: Configuration failed to load')
  throw new Error('Configuration failed to load')
}

console.log('✓ Config loader completed successfully')

export const loadedConfig = yamlConfig
export const configMetadata = { source: configSource }
export default loadedConfig
