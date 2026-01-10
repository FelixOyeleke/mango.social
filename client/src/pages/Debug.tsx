import { useState } from 'react';
import axios from 'axios';

export default function Debug() {
  const [apiUrl, setApiUrl] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEnv = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (import.meta as any)?.env?.VITE_API_URL || 'NOT SET';
    setApiUrl(url);
  };

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const baseUrl = (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await axios.get(`${baseUrl}/api/health`);
      setTestResult(`✅ Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}\n\nStatus: ${error.response?.status}\n\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setTestResult('Testing login...');
    
    try {
      const response = await axios.post('/api/auth/login', {
        email: 'test@test.com',
        password: 'password123'
      });
      setTestResult(`✅ Login Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Login Error: ${error.message}\n\nStatus: ${error.response?.status}\n\nData: ${JSON.stringify(error.response?.data, null, 2)}\n\nConfig: ${JSON.stringify(error.config, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <button
            onClick={checkEnv}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Check VITE_API_URL
          </button>
          {apiUrl && (
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-mono">VITE_API_URL: {apiUrl}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
          <div className="space-x-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Test Health Endpoint
            </button>
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              Test Login
            </button>
          </div>
          {testResult && (
            <div className="bg-gray-100 p-4 rounded mt-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Axios Configuration</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {JSON.stringify({
                baseURL: axios.defaults.baseURL,
                headers: axios.defaults.headers
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

