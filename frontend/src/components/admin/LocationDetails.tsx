'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Users, 
  Clock, 
  Shield, 
} from 'lucide-react';

interface LoginLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  country: string;
  city: string;
  region: string;
  count: number;
  userCount: number;
  totalLogins: number;
  users: Array<{
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
    lastLogin?: string;
    deviceType?: string;
  }>;
  recentLogins: Array<{
    username: string;
    loginTime: string;
    device: string;
    browser: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
  deviceStats?: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  browserStats?: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
  securityFlags?: {
    suspicious: boolean;
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
  };
}

interface LocationDetailsProps {
  location: LoginLocation;
  formatTime: (timeString: string) => string;
  getDeviceIcon: (deviceType: string) => React.ReactNode;
}

export default function LocationDetails({ location, formatTime, getDeviceIcon }: LocationDetailsProps) {
  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {location.city}, {location.country}
              </h3>
              <p className="text-sm text-gray-600">
                {location.region && `${location.region}, `}{location.country}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{location.count}</div>
              <div className="text-xs text-gray-500">Total Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{location.userCount}</div>
              <div className="text-xs text-gray-500">Unique Users</div>
            </div>
            {location.securityFlags && Object.values(location.securityFlags).some(Boolean) && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(location.securityFlags).filter(Boolean).length}
                </div>
                <div className="text-xs text-red-500">Security Alerts</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {/* Users */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users ({location.userCount})
          </h4>
          <div className="space-y-2">
            {location.users.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={user.profileImage} 
                    alt={user.username}
                    className="object-cover"
                    onError={(e) => {e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {user.username.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium  truncate">{user.username}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  {user.lastLogin && (
                    <div className="text-xs text-gray-400">
                      Last: {formatTime(user.lastLogin)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {user.deviceType && getDeviceIcon(user.deviceType)}
                  {user.profileImage && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Has profile image"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        
        </div>

        {/* Recent Logins */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Logins
          </h4>
          <div className="space-y-2">
            {location.recentLogins.map((login, index) => (
              <div key={index} className="text-sm p-2 rounded border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{login.username}</span>
                  <Badge variant="outline" className="text-xs">
                    {login.device}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(login.loginTime)} • {login.browser}
                </div>
                {login.ipAddress && (
                  <div className="text-xs text-gray-400">
                    IP: {login.ipAddress}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Analytics */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security & Analytics
          </h4>
          <div className="space-y-3">
            {/* Device Stats */}
            {location.deviceStats && (
              <div className="p-2 rounded border">
                <div className="text-xs font-medium mb-1">Device Distribution</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Mobile</span>
                    <span className="font-medium">{location.deviceStats.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Desktop</span>
                    <span className="font-medium">{location.deviceStats.desktop}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Tablet</span>
                    <span className="font-medium">{location.deviceStats.tablet}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Flags */}
            {location.securityFlags && (
              <div className="p-2 rounded border">
                <div className="text-xs font-medium mb-1">Security Status</div>
                <div className="space-y-1">
                  {Object.entries(location.securityFlags).map(([flag, value]) => (
                    <div key={flag} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{flag}</span>
                      <Badge variant={value ? "destructive" : "secondary"} className="text-xs">
                        {value ? "Yes" : "No"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browser Stats */}
            {location.browserStats && (
              <div className="p-2 rounded border">
                <div className="text-xs font-medium mb-1">Browser Usage</div>
                <div className="space-y-1">
                  {Object.entries(location.browserStats).map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{browser}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 