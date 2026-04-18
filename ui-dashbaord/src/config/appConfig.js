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
    console.log(`  Current browser hostname: ${window.location.hostname}`)
    
    const currentHost = window.location.hostname
    
    // Extract protocol, hostname, and port from ws://host:port format
    const wsMatch = wsUrl.match(/^(wss?):\/\/([^:]+):?(\d*)(.*)$/)
    if (!wsMatch) {
      console.log(`  ✗ Could not parse WebSocket URL`)
      return wsUrl
    }
    
    const protocol = wsMatch[1] // ws or wss
    const hostname = wsMatch[2]
    const port = wsMatch[3]
    const path = wsMatch[4] || ''
    
    console.log(`  Protocol: ${protocol}, Hostname: ${hostname}, Port: ${port}`)
    
    const isLocalhost = hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '0.0.0.0'
    console.log(`  Is localhost: ${isLocalhost}`)
    console.log(`  Current hostname is different: ${currentHost !== 'localhost' && currentHost !== '127.0.0.1'}`)
    
    // If config says localhost but we're on different host, use current hostname
    if (isLocalhost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      const portStr = port ? `:${port}` : ''
      const newUrl = `${protocol}://${currentHost}${portStr}${path}`
      console.log(`  ✓ WebSocket URL patched: ${wsUrl} → ${newUrl}`)
      return newUrl
    } else {
      console.log(`  ✗ No patching needed`)
    }
  } catch (e) {
    console.error(`  Error processing WebSocket URL "${wsUrl}":`, e.message)
  }
  return wsUrl
}

console.log('✓ AppConfig ready')
console.log('AppConfig:', appConfig)
console.log('==========================================\n')

export default appConfig
