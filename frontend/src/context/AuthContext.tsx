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
    try {
      // Make sure to include credentials for cookies
      const { data } = await api.post('/auth/login', { email, password }, { withCredentials: true });
      
      // After successful login, fetch the user profile to verify authentication
      const profileResponse = await api.get('/auth/profile', { withCredentials: true });
      
      const userData = {
        _id: profileResponse.data._id,
        username: profileResponse.data.username,
        email: profileResponse.data.email,
        role: profileResponse.data.role,
        // Note: We're not storing the token in localStorage anymore
        // as it's now in an HTTP-only cookie
      };
      
      // Store only the user data, not the token
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      
      if (profileResponse.data.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Clean up on error
      localStorage.removeItem('userInfo');
      setUser(null);
      throw error; // Re-throw to handle in the UI
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
