import React, { useState } from 'react';
import { testDatabaseConnection, createTestSession } from '../utils/testConnection';

export function DatabaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult('Testing database connection...');
    
    const connectionOk = await testDatabaseConnection();
    
    if (connectionOk) {
      setTestResult('✅ Database connection successful!');
      
      // Try to create a test session
      const testSession = await createTestSession();
      if (testSession) {
        setTestResult(prev => prev + '\n✅ Test session created successfully!');
      } else {
        setTestResult(prev => prev + '\n❌ Failed to create test session');
      }
    } else {
      setTestResult('❌ Database connection failed. Please check your Supabase configuration.');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-semibold mb-2">Database Test</h3>
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      {testResult && (
        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
    </div>
  );
}