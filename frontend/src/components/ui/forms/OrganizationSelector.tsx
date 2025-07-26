'use client';

/**
 * OrganizationSelector Component
 * Reusable component for searching and selecting partner organizations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Building2, X, Check, Loader2, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

// Types
interface OrganizationSearchResult {
  id: string;
  name: string;
  organization_type: string;
  contact_email?: string;
  contact_phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  is_partner: boolean;
  member_count?: number;
  status: 'active' | 'inactive' | 'pending';
}

interface OrganizationSelectorProps {
  placeholder?: string;
  searchLabel?: string;
  selectedOrganization?: OrganizationSearchResult | null;
  onOrganizationSelect: (organization: OrganizationSearchResult) => void;
  onOrganizationRemove: () => void;
  onSearchFunction: (query: string) => Promise<OrganizationSearchResult[]>;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  filterTypes?: string[]; // Filter by organization types
  partnersOnly?: boolean; // Only show partner organizations
  excludeIds?: string[]; // Exclude specific organization IDs
}

export function OrganizationSelector({
  placeholder = 'Search for an organization by name, email, or phone...',
  searchLabel = 'Select Organization',
  selectedOrganization,
  onOrganizationSelect,
  onOrganizationRemove,
  onSearchFunction,
  className,
  disabled = false,
  required = false,
  error,
  filterTypes,
  partnersOnly = false,
  excludeIds = []
}: OrganizationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OrganizationSearchResult[]>([]);
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

      // Filter by organization types if specified
      if (filterTypes && filterTypes.length > 0) {
        filteredResults = filteredResults.filter(org =>
          filterTypes.includes(org.organization_type)
        );
      }

      // Filter to partners only if specified
      if (partnersOnly) {
        filteredResults = filteredResults.filter(org => org.is_partner);
      }

      // Exclude specific IDs
      if (excludeIds.length > 0) {
        filteredResults = filteredResults.filter(org => !excludeIds.includes(org.id));
      }

      // Exclude already selected organization
      if (selectedOrganization) {
        filteredResults = filteredResults.filter(org => org.id !== selectedOrganization.id);
      }

      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Organization search error:', error);
      setSearchError('Failed to search organizations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearchFunction, filterTypes, partnersOnly, selectedOrganization, excludeIds, disabled]);

  const handleOrganizationSelect = (organization: OrganizationSearchResult) => {
    if (disabled) return;

    onOrganizationSelect(organization);
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

  const getOrganizationDisplayName = (org: OrganizationSearchResult): string => {
    return org.name || 'Unknown Organization';
  };

  const getOrganizationSubtext = (org: OrganizationSearchResult): string => {
    const parts = [];
    if (org.contact_email) parts.push(org.contact_email);
    if (org.contact_phone) parts.push(org.contact_phone);
    return parts.join(' • ');
  };

  const getAddressText = (org: OrganizationSearchResult): string => {
    if (!org.address) return '';
    const { street, city, state, country } = org.address;
    const parts = [];
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (country) parts.push(country);
    return parts.join(', ');
  };

  const getTypeDisplayName = (type: string): string => {
    const typeNames: Record<string, string> = {
      school: 'School',
      company: 'Company',
      non_profit: 'Non-Profit',
      government: 'Government',
      religious: 'Religious',
      sports_club: 'Sports Club',
      community: 'Community',
      other: 'Other'
    };
    return typeNames[type] || type;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {searchLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {/* Current Selection or Search Input */}
      {selectedOrganization ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Selected Organization:
          </label>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getOrganizationDisplayName(selectedOrganization)}
                </p>
                {getOrganizationSubtext(selectedOrganization) && (
                  <p className="text-xs text-gray-500 truncate">
                    {getOrganizationSubtext(selectedOrganization)}
                  </p>
                )}
                {getAddressText(selectedOrganization) && (
                  <p className="text-xs text-gray-500 truncate flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {getAddressText(selectedOrganization)}
                  </p>
                )}
                <div className="flex items-center space-x-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {getTypeDisplayName(selectedOrganization.organization_type)}
                  </Badge>
                  <Badge className={cn('text-xs', getStatusColor(selectedOrganization.status))}>
                    {selectedOrganization.status}
                  </Badge>
                  {selectedOrganization.is_partner && (
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      Partner
                    </Badge>
                  )}
                  {selectedOrganization.member_count !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {selectedOrganization.member_count} members
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onOrganizationRemove}
                className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={handleSearchInputChange}
                disabled={disabled}
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
                    No organizations found matching "{debouncedSearchQuery}"
                  </div>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {searchResults.map((organization) => (
                      <div
                        key={organization.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOrganizationSelect(organization)}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getOrganizationDisplayName(organization)}
                            </p>
                            {getOrganizationSubtext(organization) && (
                              <p className="text-xs text-gray-500 truncate">
                                {getOrganizationSubtext(organization)}
                              </p>
                            )}
                            {getAddressText(organization) && (
                              <p className="text-xs text-gray-500 truncate flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {getAddressText(organization)}
                              </p>
                            )}
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getTypeDisplayName(organization.organization_type)}
                              </Badge>
                              <Badge className={cn('text-xs', getStatusColor(organization.status))}>
                                {organization.status}
                              </Badge>
                              {organization.is_partner && (
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                  Partner
                                </Badge>
                              )}
                              {organization.member_count !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {organization.member_count} members
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
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {!disabled && !selectedOrganization && searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-xs text-gray-500">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}

export default OrganizationSelector;