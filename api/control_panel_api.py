import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import yaml
from pathlib import Path

app = Flask(__name__)
CORS(app)

def load_config():
    """Load configuration from YAML file"""
    config_path = Path(__file__).parent.parent / 'configs' / 'config-control-panel.yaml'
    default_port = 5107
    
    try:
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
                port = config.get('control_panel', {}).get('ports', {}).get('api', default_port)
                return port
    except Exception as e:
        print(f'Error loading config: {e}')
    
    return default_port

@app.route('/api/execute-command', methods=['POST'])
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
        
        # Execute command
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returnCode': result.returncode
        }), 200
        
    except subprocess.TimeoutExpired:
        return jsonify({
            'error': 'Command execution timed out',
            'stdout': '',
            'stderr': 'Command execution timed out after 30 seconds',
            'returnCode': -1
        }), 408
        
    except Exception as e:
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

if __name__ == '__main__':
    port = load_config()
    print(f'Starting Control Panel API on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)
