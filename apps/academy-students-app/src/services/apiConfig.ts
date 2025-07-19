/**
 * API Configuration for Academy Students App
 * 
 * This file shows how to configure the shared API client
 * for the students mobile app with proper authentication
 * and error handling.
 */

import { ApiClient } from '@shared/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_CONFIG = {
  // Use environment variables or config for different environments
  baseURL: __DEV__ 
    ? 'http://localhost:8000/api/v1'  // Development
    : 'https://api.academy.com/api/v1', // Production
  
  timeout: 30000, // 30 seconds
  
  // Storage keys for AsyncStorage
  storageKeys: {
    authToken: '@academy_students_auth_token',
    refreshToken: '@academy_students_refresh_token',
    userProfile: '@academy_students_user_profile',
  },
};

// Token storage functions using AsyncStorage
const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.storageKeys.authToken);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.storageKeys.authToken, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.storageKeys.authToken);
      await AsyncStorage.removeItem(API_CONFIG.storageKeys.refreshToken);
      await AsyncStorage.removeItem(API_CONFIG.storageKeys.userProfile);
    } catch (error) {
      console.error('Error removing auth tokens:', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.storageKeys.refreshToken);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.storageKeys.refreshToken, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },
};

// Create and configure the API client instance
export const apiClient = new ApiClient({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  
  // Authentication token management
  getAuthToken: tokenStorage.getToken,
  setAuthToken: tokenStorage.setToken,
  removeAuthToken: tokenStorage.removeToken,
  
  // Refresh token management
  getRefreshToken: tokenStorage.getRefreshToken,
  setRefreshToken: tokenStorage.setRefreshToken,
  
  // Custom headers for mobile app
  defaultHeaders: {
    'User-Agent': 'Academy-Students-Mobile/1.0.0',
    'X-Platform': 'mobile',
    'X-App-Version': '1.0.0',
  },
  
  // Error handling
  onUnauthorized: async () => {
    // Handle logout when token expires
    await tokenStorage.removeToken();
    // Navigate to login screen
    // This should be handled by your navigation/auth context
    console.log('User session expired, redirecting to login');
  },
  
  onNetworkError: (error) => {
    console.error('Network error:', error);
    // Handle network errors (show offline message, retry logic, etc.)
  },
});

// Utility functions for authentication
export const authUtils = {
  /**
   * Login with username/password
   */
  async login(username: string, password: string): Promise<any> {
    try {
      const response = await apiClient.auth.login({ username, password });
      
      // Store tokens
      if (response.data.access_token) {
        await tokenStorage.setToken(response.data.access_token);
      }
      if (response.data.refresh_token) {
        await tokenStorage.setRefreshToken(response.data.refresh_token);
      }
      
      // Store user profile
      if (response.data.user) {
        await AsyncStorage.setItem(
          API_CONFIG.storageKeys.userProfile,
          JSON.stringify(response.data.user)
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear all stored data
      await tokenStorage.removeToken();
    }
  },

  /**
   * Get stored user profile
   */
  async getStoredUserProfile(): Promise<any | null> {
    try {
      const profileStr = await AsyncStorage.getItem(API_CONFIG.storageKeys.userProfile);
      return profileStr ? JSON.parse(profileStr) : null;
    } catch (error) {
      console.error('Error getting stored user profile:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getToken();
    return !!token;
  },
};

export default apiClient;