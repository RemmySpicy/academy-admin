'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApiService } from '../api/authApiService';
import { isApiSuccess, getApiErrorMessage } from '@/lib/api';

// Types for the real auth context
interface RealUser {
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
  user: RealUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function RealAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<RealUser | null>(null);
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
          if (isApiSuccess(response)) {
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

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApiService.login(credentials.username, credentials.password);
      
      if (isApiSuccess(response)) {
        setUser(response.data.user);
      } else {
        throw new Error(getApiErrorMessage(response));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Call logout API (optional, don't throw on failure)
      await authApiService.logout();
    } catch (error) {
      // Ignore logout API errors
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local auth data
      authApiService.clearAuth();
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authApiService.getCurrentUser();
      if (isApiSuccess(response)) {
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

export function useRealAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useRealAuth must be used within a RealAuthProvider');
  }
  return context;
}

// Helper hook for backward compatibility
export function useAuth(): AuthContextType {
  return useRealAuth();
}