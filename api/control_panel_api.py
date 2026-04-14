import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import yaml
from pathlib import Path

app = Flask(__name__)

# Configure CORS properly
CORS(app, 
     resources={r"/api/*": {
         "origins": "*",
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Accept"],
         "max_age": 3600
     }})

def load_config():
    """Load configuration from YAML file"""
    config_path = Path(__file__).parent.parent / 'configs' / 'config-control-panel.yaml'
    default_port = 5109
    
    try:
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
                port = config.get('control_panel', {}).get('ports', {}).get('control_panel_api_port', default_port)
                return port
    except Exception as e:
        print(f'Error loading config: {e}')
    
    return default_port

@app.route('/api/execute-command', methods=['POST', 'OPTIONS'])
def execute_command():
    """
    Execute OS command and return output
    
    Request body:
    {
        "command": "ls -la"
    }
    
    Response:
    {
        "stdout": "...",
        "stderr": "...",
        "returnCode": 0
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        command = data.get('command', '').strip()
        
        if not command:
            return jsonify({
                'error': 'No command provided',
                'stdout': '',
                'stderr': 'No command provided',
                'returnCode': 1
            }), 400
        
        print(f'Executing command: {command}')
        
        # Execute command
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        print(f'Command result - returnCode: {result.returncode}, stdout: {result.stdout}, stderr: {result.stderr}')
        
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returnCode': result.returncode,
            'command': command
        }), 200
        
    except subprocess.TimeoutExpired:
        return jsonify({
            'error': 'Command execution timed out',
            'stdout': '',
            'stderr': 'Command execution timed out after 30 seconds',
            'returnCode': -1
        }), 408
        
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({
            'error': str(e),
            'stdout': '',
            'stderr': str(e),
            'returnCode': -1
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

@app.after_request
def after_request(response):
    """Add CORS headers"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    port = load_config()
    print(f'Starting Control Panel API on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)
