import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
console.log('API URL:', apiUrl);

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - ensure credentials are sent with every request
api.interceptors.request.use((config) => {
  // Only run on client-side
  if (typeof window !== 'undefined') {
    // Ensure withCredentials is true for all requests
    config.withCredentials = true;
    
    // Add any additional headers if needed
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle 401 errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't try to refresh if this is already a refresh token request
      if (originalRequest.url?.includes('/auth/refresh-token') || 
          originalRequest.url?.includes('/auth/login')) {
        // Clear user data and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      try {
        // Try to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.data.token) {
          throw new Error('No token in refresh response');
        }
        
        // Update the stored token
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.token = response.data.token;
          localStorage.setItem('userInfo', JSON.stringify(userData));
        }
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, clear user data and redirect to login
        localStorage.removeItem('userInfo');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    // If we have a 403 (Forbidden), the user doesn't have permission
    if (error.response?.status === 403) {
      // Redirect to unauthorized page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('unauthorized')) {
        window.location.href = '/unauthorized';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
