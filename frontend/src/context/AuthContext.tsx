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

    const verifyUser = async () => {
      try {
        // Google OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const authSuccess = urlParams.get('auth');
        const userDataParam = urlParams.get('user');
        
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
              role: userData.role || 'user'
            };
            
            localStorage.setItem('userInfo', JSON.stringify(userToStore));
            if (isMounted) setUser(userToStore);
            if (isMounted) setLoading(false);
            return;
          } catch (error) {
            console.error('Failed to parse user data from OAuth callback:', error);
          }
        }

        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const isSessionValid = await verifyUserSession(storedUser);
          if (isSessionValid) {
            if (isMounted) setLoading(false);
            return;
          }
        }

        if (isMounted) setUser(null);
        const currentPath = window.location.pathname;
        if (
          !currentPath.includes('/login') &&
          currentPath !== '/' &&
          currentPath !== '/en' &&
          currentPath !== '/km'
        ) {
          router.push('/');
        }
      } catch {
        localStorage.removeItem('userInfo');
        if (isMounted) setUser(null);
        const currentPath = window.location.pathname;
        if (
          !currentPath.includes('/login') &&
          currentPath !== '/' &&
          currentPath !== '/en' &&
          currentPath !== '/km'
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
        const redirectPath = updatedUser.role === 'admin' ? '/admin/dashboard' : '/';
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
        const redirectPath = updatedUser.role === 'admin' ? '/admin/dashboard' : '/';
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

  const value = { user, loading, login, register, loginWithGoogle, logout, updateUser };

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