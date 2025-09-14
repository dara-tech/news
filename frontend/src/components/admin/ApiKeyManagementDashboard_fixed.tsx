'use client';

/**
 * API Key Management Dashboard
 * Comprehensive interface for monitoring and managing API keys
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, Settings, AlertTriangle, CheckCircle, 
  XCircle, RefreshCw, Eye, EyeOff, ExternalLink,
  Edit, Save, X, TestTube
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ApiService {
  name: string;
  keys: string[];
  status: 'active' | 'configured' | 'not_configured' | 'error';
  usage: string;
  quota: string;
  lastUsed: string | null;
}

interface ApiUsage {
  requestsToday: number;
  requestsLimit: number | string;
  quotaReset: string | null;
  cost: number;
  plan: string;
}

interface ApiKeyOverview {
  totalServices: number;
  activeServices: number;
  configuredServices: number;
  notConfiguredServices: number;
  services: Record<string, ApiService>;
}

interface EnvironmentVariables {
  GEMINI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  JWT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MONGODB_URI?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

interface RawApiData {
  socialMedia: Record<string, any>;
  integrations: Record<string, any>;
  environment: EnvironmentVariables;
}

const ApiKeyManagementDashboard: React.FC = () => {
  const [overview, setOverview] = useState<ApiKeyOverview | null>(null);
  const [usage, setUsage] = useState<Record<string, ApiUsage> | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [rawData, setRawData] = useState<RawApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [testingService, setTestingService] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load API key overview
      const overviewResponse = await fetch('/api/admin/api-keys/overview');
      const overviewData = await overviewResponse.json();
      if (overviewData.success) {
        setOverview(overviewData.data);
      }

      // Load API usage
      const usageResponse = await fetch('/api/admin/api-keys/usage');
      const usageData = await usageResponse.json();
      if (usageData.success) {
        setUsage(usageData.data);
      }

      // Load API status
      const statusResponse = await fetch('/api/admin/api-keys/status');
      const statusData = await statusResponse.json();
      if (statusData.success) {
        setStatus(statusData.data);
      }

      // Load raw API key data
      const rawResponse = await fetch('/api/admin/api-keys/raw');
      const rawData = await rawResponse.json();
      if (rawData.success) {
        setRawData(rawData.data);
      }

    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const startEditing = (service: string) => {
    setEditingService(service);
    
    // Get the specific keys for this service from the overview
    const serviceKeys = overview?.services?.[service]?.keys || [];
    const serviceData: Record<string, any> = {};
    
    // For each key that belongs to this service, get its value from the appropriate data source
    serviceKeys.forEach((keyName: string) => {
      let value = '';
      
      // Check environment variables first (for Google, JWT, MongoDB)
      if (rawData?.environment?.[keyName as keyof EnvironmentVariables]) {
        value = rawData.environment[keyName as keyof EnvironmentVariables] || '';
      }
      // Check social media data
      else if (rawData?.socialMedia?.[keyName]) {
        value = rawData.socialMedia[keyName];
      }
      // Check integrations data
      else if (rawData?.integrations?.[keyName]) {
        value = rawData.integrations[keyName];
      }
      
      serviceData[keyName] = value;
    });
    
    // Filter out complex objects and only show simple key-value pairs
    const filteredData: Record<string, any> = {};
    Object.entries(serviceData).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        filteredData[key] = value;
      } else if (Array.isArray(value)) {
        filteredData[key] = JSON.stringify(value);
      } else if (typeof value === 'object' && value !== null) {
        filteredData[key] = JSON.stringify(value);
      }
    });
    
    setEditForm(filteredData);
  };

  const cancelEditing = () => {
    setEditingService(null);
    setEditForm({});
  };

  const saveChanges = async (service: string) => {
    try {
      // Determine the correct endpoint and category
      let endpoint = '';
      let category = '';
      
      if (service === 'social-media' || ['facebook', 'twitter', 'linkedin', 'instagram', 'telegram', 'threads'].includes(service)) {
        endpoint = '/api/admin/api-keys/social-media';
        category = 'social-media';
      } else if (service === 'integrations' || ['google', 'cloudinary'].includes(service)) {
        endpoint = '/api/admin/api-keys/integrations';
        category = 'integrations';
      } else if (service === 'google' || service === 'environment') {
        endpoint = '/api/admin/api-keys/environment';
        category = 'environment';
      } else {
        alert('Unknown service category');
        return;
      }
      
      // Process the form data to handle JSON strings and booleans
      const processedData: Record<string, any> = {};
      Object.entries(editForm).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Try to parse JSON strings back to objects
          try {
            processedData[key] = JSON.parse(value);
          } catch {
            processedData[key] = value;
          }
        } else {
          processedData[key] = value;
        }
      });
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: processedData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('API keys updated successfully!');
        setEditingService(null);
        setEditForm({});
        loadData(); // Refresh data
      } else {
        if (service === 'google' || service === 'environment') {
          alert('⚠️ Environment variables cannot be updated via the dashboard.\n\n' + data.message + '\n\nPlease update them in your .env file or server environment.');
        } else {
          alert('Failed to update API keys: ' + data.message);
        }
      }
    } catch (error) {alert('Failed to update API keys');
    }
  };

  const testApiKey = async (service: string) => {
    try {
      setTestingService(service);
      
      const serviceData = rawData?.socialMedia || rawData?.integrations || {};
      
      const response = await fetch('/api/admin/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, keys: serviceData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const result = data.data;
        if (result.success) {
          alert(`✅ ${result.message}`);
        } else {
          alert(`❌ ${result.message}`);
        }
      } else {
        alert('Failed to test API key: ' + data.message);
      }
    } catch (error) {alert('Failed to test API key');
    } finally {
      setTestingService(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'configured': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'not_configured': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'configured': return 'bg-blue-100 text-blue-800';
      case 'not_configured': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (current: number, limit: number | string) => {
    if (typeof limit === 'string') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading API key data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Key Management</h1>
          <p className="text-gray-600">Monitor and manage all API keys and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Button onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Key className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold">{overview.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{overview.activeServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Configured</p>
                  <p className="text-2xl font-bold">{overview.configuredServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-gray-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Not Configured</p>
                  <p className="text-2xl font-bold">{overview.notConfiguredServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="usage">Usage & Quotas</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {overview && Object.entries(overview.services).map(([key, service]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEditing(key)}
                      disabled={key === 'google' || key === 'jwt' || key === 'mongodb'}
                    >
                      <Edit className="h-4 w-4" />
                      {key === 'google' || key === 'jwt' || key === 'mongodb' ? 'Read-Only' : 'Edit'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testApiKey(key)}
                      disabled={testingService === key}
                    >
                      <TestTube className="h-4 w-4" />
                      {testingService === key ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">API Keys</h4>
                    <div className="space-y-1">
                      {service.keys.map((keyName, index) => {
                        const keyValue = rawData?.socialMedia?.[keyName] || 
                                        rawData?.integrations?.[keyName] || 
                                        rawData?.environment?.[keyName as keyof EnvironmentVariables] || '';
                        const isSecret = keyName.toLowerCase().includes('secret') || 
                                        keyName.toLowerCase().includes('token') || 
                                        keyName.toLowerCase().includes('password') ||
                                        keyName.toLowerCase().includes('key');
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">{keyName}</div>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded block break-all">
                                {showSecrets || !isSecret ? keyValue : '••••••••'}
                              </code>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {isSecret ? 'Secret' : 'Public'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Usage:</span> {service.usage}</p>
                      <p><span className="font-medium">Quota:</span> {service.quota}</p>
                      {service.lastUsed && (
                        <p><span className="font-medium">Last Used:</span> {new Date(service.lastUsed).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          {usage && Object.entries(usage).map(([service, usageData]) => (
            <Card key={service}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{service} Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Requests Today</span>
                      <span>{usageData.requestsToday} / {usageData.requestsLimit}</span>
                    </div>
                    {typeof usageData.requestsLimit === 'number' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${getUsagePercentage(usageData.requestsToday, usageData.requestsLimit)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Plan:</span> {usageData.plan}
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span> ${usageData.cost}
                    </div>
                    {usageData.quotaReset && (
                      <div className="col-span-2">
                        <span className="font-medium">Quota Resets:</span> {new Date(usageData.quotaReset).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          {status && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(status.environment).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <code className="text-sm">{key}</code>
                        <Badge variant={(value as string).includes('✅') ? 'default' : 'destructive'}>
                          {value as string}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(status.database).map(([category, config]) => (
                      <div key={category}>
                        <h4 className="font-medium capitalize mb-2">{category.replace(/([A-Z])/g, ' $1')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(config as Record<string, string>).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-mono">{key}:</span>
                              <span className="text-gray-600">
                                {typeof value === 'string' && value.length > 20 
                                  ? `${value.substring(0, 20)}...` 
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      {overview && overview.notConfiguredServices > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overview.notConfiguredServices} service(s) are not configured. 
            Configure them to enable full functionality.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && cancelEditing()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingService?.replace('-', ' ').toUpperCase()} API Keys</DialogTitle>
            {(editingService === 'google' || editingService === 'jwt' || editingService === 'mongodb') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Read-Only:</strong> These are environment variables that cannot be updated via the dashboard. 
                  Please update them in your .env file or server environment.
                </p>
              </div>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            {editingService && Object.entries(editForm).map(([key, value]) => {
              const isSecret = key.toLowerCase().includes('secret') || key.toLowerCase().includes('token') || key.toLowerCase().includes('password');
              const isBoolean = typeof value === 'boolean';
              const isLongText = typeof value === 'string' && value.length > 100;
              
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  
                  {isBoolean ? (
                    <select
                      id={`${editingService}-${key}`}
                      value={value ? 'true' : 'false'}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Select ${key}`}
                      disabled={editingService === 'google' || editingService === 'jwt' || editingService === 'mongodb'}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : isLongText ? (
                    <textarea
                      id={`${editingService}-${key}-textarea`}
                      value={value || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Enter ${key}`}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={editingService === 'google' || editingService === 'jwt' || editingService === 'mongodb'}
                    />
                  ) : (
                    <Input
                      id={`${editingService}-${key}-input`}
                      type={isSecret ? 'password' : 'text'}
                      value={value || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Enter ${key}`}
                      disabled={editingService === 'google' || editingService === 'jwt' || editingService === 'mongodb'}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={cancelEditing}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={() => editingService && saveChanges(editingService)}
              disabled={editingService === 'google' || editingService === 'jwt' || editingService === 'mongodb'}
            >
              <Save className="h-4 w-4" />
              {editingService === 'google' || editingService === 'jwt' || editingService === 'mongodb' ? 'Read-Only' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeyManagementDashboard;
