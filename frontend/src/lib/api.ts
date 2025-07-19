import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
console.log('API URL:', apiUrl);

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true, // This is required for cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Ensure cookies are sent with cross-origin requests
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  // Timeout settings
  timeout: 30000, // 30 seconds
  maxRedirects: 3, // Maximum number of redirects to follow
  maxContentLength: 50 * 1024 * 1024, // 50MB max content length
  validateStatus: (status) => status >= 200 && status < 500, // Resolve only if status code is less than 500
});

// Set default withCredentials for all requests
api.defaults.withCredentials = true;

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
    
    // Log detailed error information
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout:', error.config?.url);
      // You could retry the request here if needed
    } else if (error.code === 'ECONNRESET') {
      console.error('[API] Connection reset:', error.config?.url);
      // You could retry the request here if needed
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        `[API] Error ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        error.response.data
      );

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Only handle 401 if we're not already retrying
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token if possible
            const refreshResponse = await axios.post(
              `${apiUrl}/api/auth/refresh-token`,
              {},
              { withCredentials: true }
            );
            
            if (refreshResponse.data.token) {
              // Update the stored token
              const userInfo = localStorage.getItem('userInfo');
              if (userInfo) {
                const user = JSON.parse(userInfo);
                user.token = refreshResponse.data.token;
                localStorage.setItem('userInfo', JSON.stringify(user));
              }
              
              // Update the Authorization header
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
              
              // Retry the original request
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('[API] Token refresh failed:', refreshError);
            // If refresh fails, log the user out
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userInfo');
              const currentPath = window.location.pathname;
              // Prevent redirect loop if already on a language homepage
              if (!currentPath.includes('/login') && currentPath !== '/' && currentPath !== '/en' && currentPath !== '/km') {
                window.location.href = '/';
              }
            }
          }
        } else {
          // If we've already retried and still get 401, log out
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userInfo');
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && currentPath !== '/' && currentPath !== '/en' && currentPath !== '/km') {
              window.location.href = '/';
            }
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API] No response received:', error.request);
      
      // Handle network errors
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.error('[API] You are offline. Please check your internet connection.');
      } else {
        console.error('[API] Network error. Please try again later.');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API] Request error:', error.message);
      
      // Clear user data and redirect to login on critical errors
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && currentPath !== '/' && currentPath !== '/en' && currentPath !== '/km') {
          window.location.href = '/';
        }
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.log('[API] Forbidden, redirecting to unauthorized page');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('unauthorized')) {
        window.location.href = '/unauthorized';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
