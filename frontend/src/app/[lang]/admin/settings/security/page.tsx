'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Key,
  Clock
} from 'lucide-react';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireEmailVerification: boolean;
  logSecurityEvents: boolean;
  allowPasswordReset: boolean;
  forcePasswordChange: boolean;
  passwordHistoryLimit: number;
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 1440, // 24 hours in minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    requireEmailVerification: true,
    logSecurityEvents: true,
    allowPasswordReset: true,
    forcePasswordChange: false,
    passwordHistoryLimit: 5,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
    fetchSecurityStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings/security');
      if (data.success) {
        setSettings(data.settings);
      }
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityStats = async () => {
    try {
      const { data } = await api.get('/admin/security/stats');
      if (data.success) {
        setActiveUsers(data.activeUsers || 0);
        setSecurityEvents(data.recentEvents || []);
      }
    } catch {
      // Silently handle error
    }
  };

  const validateSettings = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate numeric fields
    if (settings.passwordMinLength < 6 || settings.passwordMinLength > 32) {
      newErrors.passwordMinLength = 'Password length must be between 6 and 32 characters';
    }
    if (settings.sessionTimeout < 30 || settings.sessionTimeout > 10080) {
      newErrors.sessionTimeout = 'Session timeout must be between 30 and 10080 minutes';
    }
    if (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 20) {
      newErrors.maxLoginAttempts = 'Max login attempts must be between 3 and 20';
    }
    if (settings.lockoutDuration < 5 || settings.lockoutDuration > 1440) {
      newErrors.lockoutDuration = 'Lockout duration must be between 5 and 1440 minutes';
    }
    if (settings.passwordHistoryLimit < 0 || settings.passwordHistoryLimit > 20) {
      newErrors.passwordHistoryLimit = 'Password history limit must be between 0 and 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SecuritySettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...(prev || {}), [field]: value }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...(prev || {}), [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/admin/settings/security', { settings });
      
      if (response.data.success) {
        setHasChanges(false);
        setErrors({});
        toast.success('Security settings saved successfully!');
        
        // Update settings with the response data to ensure consistency
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      }
    } catch (error: unknown) {
      const typedError = error as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      const errorMessage = typedError?.response?.data?.message || 'Failed to save security settings';
      toast.error(errorMessage);
      
      // Show field-specific errors if available
      if (typedError.response?.data?.errors) {
        setErrors(typedError.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleForceLogoutAll = async () => {
    if (!confirm('This will log out all users except you. Continue?')) return;
    
    try {
      await api.post('/admin/security/force-logout-all');
      toast.success('All users have been logged out');
    } catch {
      toast.error('Failed to log out users');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600">Manage security policies and access controls</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving || Object.keys(errors).length > 0}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overview
            </CardTitle>
            <CardDescription>
              Current security status and quick actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Security Status</p>
                  <p className="text-sm text-green-700">All systems secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Eye className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Active Sessions</p>
                  <p className="text-sm text-blue-700">{activeUsers} users online</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">Recent Events</p>
                  <p className="text-sm text-orange-700">{securityEvents.length} events today</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleForceLogoutAll}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Force Logout All Users
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Configure password requirements and complexity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                  className={errors.passwordMinLength ? 'border-red-500' : ''}
                />
                {errors.passwordMinLength && (
                  <p className="text-sm text-red-500">{errors.passwordMinLength}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordHistoryLimit">Password History Limit</Label>
                <Input
                  id="passwordHistoryLimit"
                  type="number"
                  min="0"
                  max="20"
                  value={settings.passwordHistoryLimit}
                  onChange={(e) => handleInputChange('passwordHistoryLimit', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-gray-600">Passwords must contain special characters (!@#$%^&*)</p>
                </div>
                <Switch
                  checked={settings.requireSpecialChars}
                  onCheckedChange={(checked) => handleInputChange('requireSpecialChars', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Numbers</Label>
                  <p className="text-sm text-gray-600">Passwords must contain at least one number</p>
                </div>
                <Switch
                  checked={settings.requireNumbers}
                  onCheckedChange={(checked) => handleInputChange('requireNumbers', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Uppercase Letters</Label>
                  <p className="text-sm text-gray-600">Passwords must contain uppercase letters</p>
                </div>
                <Switch
                  checked={settings.requireUppercase}
                  onCheckedChange={(checked) => handleInputChange('requireUppercase', checked)}
                />
              </div>

              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Force Password Change</Label>
                  <p className="text-sm text-gray-600">Require users to change passwords periodically</p>
                </div>
                <Switch
                  checked={settings.forcePasswordChange}
                  onCheckedChange={(checked) => handleInputChange('forcePasswordChange', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Management
            </CardTitle>
            <CardDescription>
              Configure session timeouts and login attempts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="30"
                  max="10080"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="20"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.lockoutDuration}
                  onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Features
            </CardTitle>
            <CardDescription>
              Additional security controls and monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Enable 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Verification Required</Label>
                  <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Security Event Logging</Label>
                  <p className="text-sm text-gray-600">Log all security-related events</p>
                </div>
                <Switch
                  checked={settings.logSecurityEvents}
                  onCheckedChange={(checked) => handleInputChange('logSecurityEvents', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Password Reset</Label>
                  <p className="text-sm text-gray-600">Allow users to reset their passwords via email</p>
                </div>
                <Switch
                  checked={settings.allowPasswordReset}
                  onCheckedChange={(checked) => handleInputChange('allowPasswordReset', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}