/**
 * Application Configuration
 * Centralized configuration for all projects and services
 */

import { loadedConfig } from './configLoader'

// Get API URL from window location if accessing via public IP
const getControlPanelUrl = () => {
  const configUrl = loadedConfig?.control_panel?.api?.controlPanelUrl || 'http://127.0.0.1:5109'
  
  // If UI is accessed from public IP and config says localhost, replace with current host
  if (configUrl.includes('127.0.0.1') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:5109`
  }
  
  return configUrl
}

// Export the loaded configuration with CONTROL_PANEL_API
const appConfig = {
  ...loadedConfig,
  api: {
    ...loadedConfig?.api,
    tradingEngineAPI: loadedConfig?.control_panel?.api?.tradingEngineAPI || 'http://127.0.0.1:5107',
    controlPanelUrl: getControlPanelUrl()
  }
}

export default appConfig
