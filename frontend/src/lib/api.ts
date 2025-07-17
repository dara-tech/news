import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
console.log('API URL:', apiUrl);

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only add auth token for server-side rendered requests
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const { token } = JSON.parse(userInfo);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error parsing user info:', e);
        }
      }
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log error details
    if (error.response) {
      console.error('[API] Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response.data,
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log('[API] Attempting to refresh token...');
        
        try {
          const refreshResponse = await axios.post(
            `${apiUrl}/api/auth/refresh-token`,
            {},
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              }
            }
          );
          
          if (refreshResponse.data?.token) {
            // Update token in localStorage
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
              try {
                const user = JSON.parse(userInfo);
                user.token = refreshResponse.data.token;
                localStorage.setItem('userInfo', JSON.stringify(user));
              } catch (e) {
                console.error('Error updating user info:', e);
              }
            }
            
            // Update authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            }
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          // Clear user data and redirect to login
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('[API] No response received:', error.request);
      
      // Handle network errors
      if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
        console.error('[API] Network error, redirecting to login');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    } else {
      console.error('[API] Request setup error:', error.message);
    }
    
    // Handle specific error statuses
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized
      if (status === 401) {
        console.log('[API] Unauthorized, redirecting to login');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
      }
      // Handle 403 Forbidden
      else if (status === 403) {
        console.log('[API] Forbidden, redirecting to unauthorized page');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('unauthorized')) {
          window.location.href = '/unauthorized';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
