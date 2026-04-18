import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'
import fs from 'fs'
import path from 'path'
import yamlParser from 'js-yaml'

// Config file paths
const masterConfigPath = path.resolve(__dirname, './config-master.yaml')
const defaultConfigPath = path.resolve(__dirname, './config-default.yaml')

let vitePort = 7106  // default port
let loadedConfigData = null
let loadedConfigSource = 'none'

// Load config at startup (priority: project file from master → default config)
try {
  console.log('\n========== Config Loader Start ==========')
  console.log(`Master config path: ${masterConfigPath}`)
  console.log(`Master config exists: ${fs.existsSync(masterConfigPath)}`)
  
  // Read master config to get project file path
  let masterConfig = null
  if (fs.existsSync(masterConfigPath)) {
    masterConfig = yamlParser.load(fs.readFileSync(masterConfigPath, 'utf8'))
    console.log('✓ Master config loaded')
    console.log(`Master config content:`, JSON.stringify(masterConfig, null, 2))
  } else {
    console.log('✗ Master config NOT found')
  }
  
  // Check if project config file exists
  console.log(`\nDEBUG: masterConfig keys:`, Object.keys(masterConfig || {}))
  console.log(`DEBUG: controled_app_config_file value:`, masterConfig?.controled_app_config_file)
  
  if (masterConfig?.controled_app_config_file) {
    const rawPath = masterConfig.controled_app_config_file
    console.log(`\n✓ Found controled_app_config_file: "${rawPath}"`)
    console.log(`  (length: ${rawPath.length}, type: ${typeof rawPath})`)
    
    const projectConfigPath = path.resolve(__dirname, rawPath)
    console.log(`Resolved project config path: ${projectConfigPath}`)
    console.log(`Project config exists: ${fs.existsSync(projectConfigPath)}`)
    
    if (fs.existsSync(projectConfigPath)) {
      try {
        loadedConfigData = yamlParser.load(fs.readFileSync(projectConfigPath, 'utf8'))
        loadedConfigSource = 'project'
        console.log('✓✓ PROJECT CONFIG LOADED SUCCESSFULLY')
        console.log(`Loaded from: ${projectConfigPath}`)
      } catch (parseError) {
        console.error('✗ Error parsing project config:', parseError.message)
      }
    } else {
      console.log('✗ Project config file NOT found at:', projectConfigPath)
    }
  } else {
    console.log('✗ No controled_app_config_file in master config')
    console.log(`Master config is:`, masterConfig)
  }
  
  // Only fall back to default if project config was NOT loaded
  if (!loadedConfigData || loadedConfigSource === 'none') {
    console.log(`\nDefault config path: ${defaultConfigPath}`)
    console.log(`Default config exists: ${fs.existsSync(defaultConfigPath)}`)
    
    if (fs.existsSync(defaultConfigPath)) {
      loadedConfigData = yamlParser.load(fs.readFileSync(defaultConfigPath, 'utf8'))
      loadedConfigSource = 'default'
      console.log('✓ DEFAULT CONFIG LOADED')
      console.log(`Loaded from: ${defaultConfigPath}`)
    } else {
      console.log('✗ Default config file NOT found')
    }
  }
  
  if (loadedConfigData) {
    vitePort = loadedConfigData?.control_panel?.ports?.vite || 7106
    console.log(`\n========== Config Loaded Successfully ==========`)
    console.log(`Source: ${loadedConfigSource}`)
    console.log(`Port: ${vitePort}`)
    console.log(`Project Name: ${loadedConfigData?.control_panel?.projectName}`)
    console.log(`\n✓ CONFIG DATA:`)
    console.log(JSON.stringify(loadedConfigData, null, 2))
  } else {
    console.log('\n✗ NO CONFIG LOADED - WILL USE DEFAULTS')
  }
  console.log('==========================================\n')
} catch (e) {
  console.error('Config Loader Error:', e.message)
  console.log('Using defaults (port 7106)')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    yaml(),
    // Serve config via API
    {
      name: 'config-server',
      configureServer(server) {
        server.middlewares.use('/api/config', (req, res) => {
          console.log('\n========== API /config Request ==========')
          res.setHeader('Content-Type', 'application/json')
          
          let configData = null
          let source = 'none'
          
          // Load config (same priority: project → default)
          let masterConfig = null
          console.log(`Master config path: ${masterConfigPath}`)
          console.log(`Master config exists: ${fs.existsSync(masterConfigPath)}`)
          
          if (fs.existsSync(masterConfigPath)) {
            masterConfig = yamlParser.load(fs.readFileSync(masterConfigPath, 'utf8'))
            console.log('✓ Master config loaded')
            console.log(`Master config:`, JSON.stringify(masterConfig, null, 2))
          }
          
          // Check if project config file exists
          console.log(`\nDEBUG: masterConfig keys:`, Object.keys(masterConfig || {}))
          console.log(`DEBUG: controled_app_config_file value:`, masterConfig?.controled_app_config_file)
          
          if (masterConfig?.controled_app_config_file) {
            const rawPath = masterConfig.controled_app_config_file
            console.log(`\n✓ Found controled_app_config_file: "${rawPath}"`)
            const projectConfigPath = path.resolve(__dirname, rawPath)
            console.log(`Resolved project config path: ${projectConfigPath}`)
            console.log(`Project config exists: ${fs.existsSync(projectConfigPath)}`)
            
            if (fs.existsSync(projectConfigPath)) {
              try {
                configData = yamlParser.load(fs.readFileSync(projectConfigPath, 'utf8'))
                source = 'project'
                console.log('✓✓ PROJECT CONFIG LOADED SUCCESSFULLY')
                console.log(`Loaded from: ${projectConfigPath}`)
              } catch (parseError) {
                console.error('✗ Error parsing project config:', parseError.message)
              }
            } else {
              console.log('✗ Project config file NOT found at:', projectConfigPath)
            }
          } else {
            console.log('✗ No controled_app_config_file in master config')
          }
          
          // Only fall back to default if project config was NOT loaded
          if (!configData || source === 'none') {
            console.log(`\nDefault config path: ${defaultConfigPath}`)
            console.log(`Default config exists: ${fs.existsSync(defaultConfigPath)}`)
            
            if (fs.existsSync(defaultConfigPath)) {
              configData = yamlParser.load(fs.readFileSync(defaultConfigPath, 'utf8'))
              source = 'default'
              console.log('✓ DEFAULT CONFIG LOADED')
              console.log(`Loaded from: ${defaultConfigPath}`)
            } else {
              console.log('✗ Default config file NOT found')
            }
          }
          
          console.log(`\n========== Responding with ${source.toUpperCase()} config ==========\n`)
          
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
    strictPort: true
  }
})
