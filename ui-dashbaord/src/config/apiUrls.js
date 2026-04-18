/**
 * API URL Helper Functions
 * Simple getters for API endpoints
 */

import appConfig from './appConfig'

// Get Trading Engine base URL
export const getTradingEngineUrl = () => appConfig.api?.tradingEngineAPI

// Get Control Panel base URL
export const getControlPanelUrl = () => appConfig.api?.controlPanelUrl

// Get send request endpoint
export const getSendRequestUrl = () => `${getTradingEngineUrl()}/api/send-request`

// Get execute command endpoint
export const getExecuteCommandUrl = () => `${getControlPanelUrl()}/api/execute-command`

// Get Trading Engine health check
export const getTradingEngineHealthUrl = () => `${getTradingEngineUrl()}/api/health`

// Get Control Panel health check
export const getControlPanelHealthUrl = () => `${getControlPanelUrl()}/api/health`

export default {
  getTradingEngineUrl,
  getControlPanelUrl,
  getSendRequestUrl,
  getExecuteCommandUrl,
  getTradingEngineHealthUrl,
  getControlPanelHealthUrl
}
