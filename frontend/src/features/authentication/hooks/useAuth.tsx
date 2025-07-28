'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApiService } from '../api/authApiService';

// Types for the auth context
interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize auth from storage and set up API client
        const storedUser = authApiService.initializeAuth();
        if (storedUser && authApiService.isAuthenticated()) {
          setUser(storedUser);
          
          // Verify with server
          const response = await authApiService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            // If server verification fails, clear auth
            authApiService.clearAuth();
            setUser(null);
          }
        }
      } catch (error) {
        // Clear auth on any error
        authApiService.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    console.log('useAuth login called with:', { username: credentials.username });
    setIsLoading(true);
    try {
      const response = await authApiService.login(credentials.username, credentials.password);
      console.log('Login API response:', { success: response.success, user: response.data?.user });
      
      if (response.success) {
        const loggedInUser = response.data.user;
        console.log('Setting user in auth context:', loggedInUser);
        setUser(loggedInUser);
        console.log('User set successfully');
        return loggedInUser; // Return the user immediately
      } else {
        console.error('Login failed:', response.error);
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('Starting logout process...');
    setIsLoading(true);
    
    try {
      // Call logout API (optional, don't throw on failure)
      await authApiService.logout();
      console.log('Logout API call successful');
    } catch (error) {
      // Ignore logout API errors
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local auth data
      console.log('Clearing auth data...');
      authApiService.clearAuth();
      setUser(null);
      setIsLoading(false);
      
      // Force page reload to ensure clean state
      console.log('Forcing page reload after logout...');
      window.location.reload();
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authApiService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      } else {
        // If refresh fails, clear auth
        authApiService.clearAuth();
        setUser(null);
      }
    } catch (error) {
      authApiService.clearAuth();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}