import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>; // we'll use name, email, password
  registerWithPassword: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hacktrack_auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('hacktrack_auth_token');
      if (savedToken) {
        try {
          const response = await apiClient.get('/auth/me');
          if (response.data && response.data.success) {
            setUser(response.data.data);
            setToken(savedToken);
          } else {
            throw new Error('Verification failed');
          }
        } catch (err: any) {
          console.warn('[AuthContext] Session expired or invalid token');
          localStorage.removeItem('hacktrack_auth_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { token: userToken, ...profile } = response.data.data;
        localStorage.setItem('hacktrack_auth_token', userToken);
        setUser(profile);
        setToken(userToken);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const registerWithPassword = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      if (response.data && response.data.success) {
        const { token: userToken, ...profile } = response.data.data;
        localStorage.setItem('hacktrack_auth_token', userToken);
        setUser(profile);
        setToken(userToken);
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Provide a generic register signature to satisfy simple calls
  const register = async (name: string, email: string) => {
    return registerWithPassword(name, email, 'defaultSecretPassword123');
  };

  const logout = () => {
    localStorage.removeItem('hacktrack_auth_token');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        login,
        register,
        registerWithPassword,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
