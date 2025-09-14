import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Use relative URL for client-side requests to leverage Next.js proxy
// Use absolute URL for server-side requests
const apiUrl = typeof window !== 'undefined' 
  ? '' // Client-side: use relative URL to leverage Next.js proxy
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'); // Server-side: use absolute URL

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
  timeout: 30000, // 30 seconds (default)
  maxRedirects: 3, // Maximum number of redirects to follow
  // Handle file uploads
  maxBodyLength: Infinity,
  maxContentLength: Infinity, // No limit on content length for file uploads
  validateStatus: (status) => status >= 200 && status < 500, // Resolve only if status code is less than 500
});

// Set default withCredentials for all requests
api.defaults.withCredentials = true;

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip Content-Type for FormData to let the browser set it with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Only add auth token for server-side rendered requests
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        try {
          const { token } = JSON.parse(userInfo);
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {}
      }
    }
    
    
    return config;
  },
  (error: AxiosError) => {return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log detailed error information
    if (error.code === 'ECONNABORTED') {// You could retry the request here if needed
    } else if (error.code === 'ECONNRESET') {// You could retry the request here if needed
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx// Handle 401 Unauthorized
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
        } catch (refreshError) {// If refresh fails, log the user out
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userInfo');
            const currentPath = window.location.pathname;
            // Only redirect for protected routes, not public routes like news articles
            if (!currentPath.includes('/login') && 
                !currentPath.includes('/news/') && 
                !currentPath.includes('/categories/') && 
                !currentPath.includes('/search') && 
                currentPath !== '/' && 
                currentPath !== '/en' && 
                currentPath !== '/km') {
              window.location.href = '/';
            }
          }
        }
      } else {
        // If we've already retried and still get 401, log out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
          const currentPath = window.location.pathname;
          // Only redirect for protected routes, not public routes like news articles
          if (!currentPath.includes('/login') && 
              !currentPath.includes('/news/') && 
              !currentPath.includes('/categories/') && 
              !currentPath.includes('/search') && 
              currentPath !== '/' && 
              currentPath !== '/en' && 
              currentPath !== '/km') {
            window.location.href = '/';
          }
        }
      }
    }
    } else if (error.request) {
      // The request was made but no response was received// Handle network errors
      if (typeof navigator !== 'undefined' && !navigator.onLine) {} else {}
    } else {
      // Something happened in setting up the request that triggered an Error// Clear user data and redirect to login on critical errors
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
        const currentPath = window.location.pathname;
        // Only redirect for protected routes, not public routes like news articles
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/news/') && 
            !currentPath.includes('/categories/') && 
            !currentPath.includes('/search') && 
            currentPath !== '/' && 
            currentPath !== '/en' && 
            currentPath !== '/km') {
          window.location.href = '/';
        }
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('unauthorized')) {
        window.location.href = '/unauthorized';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Author API functions
export const getAuthorProfile = async (authorId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/news/author/${authorId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Trending Topics API functions
export const getTrendingTopics = async (language = 'en', limit = 10, timeRange = '24h') => {
  try {
    const response = await api.get('/recommendations/trending', {
      params: { 
        language, 
        limit, 
        timeRange 
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};