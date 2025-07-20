/**
 * Cache management utility for offline support
 */

import { CacheEntry } from '../core/types';

export class CacheManager {
  private static readonly CACHE_PREFIX = 'academy_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50; // Maximum number of cache entries
  
  private enabled: boolean;
  private memoryCache: Map<string, CacheEntry> = new Map();

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
    
    if (this.enabled) {
      this.loadCacheFromStorage();
      this.startCleanupTimer();
    }
  }

  /**
   * Check if cache is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable cache
   */
  enable(): void {
    this.enabled = true;
    this.loadCacheFromStorage();
    this.startCleanupTimer();
  }

  /**
   * Disable cache
   */
  disable(): void {
    this.enabled = false;
    this.clear();
  }

  /**
   * Get cached data
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    const cacheKey = this.generateCacheKey(key);
    
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry && this.isEntryValid(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Check storage cache
    const storageEntry = await this.getFromStorage<T>(cacheKey);
    if (storageEntry && this.isEntryValid(storageEntry)) {
      // Update memory cache
      this.memoryCache.set(cacheKey, storageEntry);
      return storageEntry.data as T;
    }

    // Remove expired entries
    this.removeExpiredEntry(cacheKey);
    return null;
  }

  /**
   * Set cached data
   */
  async set<T = any>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const cacheKey = this.generateCacheKey(key);
    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      ttl: ttl || CacheManager.DEFAULT_TTL,
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, entry);

    // Store in persistent storage
    await this.saveToStorage(cacheKey, entry);

    // Cleanup if cache is too large
    await this.cleanupIfNeeded();
  }

  /**
   * Remove cached data
   */
  async remove(key: string): Promise<void> {
    const cacheKey = this.generateCacheKey(key);
    
    // Remove from memory cache
    this.memoryCache.delete(cacheKey);
    
    // Remove from storage
    await this.removeFromStorage(cacheKey);
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear storage cache
    await this.clearStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    enabled: boolean;
    memoryEntries: number;
    totalSize: number;
  } {
    return {
      enabled: this.enabled,
      memoryEntries: this.memoryCache.size,
      totalSize: this.calculateCacheSize(),
    };
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    
    // Remove from memory cache
    for (const [key] of this.memoryCache) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Remove from storage
    await this.invalidateStoragePattern(pattern);
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(key: string): string {
    return `${CacheManager.CACHE_PREFIX}${key}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Remove expired entry
   */
  private removeExpiredEntry(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromStorage(key);
  }

  /**
   * Load cache from storage
   */
  private loadCacheFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CacheManager.CACHE_PREFIX)) {
            try {
              const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '');
              if (this.isEntryValid(entry)) {
                this.memoryCache.set(key, entry);
              } else {
                localStorage.removeItem(key);
              }
            } catch (error) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  /**
   * Get entry from storage
   */
  private async getFromStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      } else {
        // Mobile environment - would use AsyncStorage
        console.log('Mobile cache storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to get from storage:', error);
    }
    return null;
  }

  /**
   * Save entry to storage
   */
  private async saveToStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        localStorage.setItem(key, JSON.stringify(entry));
      } else {
        // Mobile environment
        console.log('Mobile cache storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  /**
   * Remove entry from storage
   */
  private async removeFromStorage(key: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        localStorage.removeItem(key);
      } else {
        // Mobile environment
        console.log('Mobile cache storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }

  /**
   * Clear all storage
   */
  private async clearStorage(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CacheManager.CACHE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Invalidate storage entries matching pattern
   */
  private async invalidateStoragePattern(pattern: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        const regex = new RegExp(pattern);
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CacheManager.CACHE_PREFIX) && regex.test(key)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Failed to invalidate storage pattern:', error);
    }
  }

  /**
   * Calculate total cache size
   */
  private calculateCacheSize(): number {
    let totalSize = 0;
    for (const [, entry] of this.memoryCache) {
      try {
        totalSize += JSON.stringify(entry).length;
      } catch (error) {
        // Skip entries that can't be serialized
      }
    }
    return totalSize;
  }

  /**
   * Cleanup cache if needed
   */
  private async cleanupIfNeeded(): Promise<void> {
    if (this.memoryCache.size > CacheManager.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.memoryCache.entries());
      entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const entriesToRemove = entries.slice(0, entries.length - CacheManager.MAX_CACHE_SIZE);
      for (const [key] of entriesToRemove) {
        this.memoryCache.delete(key);
        await this.removeFromStorage(key);
      }
    }
  }

  /**
   * Start cleanup timer to remove expired entries
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      if (this.enabled) {
        this.cleanupExpiredEntries();
      }
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.memoryCache) {
      if ((now - entry.timestamp) >= entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.memoryCache.delete(key);
      this.removeFromStorage(key);
    });
  }
}