import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, Users, FileText } from 'lucide-react';

interface ConnectionStatus {
  database: 'connected' | 'error' | 'testing';
  auth: 'connected' | 'error' | 'testing';
  storage: 'connected' | 'error' | 'testing';
  error?: string;
  stats?: {
    accountsCount: number;
    programsCount: number;
    filesCount: number;
  };
}

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    database: 'testing',
    auth: 'testing',
    storage: 'testing'
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log('🔍 Testing Supabase connection...');
    
    try {
      // Test 1: Database Connection
      console.log('Testing database connection...');
      const { data: testData, error: dbError } = await supabase
        .from('accounts')
        .select('id')
        .limit(1);

      if (dbError) {
        console.error('Database test failed:', dbError);
        setStatus(prev => ({ ...prev, database: 'error', error: dbError.message }));
        return;
      }

      // Test 2: Auth Service
      console.log('Testing auth service...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth test failed:', authError);
        setStatus(prev => ({ ...prev, auth: 'error', error: authError.message }));
      } else {
        console.log('Auth service working, current session:', !!authData.session);
      }

      // Test 3: Storage Service
      console.log('Testing storage service...');
      const { data: storageData, error: storageError } = await supabase.storage
        .from('clinicalrxqfiles')
        .list('', { limit: 1 });

      if (storageError) {
        console.error('Storage test failed:', storageError);
        setStatus(prev => ({ ...prev, storage: 'error', error: storageError.message }));
      }

      // Get some statistics
      console.log('Gathering statistics...');
      const [accountsResult, programsResult, filesResult] = await Promise.all([
        supabase.from('accounts').select('id', { count: 'exact', head: true }),
        supabase.from('programs').select('id', { count: 'exact', head: true }),
        supabase.from('storage_files_catalog').select('id', { count: 'exact', head: true })
      ]);

      setStatus({
        database: dbError ? 'error' : 'connected',
        auth: authError ? 'error' : 'connected', 
        storage: storageError ? 'error' : 'connected',
        stats: {
          accountsCount: accountsResult.count || 0,
          programsCount: programsResult.count || 0,
          filesCount: filesResult.count || 0
        }
      });

      console.log('✅ Connection test completed successfully');
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setStatus(prev => ({
        ...prev,
        database: 'error',
        auth: 'error',
        storage: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'testing':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Testing...</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                <span className="font-medium">Database</span>
              </div>
              {getStatusBadge(status.database)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                <span className="font-medium">Authentication</span>
              </div>
              {getStatusBadge(status.auth)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.storage)}
                <span className="font-medium">Storage</span>
              </div>
              {getStatusBadge(status.storage)}
            </div>
          </div>

          {/* Statistics */}
          {status.stats && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Database Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    <strong>{status.stats.accountsCount}</strong> accounts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    <strong>{status.stats.programsCount}</strong> programs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">
                    <strong>{status.stats.filesCount}</strong> files
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {status.error && (
            <div className="border-t pt-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  Connection Error: {status.error}
                </p>
                {status.error.includes('Legacy API keys') && (
                  <div className="text-sm text-red-700">
                    <p className="mb-2"><strong>How to fix this:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Go to your Supabase Dashboard → Settings → API</li>
                      <li>Copy the new Project URL and anon public key</li>
                      <li>Update your .env file with the new values</li>
                      <li>Restart your development server</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Configuration</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Supabase URL:</strong>{' '}
                {import.meta.env.VITE_SUPABASE_URL ? '✓ Configured' : '❌ Missing'}
              </p>
              <p>
                <strong>Anon Key:</strong>{' '}
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configured' : '❌ Missing'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}