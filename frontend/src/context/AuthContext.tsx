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
      
      // Verify response data
      if (!loginResponse.data) {
        throw new Error('No data received from server');
      }
      
      const { token, user: userData } = loginResponse.data;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      if (!userData || !userData._id) {
        throw new Error('Incomplete user data received');
      }
      
      // Store user data in localStorage
      const userToStore = {
        _id: userData._id,
        username: userData.username || email.split('@')[0],
        email: userData.email || email,
        role: userData.role || 'user',
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
      
    } catch (error: any) {
      console.error('❌ [AuthContext] Login failed:', {
        error: error?.response?.data || error.message,
        status: error?.response?.status,
        config: error?.config
      });
      
      // Clean up on error
      localStorage.removeItem('userInfo');
      setUser(null);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 403) {
          errorMessage = 'Account not authorized';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Other errors
        errorMessage = error.message;
      }
      
      // Create a new error with the appropriate message
      const loginError = new Error(errorMessage);
      loginError.name = error.name || 'LoginError';
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
