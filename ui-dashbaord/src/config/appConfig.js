/**
 * Application Configuration
 * Centralized configuration for all projects and services
 */

import { loadedConfig } from './configLoader'

// Export the loaded configuration with CONTROL_PANEL_API
const appConfig = {
  ...loadedConfig,
  api: {
    ...loadedConfig?.api,
    tradingEngineAPI: loadedConfig?.control_panel?.api?.tradingEngineAPI || 'http://127.0.0.1:5107',
    controlPanelUrl: loadedConfig?.control_panel?.api?.controlPanelUrl || 'http://127.0.0.1:5109'
  }
}

export default appConfig
