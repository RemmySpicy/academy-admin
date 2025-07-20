/**
 * Token management utility for authentication
 */

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'academy_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'academy_refresh_token';
  private static readonly EXPIRES_AT_KEY = 'academy_token_expires_at';
  
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken || null;
    
    // Calculate expiration time (default to 1 hour if not provided)
    const expirationTime = expiresIn || 3600;
    this.expiresAt = Date.now() + (expirationTime * 1000);
    
    this.saveTokensToStorage();
  }

  /**
   * Get current access token if valid
   */
  getAccessToken(): string | null {
    if (this.isTokenValid()) {
      return this.accessToken;
    }
    return null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Get valid token (refresh if necessary)
   */
  async getValidToken(): Promise<string | null> {
    if (this.isTokenValid()) {
      return this.accessToken;
    }

    // Try to refresh token
    if (this.refreshToken) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.accessToken;
      }
    }

    return null;
  }

  /**
   * Check if current token is valid
   */
  isTokenValid(): boolean {
    if (!this.accessToken || !this.expiresAt) {
      return false;
    }
    
    // Check if token expires in the next 5 minutes (buffer time)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() < (this.expiresAt - bufferTime);
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      // This would make an API call to refresh the token
      // For now, we'll implement a placeholder
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token, data.expires_in);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Clear invalid tokens
    this.clearTokens();
    return false;
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.removeTokensFromStorage();
  }

  /**
   * Get token expiration time
   */
  getExpiresAt(): number | null {
    return this.expiresAt;
  }

  /**
   * Check if tokens exist (regardless of validity)
   */
  hasTokens(): boolean {
    return Boolean(this.accessToken);
  }

  /**
   * Load tokens from storage (localStorage for web, secure storage for mobile)
   */
  private loadTokensFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        this.accessToken = localStorage.getItem(TokenManager.ACCESS_TOKEN_KEY);
        this.refreshToken = localStorage.getItem(TokenManager.REFRESH_TOKEN_KEY);
        const expiresAtStr = localStorage.getItem(TokenManager.EXPIRES_AT_KEY);
        this.expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      } else {
        // Mobile environment - would use secure storage
        // This would be implemented with react-native-keychain or similar
        console.log('Mobile token storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
    }
  }

  /**
   * Save tokens to storage
   */
  private saveTokensToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        if (this.accessToken) {
          localStorage.setItem(TokenManager.ACCESS_TOKEN_KEY, this.accessToken);
        }
        if (this.refreshToken) {
          localStorage.setItem(TokenManager.REFRESH_TOKEN_KEY, this.refreshToken);
        }
        if (this.expiresAt) {
          localStorage.setItem(TokenManager.EXPIRES_AT_KEY, this.expiresAt.toString());
        }
      } else {
        // Mobile environment - would use secure storage
        console.log('Mobile token storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  /**
   * Remove tokens from storage
   */
  private removeTokensFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        localStorage.removeItem(TokenManager.ACCESS_TOKEN_KEY);
        localStorage.removeItem(TokenManager.REFRESH_TOKEN_KEY);
        localStorage.removeItem(TokenManager.EXPIRES_AT_KEY);
      } else {
        // Mobile environment
        console.log('Mobile token storage cleanup not implemented yet');
      }
    } catch (error) {
      console.error('Failed to remove tokens from storage:', error);
    }
  }
}