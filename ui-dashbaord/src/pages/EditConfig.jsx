
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loadedConfig from '../config/configLoader';
import yamlParser from 'js-yaml';
import PageFooter from '../components/PageFooter';

function EditConfig() {
  const [yamlContent, setYamlContent] = useState('');
  const [status, setStatus] = useState('');

  // Fetch YAML file via API
  const handleFetch = async () => {
    setStatus('Fetching...');
    try {
      const payload = {
        web_request_id: '101',
        request_type: 'VIEW_FILE',
        file_name: 'config-manual-settings.yaml',
        memo: 'from WEB ',
        status: 'SENT'
      };
      const apiBaseUrl = loadedConfig.api?.baseUrl || '';
          const response = await fetch(`${apiBaseUrl}/api/view-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      // Assume the API returns { content: '...' }
          // Show content as YAML
          // Show content as YAML, preserving original order
          setYamlContent(
            data.content ? yamlParser.dump(data.content, { sortKeys: false }) : ''
          );
      setStatus('Loaded');
    } catch (err) {
      setStatus('Error loading config');
    }
  };

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      const apiBaseUrl = loadedConfig.api?.baseUrl || '';
      const payload = {
        web_request_id: '101',
        content: yamlContent,
        request_type: 'SAVE_FILE',
        file_name: 'config-manual-settings.yaml',
        memo: '',
        status: 'WEB_SENT'
      };
      const response = await fetch(`${apiBaseUrl}/api/save-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to save config');
      setStatus('Saved');
    } catch (err) {
      setStatus('Error saving config');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: 40 }}>
      <h1 style={{ marginBottom: 40, fontSize: 32 }}>Edit Configs</h1>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', fontSize: 16, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Back</button>
        <button onClick={handleFetch} style={{ padding: '8px 16px', fontSize: 16, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Load Config</button>
        <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: 16, background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save Config</button>
        <span style={{ marginLeft: 16, color: '#666' }}>{status}</span>
      </div>
      <textarea
        value={yamlContent}
        onChange={e => setYamlContent(e.target.value)}
        rows={20}
        style={{ width: '100%', fontSize: 16, fontFamily: 'monospace', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}
        placeholder="YAML config will appear here..."
      />
      <PageFooter />
    </div>
  );
}

export default EditConfig;
