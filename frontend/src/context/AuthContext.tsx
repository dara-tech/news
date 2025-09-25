'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyPinAndResetPassword: (email: string, pin: string, password: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper: get token from stored user string
  const extractToken = (storedUser: string | null): string | undefined => {
    if (!storedUser) return undefined;
    try {
      const parsed = JSON.parse(storedUser);
      return parsed.token;
    } catch {
      return undefined;
    }
  };

  // Verify user session with backend and update state/localStorage
  const verifyUserSession = useCallback(async (storedUser: string | null) => {
    if (!storedUser) return false;
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await api.get('/auth/profile', {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: (status) => status < 500
      });

      if (response.status >= 200 && response.status < 300) {
        const { data } = response;
        const token = extractToken(storedUser);
        const userData: User = {
          _id: data._id,
          username: data.username || data.email?.split('@')[0] || 'user',
          email: data.email,
          profileImage: data.profileImage,
          role: data.role || 'user',
          ...(token ? { token } : {})
        };
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        localStorage.removeItem('userInfo');
        setUser(null);
        return false;
      }
    } catch {
      localStorage.removeItem('userInfo');
      setUser(null);
      return false;
    }
  }, []);

  // Effect: verify session on mount and on route change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Initialize user from localStorage immediately (synchronously)
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser._id && parsedUser.email) {
          setUser(parsedUser);
        }
      } catch (error) {localStorage.removeItem('userInfo');
      }
    }

    const verifyUser = async () => {
      try {
        // Check for Google OAuth callback FIRST (before checking public routes)
        const urlParams = new URLSearchParams(window.location.search);
        const authSuccess = urlParams.get('auth');
        const userDataParam = urlParams.get('user');
        
        // Debug OAuth callback
        
        if (authSuccess === 'success' && userDataParam) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('auth');
          newUrl.searchParams.delete('user');
          window.history.replaceState({}, '', newUrl.toString());
          
          try {
            // Parse user data from URL
            const userData = JSON.parse(decodeURIComponent(userDataParam));
            
            const userToStore: User = {
              _id: userData._id,
              username: userData.username || userData.email?.split('@')[0] || 'user',
              email: userData.email,
              profileImage: userData.profileImage,
              role: userData.role || 'user',
              token: userData.token // Store the JWT token for API calls
            };
            
            localStorage.setItem('userInfo', JSON.stringify(userToStore));
            if (isMounted) setUser(userToStore);
            if (isMounted) setLoading(false);
            return;
          } catch (error) {}
        }

        // Check if we're on a public route (after processing OAuth callback)
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath.includes('/news/') || 
                             currentPath.includes('/categories/') || 
                             currentPath.includes('/search') || 
                             currentPath === '/' || 
                             currentPath === '/en' || 
                             currentPath === '/kh';
        
        // Always check localStorage for stored user, even on public routes
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const isSessionValid = await verifyUserSession(storedUser);
          if (isSessionValid) {
            if (isMounted) setLoading(false);
            return;
          }
        }

        // For public routes, don't redirect even if no valid session
        if (isPublicRoute) {
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) setUser(null);
        // Only redirect for protected routes, not public routes like news articles
        // Use the already-declared currentPath above to avoid redeclaration
        if (
          !currentPath.includes('/login') && 
          !currentPath.includes('/news/') && 
          !currentPath.includes('/categories/') && 
          !currentPath.includes('/search') && 
          currentPath !== '/' && 
          currentPath !== '/en' && 
          currentPath !== '/kh'
        ) {
          router.push('/');
        }
      } catch {
        localStorage.removeItem('userInfo');
        if (isMounted) setUser(null);
        const currentPath = window.location.pathname;
        // Only redirect for protected routes, not public routes like news articles
        if (
          !currentPath.includes('/login') && 
          !currentPath.includes('/news/') && 
          !currentPath.includes('/categories/') && 
          !currentPath.includes('/search') && 
          currentPath !== '/' && 
          currentPath !== '/en' && 
          currentPath !== '/kh'
        ) {
          router.push('/');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Debounce initial verification
    const timeoutId = setTimeout(() => {
      verifyUser();
    }, 100);

    // Listen for route changes
    const handlePathChange = () => {
      verifyUser();
    };
    window.addEventListener('popstate', handlePathChange);
    if (typeof window !== 'undefined') {
      window.addEventListener('routeChangeStart', handlePathChange as EventListener);
    }

    // Initial verification
    verifyUser();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePathChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('routeChangeStart', handlePathChange as EventListener);
      }
    };
  }, [router, verifyUserSession]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      localStorage.removeItem('userInfo');
      setUser(null);

      const loginResponse = await api.post(
        '/auth/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 10000,
          withCredentials: true
        }
      );

      if (!loginResponse.data) throw new Error('No data received from server');

      let token: string | undefined;
      let userData: Partial<User> | null = null;

      if ('token' in loginResponse.data) {
        token = loginResponse.data.token;
        userData = loginResponse.data.user || loginResponse.data;
      } else if ('_id' in loginResponse.data) {
        userData = loginResponse.data;
        token = loginResponse.headers['authorization']?.split(' ')[1];
      }

      if (!token) throw new Error('No authentication token received');

      if (!userData) {
        try {
          const profileResponse = await api.get('/auth/profile');
          if (profileResponse.data) userData = profileResponse.data;
        } catch {
          // ignore
        }
      }

      if (!userData) throw new Error('Could not retrieve user information');

      const requiredFields = ['_id', 'email'] as const;
      const missingFields = requiredFields.filter(field => !userData![field]);
      if (missingFields.length > 0 || !userData._id) {
        throw new Error('Incomplete user data received');
      }

      const userToStore: User = {
        _id: userData._id,
        username: userData.username || email.split('@')[0],
        email: userData.email || email,
        role: (userData.role as User['role']) || 'user',
        token
      };

      localStorage.setItem('userInfo', JSON.stringify(userToStore));
      setUser(userToStore);

      // Verify token by fetching profile
      try {
        const profileResponse = await api.get('/auth/profile');
        if (!profileResponse.data) throw new Error('No profile data received');
        const updatedUser: User = {
          _id: profileResponse.data._id || userData._id,
          username: profileResponse.data.username || userToStore.username,
          email: profileResponse.data.email || userToStore.email,
          profileImage: profileResponse.data.profileImage,
          role: profileResponse.data.role || userToStore.role,
          token
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        // Get current language from URL or default to 'en'
        const currentPath = window.location.pathname;
        const langMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
        const currentLang = langMatch ? langMatch[1] : 'en';
        
        const redirectPath = updatedUser.role === 'admin' ? `/${currentLang}/admin/dashboard` : `/${currentLang}`;
        router.push(redirectPath);
      } catch {
        localStorage.removeItem('userInfo');
        setUser(null);
        throw new Error('Failed to verify user session');
      }
    } catch (error: unknown) {
      localStorage.removeItem('userInfo');
      setUser(null);

      let userFacingMessage = 'Login failed. Please try again.';

      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          const errorResponse = error.response as { data?: unknown; status?: number };
          const errorData = errorResponse?.data;
          const errorStatus = errorResponse?.status;
          if (errorStatus === 401) {
            userFacingMessage = 'Invalid email or password';
          } else if (errorStatus === 403) {
            userFacingMessage = 'Account not authorized';
          } else if (
            typeof errorData === 'object' &&
            errorData !== null &&
            'message' in errorData &&
            typeof (errorData as { message: unknown }).message === 'string'
          ) {
            userFacingMessage = (errorData as { message: string }).message;
          }
        } else if ('request' in error) {
          userFacingMessage = 'No response from server. Please check your connection.';
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          userFacingMessage = (error as { message: string }).message;
        }
      }

      const loginError = new Error(userFacingMessage);
      loginError.name =
        error && typeof error === 'object' && 'name' in error && typeof (error as { name: unknown }).name === 'string'
          ? (error as { name: string }).name
          : 'LoginError';
      throw loginError;
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      localStorage.removeItem('userInfo');
      setUser(null);

      const registerResponse = await api.post(
        '/auth/register',
        { username, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 10000,
          withCredentials: true
        }
      );

      if (!registerResponse.data) throw new Error('No data received from server');

      let token: string | undefined;
      let userData: Partial<User> | null = null;

      if ('token' in registerResponse.data) {
        token = registerResponse.data.token;
        userData = registerResponse.data.user || registerResponse.data;
      } else if ('_id' in registerResponse.data) {
        userData = registerResponse.data;
        token = registerResponse.headers['authorization']?.split(' ')[1];
      }

      if (!token) throw new Error('No authentication token received');

      if (!userData) {
        try {
          const profileResponse = await api.get('/auth/profile');
          if (profileResponse.data) userData = profileResponse.data;
        } catch {
          // ignore
        }
      }

      if (!userData) throw new Error('Could not retrieve user information');

      const userToStore: User = {
        _id: userData._id || '',
        username: userData.username || username,
        email: userData.email || email,
        role: (userData.role as User['role']) || 'user',
        token
      };

      localStorage.setItem('userInfo', JSON.stringify(userToStore));
      setUser(userToStore);

      // Verify token by fetching profile
      try {
        const profileResponse = await api.get('/auth/profile');
        if (!profileResponse.data) throw new Error('No profile data received');
        const updatedUser: User = {
          _id: profileResponse.data._id || userData._id,
          username: profileResponse.data.username || userToStore.username,
          email: profileResponse.data.email || userToStore.email,
          profileImage: profileResponse.data.profileImage,
          role: profileResponse.data.role || userToStore.role,
          token
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        // Get current language from URL or default to 'en'
        const currentPath = window.location.pathname;
        const langMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
        const currentLang = langMatch ? langMatch[1] : 'en';
        
        const redirectPath = updatedUser.role === 'admin' ? `/${currentLang}/admin/dashboard` : `/${currentLang}`;
        router.push(redirectPath);
      } catch {
        localStorage.removeItem('userInfo');
        setUser(null);
        throw new Error('Failed to verify user session');
      }
    } catch (error: unknown) {
      localStorage.removeItem('userInfo');
      setUser(null);

      let userFacingMessage = 'Registration failed. Please try again.';

      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          const errorResponse = error.response as { data?: unknown; status?: number };
          const errorStatus = errorResponse?.status;
          const errorData = errorResponse?.data;
          if (errorStatus === 409) {
            userFacingMessage = 'User already exists with this email or username.';
          } else if (errorStatus === 400) {
            userFacingMessage = 'Invalid registration data. Please check your input.';
          } else if (
            typeof errorData === 'object' &&
            errorData !== null &&
            'message' in errorData &&
            typeof (errorData as { message: unknown }).message === 'string'
          ) {
            userFacingMessage = (errorData as { message: string }).message;
          }
        } else if ('request' in error) {
          userFacingMessage = 'No response from server. Please check your connection.';
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          userFacingMessage = (error as { message: string }).message;
        }
      }

      const registerError = new Error(userFacingMessage);
      registerError.name =
        error && typeof error === 'object' && 'name' in error && typeof (error as { name: unknown }).name === 'string'
          ? (error as { name: string }).name
          : 'RegisterError';
      throw registerError;
    }
  };

  // Google login
  const loginWithGoogle = async () => {
    try {
      localStorage.removeItem('userInfo');
      setUser(null);
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/google`;
      window.location.href = googleAuthUrl;
    } catch (error: unknown) {
      localStorage.removeItem('userInfo');
      setUser(null);
      let userFacingMessage = 'Google authentication is not available. Please use email/password login instead.';
      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          const errorResponse = error.response as { data?: unknown };
          const errorData = errorResponse?.data;
          if (errorData && typeof errorData === 'object' && 'message' in errorData && typeof (errorData as { message: unknown }).message === 'string') {
            userFacingMessage = (errorData as { message: string }).message;
          }
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          userFacingMessage = (error as { message: string }).message;
        }
      }
      const googleError = new Error(userFacingMessage);
      googleError.name = 'GoogleAuthError';
      throw googleError;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/');
  };

  // Update user in state and localStorage
  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      // Get current language from URL
      const currentPath = window.location.pathname;
      const langMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
      const currentLang = langMatch ? langMatch[1] : 'en';
      
      const response = await api.post('/auth/forgot-password', { 
        email, 
        language: currentLang 
      });
      
      if (response.data.success) {
        // For development, we'll show the reset URL in the response
        // In production, this would be sent via email
        console.log('Reset URL:', response.data.resetUrl);
        return response.data;
      } else {
        throw new Error('Failed to send reset email');
      }
    } catch (error: unknown) {
      let userFacingMessage = 'Failed to send reset email. Please try again.';

      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          const errorResponse = error.response as { data?: unknown; status?: number };
          const errorStatus = errorResponse?.status;
          const errorData = errorResponse?.data;
          
          if (errorStatus === 404) {
            userFacingMessage = 'No account found with this email address.';
          } else if (errorStatus === 500) {
            userFacingMessage = 'Server error. Please try again later.';
          } else if (
            typeof errorData === 'object' &&
            errorData !== null &&
            'message' in errorData &&
            typeof (errorData as { message: unknown }).message === 'string'
          ) {
            userFacingMessage = (errorData as { message: string }).message;
          }
        } else if ('request' in error) {
          userFacingMessage = 'No response from server. Please check your connection.';
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          userFacingMessage = (error as { message: string }).message;
        }
      }

      const forgotPasswordError = new Error(userFacingMessage);
      forgotPasswordError.name = 'ForgotPasswordError';
      throw forgotPasswordError;
    }
  };

  // Verify PIN and reset password function
  const verifyPinAndResetPassword = async (email: string, pin: string, password: string) => {
    try {
      const response = await api.post('/auth/verify-pin-reset', { 
        email, 
        pin, 
        password 
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error: unknown) {
      let userFacingMessage = 'Failed to reset password. Please try again.';
      
      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          const errorResponse = error.response as { data?: unknown; status?: number };
          const errorStatus = errorResponse?.status;
          const errorData = errorResponse?.data;
          
          if (errorStatus === 400) {
            userFacingMessage = 'Invalid or expired PIN. Please request a new password reset.';
          } else if (errorStatus === 404) {
            userFacingMessage = 'User not found. Please check your email address.';
          } else if (errorStatus === 500) {
            userFacingMessage = 'Server error. Please try again later.';
          } else if (
            typeof errorData === 'object' &&
            errorData !== null &&
            'message' in errorData &&
            typeof (errorData as { message: unknown }).message === 'string'
          ) {
            userFacingMessage = (errorData as { message: string }).message;
          }
        } else if ('request' in error) {
          userFacingMessage = 'No response from server. Please check your connection.';
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          userFacingMessage = (error as { message: string }).message;
        }
      }

      const resetPasswordError = new Error(userFacingMessage);
      resetPasswordError.name = 'ResetPasswordError';
      throw resetPasswordError;
    }
  };

  // Reset password function (legacy token method)
  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error: unknown) {
      let userFacingMessage = 'Failed to reset password. Please try again.';

      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          const errorResponse = error.response as { data?: unknown; status?: number };
          const errorStatus = errorResponse?.status;
          const errorData = errorResponse?.data;
          
          if (errorStatus === 400) {
            userFacingMessage = 'Invalid or expired reset token. Please request a new password reset.';
          } else if (errorStatus === 500) {
            userFacingMessage = 'Server error. Please try again later.';
          } else if (
            typeof errorData === 'object' &&
            errorData !== null &&
            'message' in errorData &&
            typeof (errorData as { message: unknown }).message === 'string'
          ) {
            userFacingMessage = (errorData as { message: string }).message;
          }
        } else if ('request' in error) {
          userFacingMessage = 'No response from server. Please check your connection.';
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          userFacingMessage = (error as { message: string }).message;
        }
      }

      const resetPasswordError = new Error(userFacingMessage);
      resetPasswordError.name = 'ResetPasswordError';
      throw resetPasswordError;
    }
  };

  const value = { user, loading, login, register, loginWithGoogle, logout, updateUser, forgotPassword, verifyPinAndResetPassword, resetPassword };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};