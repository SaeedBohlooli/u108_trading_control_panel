/**
 * Application Config
 * Simple wrapper around loaded config
 */

import { loadedConfig, configMetadata } from './configLoader'

console.log('\n========== AppConfig Initializing ==========')
console.log('Loaded config source:', configMetadata.source)
console.log('Loaded config data:', loadedConfig)

// Export config with helper to fix localhost URLs if needed
const appConfig = {
  ...loadedConfig,
  
  // Helper: Fix localhost URLs when accessing from different host
  api: {
    ...loadedConfig?.api,
    // Replace localhost URLs with current hostname if needed
    tradingEngineAPI: fixUrl(loadedConfig?.api?.tradingEngineAPI),
    controlPanelUrl: fixUrl(loadedConfig?.api?.controlPanelUrl)
  }
}

// Fix localhost URLs to use current hostname
function fixUrl(urlString) {
  if (!urlString) return urlString
  try {
    const url = new URL(urlString)
    const currentHost = window.location.hostname
    const isLocalhost = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '0.0.0.0'
    
    // If config says localhost but we're on different host, use current hostname
    if (isLocalhost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      console.log(`URL patched: ${urlString} → ${currentHost}`)
      url.hostname = currentHost
      return url.toString()
    }
  } catch (e) {
    // Not a valid URL, return as-is
  }
  return urlString
}

console.log('✓ AppConfig ready')
console.log('AppConfig:', appConfig)
console.log('==========================================\n')

export default appConfig
