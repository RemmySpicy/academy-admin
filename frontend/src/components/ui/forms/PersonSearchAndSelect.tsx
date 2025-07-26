'use client';

/**
 * PersonSearchAndSelect Component
 * Reusable component for searching and selecting existing users (parents/children)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

// Types
interface UserSearchResult {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  profile_type: 'full_user' | 'profile_only';
  roles: string[];
}

interface PersonSearchAndSelectProps {
  placeholder?: string;
  searchLabel?: string;
  selectedPersons: UserSearchResult[];
  onPersonSelect: (person: UserSearchResult) => void;
  onPersonRemove: (personId: string) => void;
  onSearchFunction: (query: string) => Promise<UserSearchResult[]>;
  className?: string;
  maxSelections?: number;
  allowMultiple?: boolean;
  filterRoles?: string[]; // Filter by specific roles
  excludeIds?: string[]; // Exclude specific user IDs
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function PersonSearchAndSelect({
  placeholder = 'Search for a person by name, email, or phone...',
  searchLabel = 'Search People',
  selectedPersons,
  onPersonSelect,
  onPersonRemove,
  onSearchFunction,
  className,
  maxSelections,
  allowMultiple = true,
  filterRoles,
  excludeIds = [],
  disabled = false,
  required = false,
  error
}: PersonSearchAndSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchQuery]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || disabled) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await onSearchFunction(query);
      
      // Filter results based on criteria
      let filteredResults = results;

      // Filter by roles if specified
      if (filterRoles && filterRoles.length > 0) {
        filteredResults = filteredResults.filter(person =>
          person.roles.some(role => filterRoles.includes(role))
        );
      }

      // Exclude already selected persons and excluded IDs
      const excludedIds = new Set([
        ...selectedPersons.map(p => p.id),
        ...excludeIds
      ]);
      
      filteredResults = filteredResults.filter(person => 
        !excludedIds.has(person.id)
      );

      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearchFunction, filterRoles, selectedPersons, excludeIds, disabled]);

  const handlePersonSelect = (person: UserSearchResult) => {
    if (disabled) return;

    // Check max selections limit
    if (maxSelections && selectedPersons.length >= maxSelections) {
      return;
    }

    // For single selection, clear previous selections
    if (!allowMultiple && selectedPersons.length > 0) {
      selectedPersons.forEach(p => onPersonRemove(p.id));
    }

    onPersonSelect(person);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getPersonDisplayName = (person: UserSearchResult): string => {
    if (person.full_name) return person.full_name;
    if (person.email) return person.email;
    if (person.phone) return person.phone;
    return 'Unknown User';
  };

  const getPersonSubtext = (person: UserSearchResult): string => {
    const parts = [];
    if (person.email) parts.push(person.email);
    if (person.phone) parts.push(person.phone);
    return parts.join(' • ');
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      student: 'Student',
      parent: 'Parent',
      instructor: 'Instructor',
      program_admin: 'Program Admin',
      program_coordinator: 'Program Coordinator',
      super_admin: 'Super Admin'
    };
    return roleNames[role] || role;
  };

  const isMaxSelectionsReached = maxSelections && selectedPersons.length >= maxSelections;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {searchLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {maxSelections && (
          <span className="text-xs text-gray-500">
            {selectedPersons.length}/{maxSelections} selected
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchInputChange}
            disabled={disabled || isMaxSelectionsReached}
            className={cn(
              'pl-10 pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClearSearch}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="border shadow-lg">
          <CardContent className="p-2">
            {searchError ? (
              <div className="p-4 text-center text-red-600 text-sm">
                {searchError}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No people found matching "{debouncedSearchQuery}"
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {searchResults.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handlePersonSelect(person)}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getPersonDisplayName(person)}
                        </p>
                        {getPersonSubtext(person) && (
                          <p className="text-xs text-gray-500 truncate">
                            {getPersonSubtext(person)}
                          </p>
                        )}
                        <div className="flex items-center space-x-1 mt-1">
                          {person.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getRoleDisplayName(role)}
                            </Badge>
                          ))}
                          {person.profile_type === 'profile_only' && (
                            <Badge variant="outline" className="text-xs">
                              Profile Only
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 ml-2"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Persons */}
      {selectedPersons.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Selected {allowMultiple ? 'People' : 'Person'}:
          </label>
          <div className="space-y-2">
            {selectedPersons.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getPersonDisplayName(person)}
                    </p>
                    {getPersonSubtext(person) && (
                      <p className="text-xs text-gray-500 truncate">
                        {getPersonSubtext(person)}
                      </p>
                    )}
                  </div>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onPersonRemove(person.id)}
                    className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {!disabled && searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-xs text-gray-500">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}

export default PersonSearchAndSelect;