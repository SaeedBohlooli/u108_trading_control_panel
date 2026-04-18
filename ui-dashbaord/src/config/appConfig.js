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
  },
  websocket: {
    ...loadedConfig?.websocket,
    url: fixWebSocketUrl(loadedConfig?.websocket?.url)
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
      const port = url.port ? `:${url.port}` : ''
      const protocol = url.protocol
      const newUrl = `${protocol}//${currentHost}${port}`
      console.log(`URL patched: ${urlString} → ${newUrl}`)
      return newUrl
    }
  } catch (e) {
    // Not a valid URL, return as-is
  }
  return urlString
}

// Fix WebSocket URLs (ws:// or wss://)
function fixWebSocketUrl(wsUrl) {
  if (!wsUrl) return wsUrl
  try {
    console.log(`fixWebSocketUrl input: "${wsUrl}"`)
    // Parse as URL by converting ws:// to http://
    const wsProtocol = wsUrl.startsWith('wss://') ? 'wss://' : 'ws://'
    const httpsUrl = wsUrl.replace(/^wss?:\/\//, 'https://')
    console.log(`  Protocol: ${wsProtocol}, temp URL: ${httpsUrl}`)
    
    const url = new URL(httpsUrl)
    const currentHost = window.location.hostname
    console.log(`  Current hostname: ${currentHost}`)
    console.log(`  Parsed hostname: ${url.hostname}, port: ${url.port}`)
    
    const isLocalhost = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '0.0.0.0'
    console.log(`  Is localhost: ${isLocalhost}`)
    
    // If config says localhost but we're on different host, use current hostname
    if (isLocalhost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      const port = url.port ? `:${url.port}` : ''
      const newUrl = `${wsProtocol}//${currentHost}${port}`
      console.log(`  ✓ WebSocket URL patched: ${wsUrl} → ${newUrl}`)
      return newUrl
    } else {
      console.log(`  ✗ No patching needed, returning: ${wsUrl}`)
    }
  } catch (e) {
    // Not a valid URL, return as-is
    console.error(`  Error parsing WebSocket URL "${wsUrl}":`, e.message)
  }
  return wsUrl
}

console.log('✓ AppConfig ready')
console.log('AppConfig:', appConfig)
console.log('==========================================\n')

export default appConfig
