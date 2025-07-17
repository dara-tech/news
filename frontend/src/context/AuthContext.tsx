'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  token?: string;
}

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

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
          setLoading(false);
          return;
        }

        // Verify session with backend using the profile endpoint
        try {
          const { data } = await api.get('/auth/profile', { withCredentials: true });
          // Session is valid, update user data
          const userData = {
            _id: data._id,
            username: data.username,
            email: data.email,
            role: data.role
          };
          localStorage.setItem('userInfo', JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error('Session verification failed, logging out:', error);
          // Session is invalid, clear local storage
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔑 [AuthContext] Login attempt started for email:', email);
    
    try {
      // Clear any existing user data
      localStorage.removeItem('userInfo');
      setUser(null);

      // Make login request with credentials
      console.log('🔍 [AuthContext] Sending login request to /auth/login');
      const loginResponse = await api.post('/auth/login', 
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('✅ [AuthContext] Login response status:', loginResponse.status);
      console.log('🔑 [AuthContext] Login response data:', loginResponse.data);
      
      // Verify response data structure
      console.log('🔍 [AuthContext] Verifying login response data');
      
      if (!loginResponse.data) {
        console.error('❌ [AuthContext] No data in login response');
        throw new Error('No data received from server');
      }
      
      // Log the complete response for debugging
      console.log('🔍 [AuthContext] Full login response:', JSON.stringify(loginResponse.data, null, 2));
      
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
      
      console.log('🔍 [AuthContext] Extracted data:', {
        hasToken: !!token,
        userData: userData ? Object.keys(userData) : 'No user data',
        headers: Object.keys(loginResponse.headers)
      });
      
      if (!token) {
        console.error('❌ [AuthContext] No token in response');
        throw new Error('No authentication token received');
      }
      
      // If we still don't have userData, try to get it from the profile endpoint
      if (!userData) {
        console.log('ℹ️ [AuthContext] No user data in login response, trying profile endpoint');
        try {
          const profileResponse = await api.get('/auth/profile');
          if (profileResponse.data) {
            userData = profileResponse.data;
            console.log('✅ [AuthContext] Retrieved user data from profile endpoint');
          }
        } catch (profileError) {
          console.error('❌ [AuthContext] Failed to fetch user profile:', profileError);
        }
      }
      
      if (!userData) {
        console.error('❌ [AuthContext] No user data available after all attempts');
        throw new Error('Could not retrieve user information');
      }
      
      // Ensure required fields exist and are non-empty
      const requiredFields = ['_id', 'email'] as const;
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0 || !userData._id) {
        console.error('❌ [AuthContext] Incomplete user data:', {
          receivedKeys: Object.keys(userData),
          missingRequiredFields: missingFields,
          hasId: !!userData._id,
          hasEmail: !!userData.email
        });
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
      
      console.log('💾 [AuthContext] Storing user data in localStorage');
      localStorage.setItem('userInfo', JSON.stringify(userToStore));
      setUser(userToStore);
      
      // Verify the token by fetching user profile
      try {
        console.log('🔍 [AuthContext] Verifying token by fetching user profile');
        const profileResponse = await api.get('/auth/profile');
        
        if (!profileResponse.data) {
          throw new Error('No profile data received');
        }
        
        console.log('👤 [AuthContext] Profile verification successful');
        
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
        console.log(`🔄 [AuthContext] Authentication successful, redirecting to: ${redirectPath}`);
        
        // Use router.push for client-side navigation
        router.push(redirectPath);
        
      } catch (profileError) {
        console.error('❌ [AuthContext] Profile verification failed:', profileError);
        // Clear invalid token and re-throw
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

      // Log the error with type-safe access
      const errorResponse = isErrorWithResponse(error) ? error.response : undefined;
      const errorData = errorResponse?.data;
      const errorStatus = errorResponse?.status;
      const errorRequest = isErrorWithRequest(error) ? error.request : undefined;
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';

      console.error('❌ [AuthContext] Login failed:', {
        error: errorData || errorMessage,
        status: errorStatus,
        request: errorRequest ? 'Request object exists' : 'No request object'
      });
      
      // Clean up on error
      localStorage.removeItem('userInfo');
      setUser(null);
      
      // Provide more specific error messages
      let userFacingMessage = 'Login failed. Please try again.';
      
      if (errorResponse) {
        // Server responded with error status
        if (errorStatus === 401) {
          userFacingMessage = 'Invalid email or password';
        } else if (errorStatus === 403) {
          userFacingMessage = 'Account not authorized';
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string') {
          userFacingMessage = errorData.message;
        }
      } else if (errorRequest) {
        // Request was made but no response
        userFacingMessage = 'No response from server. Please check your connection.';
      } else if (isErrorWithMessage(error)) {
        // Other errors with message
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
    router.push('/login');
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
