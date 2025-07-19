/**
 * API Configuration for Academy Tutor App
 * 
 * This file shows how to configure the shared API client
 * for the tutor mobile app with proper authentication,
 * program context, and error handling.
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
    authToken: '@academy_tutor_auth_token',
    refreshToken: '@academy_tutor_refresh_token',
    userProfile: '@academy_tutor_user_profile',
    selectedProgram: '@academy_tutor_selected_program',
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
      await AsyncStorage.removeItem(API_CONFIG.storageKeys.selectedProgram);
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

// Program context management
const programContextManager = {
  async getSelectedProgram(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.storageKeys.selectedProgram);
    } catch (error) {
      console.error('Error getting selected program:', error);
      return null;
    }
  },

  async setSelectedProgram(programId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.storageKeys.selectedProgram, programId);
      // Update API client with new program context
      apiClient.setDefaultHeader('X-Program-Context', programId);
    } catch (error) {
      console.error('Error setting selected program:', error);
    }
  },

  async clearSelectedProgram(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.storageKeys.selectedProgram);
      apiClient.removeDefaultHeader('X-Program-Context');
    } catch (error) {
      console.error('Error clearing selected program:', error);
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
    'User-Agent': 'Academy-Tutor-Mobile/1.0.0',
    'X-Platform': 'mobile',
    'X-App-Version': '1.0.0',
  },
  
  // Error handling
  onUnauthorized: async () => {
    // Handle logout when token expires
    await tokenStorage.removeToken();
    await programContextManager.clearSelectedProgram();
    // Navigate to login screen
    console.log('User session expired, redirecting to login');
  },
  
  onNetworkError: (error) => {
    console.error('Network error:', error);
    // Handle network errors (show offline message, retry logic, etc.)
  },
});

// Initialize program context if available
(async () => {
  const selectedProgram = await programContextManager.getSelectedProgram();
  if (selectedProgram) {
    apiClient.setDefaultHeader('X-Program-Context', selectedProgram);
  }
})();

// Utility functions for authentication and program management
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
      await programContextManager.clearSelectedProgram();
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

export const programUtils = {
  /**
   * Get user's assigned programs
   */
  async getAssignedPrograms(): Promise<any[]> {
    try {
      const response = await apiClient.programs.list();
      return response.data.items;
    } catch (error) {
      console.error('Error fetching assigned programs:', error);
      throw error;
    }
  },

  /**
   * Select active program
   */
  async selectProgram(programId: string): Promise<void> {
    await programContextManager.setSelectedProgram(programId);
  },

  /**
   * Get currently selected program
   */
  async getSelectedProgram(): Promise<string | null> {
    return await programContextManager.getSelectedProgram();
  },

  /**
   * Clear program selection
   */
  async clearProgramSelection(): Promise<void> {
    await programContextManager.clearSelectedProgram();
  },
};

export default apiClient;