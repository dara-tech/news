'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to verify user session with the backend
  const verifyUserSession = async (storedUser: string | null) => {
    if (!storedUser) {
      return false;
    }

    try {
      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await api.get('/auth/profile', { 
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        // Don't retry on 401/403
        validateStatus: (status) => status < 500
      });

      // If we get a successful response, update the user data
      if (response.status >= 200 && response.status < 300) {
        const { data } = response;
        
        // Parse the stored user data
        let token: string | undefined;
        try {
          const currentUser = JSON.parse(storedUser);
          token = currentUser.token;
        } catch {
          // ignore parse error
        }
        
        // Create user data with token if it exists
        const userData: User = {
          _id: data._id,
          username: data.username || data.email?.split('@')[0] || 'user',
          email: data.email,
          role: data.role || 'user',
          ...(token && { token })
        };
        
        // Update localStorage with fresh user data
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        // Handle non-2xx responses
        localStorage.removeItem('userInfo');
        setUser(null);
        return false;
      }
    } catch {
      // Clear invalid session data
      localStorage.removeItem('userInfo');
      setUser(null);
      return false;
    }
  };

  // Effect to handle initial session verification and route protection
  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      
      try {
        const storedUser = localStorage.getItem('userInfo');
        
        // If we have a stored user, try to verify the session
        if (storedUser) {
          const isSessionValid = await verifyUserSession(storedUser);
          if (isSessionValid) {
            setLoading(false);
            return;
          }
        }
        
        // If we get here, either there's no stored user or the session is invalid
        setUser(null);

        const currentPath = window.location.pathname;
        // Prevent redirect loop if already on a language homepage
        if (!currentPath.includes('/login') && currentPath !== '/' && currentPath !== '/en' && currentPath !== '/km') {
          router.push('/');
        }
        
      } catch {
        localStorage.removeItem('userInfo');
        setUser(null);

        const currentPathOnError = window.location.pathname;
        if (!currentPathOnError.includes('/login') && currentPathOnError !== '/' && currentPathOnError !== '/en' && currentPathOnError !== '/km') {
          router.push('/');
        }
        
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure auth state is properly initialized
    const timeoutId = setTimeout(() => {
      verifyUser();
    }, 100);

    // For Next.js App Router, we'll verify on mount and when the pathname changes
    const handlePathChange = () => {
      verifyUser();
    };

    // Add event listener for path changes
    window.addEventListener('popstate', handlePathChange);
    
    // For Next.js App Router, we can use the router's events if available
    if (typeof window !== 'undefined') {
      window.addEventListener('routeChangeStart', handlePathChange as EventListener);
    }

    // Initial verification
    verifyUser();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePathChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('routeChangeStart', handlePathChange as EventListener);
      }
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing user data
      localStorage.removeItem('userInfo');
      setUser(null);

      // Make login request with credentials
      const loginResponse = await api.post('/auth/login', 
        { email, password },
        { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 10000, // 10 second timeout
          withCredentials: true // Include credentials (cookies) with the request
        }
      );
      
      if (!loginResponse.data) {
        throw new Error('No data received from server');
      }
      
      // Handle different response structures
      let token: string | undefined;
      let userData: Partial<User> | null = null;
      
      // Case 1: Response has token and user fields
      if ('token' in loginResponse.data) {
        token = loginResponse.data.token;
        userData = loginResponse.data.user || loginResponse.data; // Try both user field and root level
      } 
      // Case 2: Response might have the user data directly (without token)
      else if ('_id' in loginResponse.data) {
        userData = loginResponse.data;
        token = loginResponse.headers['authorization']?.split(' ')[1]; // Try to get token from headers
      }
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      // If we still don't have userData, try to get it from the profile endpoint
      if (!userData) {
        try {
          const profileResponse = await api.get('/auth/profile');
          if (profileResponse.data) {
            userData = profileResponse.data;
          }
        } catch {
          // ignore
        }
      }
      
      if (!userData) {
        throw new Error('Could not retrieve user information');
      }
      
      // Ensure required fields exist and are non-empty
      const requiredFields = ['_id', 'email'] as const;
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0 || !userData._id) {
        throw new Error('Incomplete user data received');
      }
      
      // Store user data in localStorage
      const userToStore: User = {
        _id: userData._id, // We've already verified this exists
        username: userData.username || email.split('@')[0],
        email: userData.email || email,
        role: (userData.role as User['role']) || 'user',
        token
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userToStore));
      setUser(userToStore);
      
      // Verify the token by fetching user profile
      try {
        const profileResponse = await api.get('/auth/profile');
        
        if (!profileResponse.data) {
          throw new Error('No profile data received');
        }
        
        // Update user data with fresh profile data
        const updatedUser = {
          _id: profileResponse.data._id || userData._id,
          username: profileResponse.data.username || userToStore.username,
          email: profileResponse.data.email || userToStore.email,
          role: profileResponse.data.role || userToStore.role,
          token
        };
        
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Determine redirect path based on role
        const redirectPath = updatedUser.role === 'admin' ? '/admin/dashboard' : '/';
        
        // Use router.push for client-side navigation
        router.push(redirectPath);
        
      } catch {
        localStorage.removeItem('userInfo');
        setUser(null);
        throw new Error('Failed to verify user session');
      }
      
    } catch (error: unknown) {
      // Type guard to check if error is an object
      const isErrorWithResponse = (e: unknown): e is { response: { data?: unknown; status?: number } } => {
        return typeof e === 'object' && e !== null && 'response' in e;
      };

      const isErrorWithRequest = (e: unknown): e is { request: unknown } => {
        return typeof e === 'object' && e !== null && 'request' in e;
      };

      const isErrorWithMessage = (e: unknown): e is { message: string } => {
        return typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string';
      };

      // Type guard to check if error has a name property
      const isErrorWithName = (e: unknown): e is { name: string } => {
        return typeof e === 'object' && e !== null && 'name' in e && typeof (e as { name: unknown }).name === 'string';
      };

      // Clean up on error
      localStorage.removeItem('userInfo');
      setUser(null);
      
      // Provide more specific error messages
      let userFacingMessage = 'Login failed. Please try again.';
      
      if (isErrorWithResponse(error)) {
        const errorResponse = error.response;
        const errorData = errorResponse?.data;
        const errorStatus = errorResponse?.status;
        if (errorStatus === 401) {
          userFacingMessage = 'Invalid email or password';
        } else if (errorStatus === 403) {
          userFacingMessage = 'Account not authorized';
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string') {
          userFacingMessage = errorData.message;
        }
      } else if (isErrorWithRequest(error)) {
        userFacingMessage = 'No response from server. Please check your connection.';
      } else if (isErrorWithMessage(error)) {
        userFacingMessage = error.message;
      }
      
      // Create a new error with the appropriate message
      const loginError = new Error(userFacingMessage);
      loginError.name = isErrorWithName(error) ? error.name : 'LoginError';
      throw loginError;
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = { user, loading, login, logout, updateUser };

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