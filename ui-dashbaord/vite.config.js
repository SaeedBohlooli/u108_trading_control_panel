import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'
import fs from 'fs'
import path from 'path'
import yamlParser from 'js-yaml'

// Load config.yaml to get the port
// Priority: controled_app_config_path > ../../configs/config-control-panel.yaml (project) > ./config.yaml (general) > default
let vitePort = 7106 // default
let loadedConfigData = null
let loadedConfigSource = 'none'
const projectConfigPath = path.resolve(__dirname, '../../configs/config-control-panel.yaml')
const generalConfigPath = path.resolve(__dirname, './config.yaml')

try {
  let configFile
  let configPath = null
  
  console.log('\n========== VITE CONFIG STARTUP ==========')
  console.log('[STARTUP] __dirname:', __dirname)
  console.log('[STARTUP] generalConfigPath:', generalConfigPath)
  
  // First, try to load general config to check for controled_app_config_path
  let generalConfig = null
  if (fs.existsSync(generalConfigPath)) {
    configFile = fs.readFileSync(generalConfigPath, 'utf8')
    generalConfig = yamlParser.load(configFile)
    console.log('[STARTUP] ✓ Loaded general config from:', generalConfigPath)
    console.log('[STARTUP] generalConfig.controled_app_config_path =', generalConfig.controled_app_config_path)
  } else {
    console.log('[STARTUP] ✗ General config NOT found at:', generalConfigPath)
  }
  
  // Check if controled_app_config_path is set and file exists
  if (generalConfig?.controled_app_config_path) {
    const customConfigPath = path.resolve(__dirname, generalConfig.controled_app_config_path, 'config-control-panel.yaml')
    console.log('[STARTUP] Checking controled_app_config_path...')
    console.log('[STARTUP]   Raw path from config:', generalConfig.controled_app_config_path)
    console.log('[STARTUP]   __dirname:', __dirname)
    console.log('[STARTUP]   Resolved absolute path:', customConfigPath)
    console.log('[STARTUP]   File exists:', fs.existsSync(customConfigPath))
    
    if (fs.existsSync(customConfigPath)) {
      try {
        configFile = fs.readFileSync(customConfigPath, 'utf8')
        loadedConfigData = yamlParser.load(configFile)
        loadedConfigSource = 'controled_path'
        console.log('✓✓✓ SUCCESSFULLY LOADED config from controled_app_config_path:', customConfigPath)
        console.log('✓✓✓ Loaded projectName:', loadedConfigData?.control_panel?.projectName)
        console.log('✓✓✓ Loaded footer:', loadedConfigData?.control_panel?.footer?.text)
      } catch (e) {
        console.log('✗ Error parsing custom config:', e.message)
      }
    } else {
      console.log('✗ File NOT found at:', customConfigPath)
      console.log('✗ Actual directory exists:', fs.existsSync(path.dirname(customConfigPath)))
      if (fs.existsSync(path.dirname(customConfigPath))) {
        console.log('✗ Files in that directory:', fs.readdirSync(path.dirname(customConfigPath)))
      }
    }
  } else {
    console.log('[STARTUP] ✗ No controled_app_config_path set')
  }
  
  // Fall back to project config
  if (!loadedConfigData && fs.existsSync(projectConfigPath)) {
    configFile = fs.readFileSync(projectConfigPath, 'utf8')
    loadedConfigData = yamlParser.load(configFile)
    loadedConfigSource = 'project'
    console.log('Using project config from ../../configs/config-control-panel.yaml')
  }
  
  // Fall back to general config
  if (!loadedConfigData && fs.existsSync(generalConfigPath)) {
    configFile = fs.readFileSync(generalConfigPath, 'utf8')
    loadedConfigData = yamlParser.load(configFile)
    loadedConfigSource = 'general'
    console.log('Using general config from ./config.yaml')
  }
  
  if (loadedConfigData) {
    vitePort = loadedConfigData?.control_panel?.ports?.vite || 7106
  }
} catch (e) {
  console.log('Could not load config, using default port 7106:', e.message)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    yaml(),
    // Custom plugin to serve config via API
    {
      name: 'config-server',
      configureServer(server) {
        server.middlewares.use('/api/config', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          let configData = null
          let source = 'none'
          
          // First, try to load general config to check for controled_app_config_path
          let generalConfig = null
          if (fs.existsSync(generalConfigPath)) {
            const generalConfigFile = fs.readFileSync(generalConfigPath, 'utf8')
            generalConfig = yamlParser.load(generalConfigFile)
          }
          
          // Check if controled_app_config_path is set and file exists
          if (generalConfig?.controled_app_config_path) {
            const customConfigPath = path.resolve(__dirname, generalConfig.controled_app_config_path, 'config-control-panel.yaml')
            console.log('[API /config] Checking controled_app_config_path:', generalConfig.controled_app_config_path)
            console.log('[API /config] Resolved path:', customConfigPath)
            console.log('[API /config] File exists:', fs.existsSync(customConfigPath))
            if (fs.existsSync(customConfigPath)) {
              const customConfigFile = fs.readFileSync(customConfigPath, 'utf8')
              configData = yamlParser.load(customConfigFile)
              source = 'controled_path'
              console.log('[API /config] ✓ LOADED from controled_app_config_path:', customConfigPath)
            } else {
              console.log('[API /config] ✗ File not found at:', customConfigPath)
            }
          }
          
          // Fall back to project config
          if (!configData && fs.existsSync(projectConfigPath)) {
            const configFile = fs.readFileSync(projectConfigPath, 'utf8')
            configData = yamlParser.load(configFile)
            source = 'project'
          }
          
          // Fall back to general config
          if (!configData && fs.existsSync(generalConfigPath)) {
            const configFile = fs.readFileSync(generalConfigPath, 'utf8')
            configData = yamlParser.load(configFile)
            source = 'general'
          }
          
          res.end(JSON.stringify({
            config: configData?.control_panel || null,
            source: source
          }))
        })
      }
    }
  ],
  server: {
    port: vitePort,
    strictPort: true,
  }
})
