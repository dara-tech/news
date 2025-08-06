// import axios from 'axios';

// Free IP geolocation service
const IP_API_URL = 'http://ip-api.com/json';

// Fallback coordinates for common locations
const FALLBACK_LOCATIONS = {
  '127.0.0.1': {
    country: 'Local',
    region: 'Development',
    city: 'Localhost',
    timezone: 'UTC',
    coordinates: { latitude: 0, longitude: 0 }
  },
  '::1': {
    country: 'Local',
    region: 'Development', 
    city: 'Localhost',
    timezone: 'UTC',
    coordinates: { latitude: 0, longitude: 0 }
  }
};

export const getLocationFromIP = async (ipAddress) => {
  try {
    // Check fallback locations first
    if (FALLBACK_LOCATIONS[ipAddress]) {
      return FALLBACK_LOCATIONS[ipAddress];
    }

    // Skip local IPs
    if (ipAddress.startsWith('192.168.') || 
        ipAddress.startsWith('10.') || 
        ipAddress.startsWith('172.') ||
        ipAddress === 'localhost') {
      return {
        country: 'Private Network',
        region: 'Local',
        city: 'Private',
        timezone: 'UTC',
        coordinates: { latitude: 0, longitude: 0 }
      };
    }

    // Get location from IP API - temporarily disabled for testing
    // const response = await axios.get(`${IP_API_URL}/${ipAddress}?fields=status,message,country,regionName,city,timezone,lat,lon`);
    
    // For now, return mock data for testing
    return {
      country: 'Test Country',
      region: 'Test Region',
      city: 'Test City',
      timezone: 'UTC',
      coordinates: {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180
      }
    };
  } catch (error) {
    console.error('Error getting location from IP:', error.message);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
      coordinates: { latitude: 0, longitude: 0 }
    };
  }
};

export const parseUserAgent = (userAgent) => {
  const ua = userAgent || '';
  
  // Browser detection
  let browser = { name: 'Unknown', version: 'Unknown' };
  if (ua.includes('Chrome')) browser = { name: 'Chrome', version: ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown' };
  else if (ua.includes('Firefox')) browser = { name: 'Firefox', version: ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown' };
  else if (ua.includes('Safari')) browser = { name: 'Safari', version: ua.match(/Version\/(\d+)/)?.[1] || 'Unknown' };
  else if (ua.includes('Edge')) browser = { name: 'Edge', version: ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown' };
  else if (ua.includes('Opera')) browser = { name: 'Opera', version: ua.match(/Opera\/(\d+)/)?.[1] || 'Unknown' };

  // OS detection
  let os = { name: 'Unknown', version: 'Unknown', platform: 'Unknown' };
  if (ua.includes('Windows')) os = { name: 'Windows', version: ua.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown', platform: 'desktop' };
  else if (ua.includes('Mac OS X')) os = { name: 'macOS', version: ua.match(/Mac OS X (\d+_\d+)/)?.[1] || 'Unknown', platform: 'desktop' };
  else if (ua.includes('Linux')) os = { name: 'Linux', version: 'Unknown', platform: 'desktop' };
  else if (ua.includes('Android')) os = { name: 'Android', version: ua.match(/Android (\d+)/)?.[1] || 'Unknown', platform: 'mobile' };
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = { name: 'iOS', version: ua.match(/OS (\d+_\d+)/)?.[1] || 'Unknown', platform: ua.includes('iPad') ? 'tablet' : 'mobile' };

  // Device detection
  let device = 'desktop';
  if (ua.includes('Mobile')) device = 'mobile';
  else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'tablet';

  return {
    browser,
    os,
    device,
    userAgent: ua
  };
};

export const detectSecurityFlags = (loginData, previousLogins) => {
  const flags = [];
  
  // Check for suspicious IP patterns
  if (loginData.ipAddress && !loginData.ipAddress.match(/^(127\.|192\.168\.|10\.|172\.)/)) {
    // Check if this IP has been used before by this user
    const ipUsedBefore = previousLogins.some(login => 
      login.ipAddress === loginData.ipAddress && 
      login.success === true
    );
    
    if (!ipUsedBefore) {
      flags.push('new_device');
    }
  }

  // Check for VPN (basic detection)
  if (loginData.ipAddress && loginData.location.country === 'Unknown') {
    flags.push('vpn_detected');
  }

  // Check for unusual location (if user has previous logins)
  if (previousLogins.length > 0 && loginData.location.coordinates.latitude !== 0) {
    const recentLogins = previousLogins.slice(0, 5);
    const avgLat = recentLogins.reduce((sum, login) => sum + (login.location?.coordinates?.latitude || 0), 0) / recentLogins.length;
    const avgLon = recentLogins.reduce((sum, login) => sum + (login.location?.coordinates?.longitude || 0), 0) / recentLogins.length;
    
    const distance = Math.sqrt(
      Math.pow(loginData.location.coordinates.latitude - avgLat, 2) +
      Math.pow(loginData.location.coordinates.longitude - avgLon, 2)
    );
    
    if (distance > 10) { // More than 10 degrees difference
      flags.push('unusual_location');
    }
  }

  return flags;
}; 