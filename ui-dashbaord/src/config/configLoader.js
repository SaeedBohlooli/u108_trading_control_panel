/**
 * Configuration Loader
 * Loads config from Vite dev server API endpoint
 * Priority: project config → general config → defaults
 */

// ...existing code...

// Fetch config from Vite dev server
let yamlConfig = {}
let configSource = 'none'

// In development, fetch from API endpoint
if (import.meta.env.DEV) {
  try {
    const response = await fetch('/api/config')
    const data = await response.json()
    yamlConfig = data.config || {}

    // Check for controled_app_config_path and try to load config-control-panel.yaml from there if it exists
    // NOTE: The backend middleware in vite.config.js handles this, so we just store the source from the API response
    // (no need to fetch again from the browser side - the API already returns the correct config)
    
    // Patch URLs that use 0.0.0.0, 127.0.0.1, or localhost with actual hostname
    const patchUrl = (urlString) => {
      if (!urlString) return urlString;
      try {
        const url = new URL(urlString);
        if (url.hostname === '0.0.0.0' || url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
          url.hostname = window.location.hostname;
          return url.toString().replace(/\/$/, '');
        }
      } catch (e) {
        console.warn('Could not patch URL:', urlString, e);
      }
      return urlString;
    };

    // Patch api.baseUrl
    if (yamlConfig.api?.baseUrl) {
      const patched = patchUrl(yamlConfig.api.baseUrl);
      if (patched !== yamlConfig.api.baseUrl) {
        yamlConfig.api.baseUrl = patched;
        console.log('Patched api.baseUrl to:', yamlConfig.api.baseUrl);
      }
    }

    // Patch websocket.url
    if (yamlConfig.websocket?.url) {
      const patched = patchUrl(yamlConfig.websocket.url);
      if (patched !== yamlConfig.websocket.url) {
        yamlConfig.websocket.url = patched;
        console.log('Patched websocket.url to:', yamlConfig.websocket.url);
      }
    }

    configSource = data.source === 'project' ? 'project (../../configs/config-control-panel.yaml)' : 
                   data.source === 'controled_path' ? 'controled_app_config_path' :
                   data.source === 'general' ? 'general (config.yaml)' : 'none'
    console.log('✓ Loaded config from', configSource)
  } catch (error) {
    console.warn('Could not fetch config from API:', error)
    configSource = 'none'
  }
} else {
  // In production, config would need to be bundled or fetched differently
  console.warn('Production config loading not yet implemented')
}

// ...existing code...

// Final configuration: throw error if not loaded
if (!yamlConfig || Object.keys(yamlConfig).length === 0) {
  throw new Error('Configuration could not be loaded from file or API.');
}
export const loadedConfig = yamlConfig;

// Export config source for display
export const configMetadata = {
  source: configSource,
  hasYaml: Object.keys(yamlConfig).length > 0,
  usingDefaults: false
}

// Log configuration source for debugging
if (import.meta.env.DEV) {
  console.log('Configuration loaded:', {
    sources: {
      configFile: configSource,
      yaml: Object.keys(yamlConfig).length > 0 ? 'loaded' : 'none'
    },
    config: loadedConfig
  })
}

export default loadedConfig
