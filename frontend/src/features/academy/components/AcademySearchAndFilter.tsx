/**
 * Academy Search and Filter Component
 * 
 * Academy-specific search and filter component for programs and users
 */

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { SearchParams } from '@/lib/api/types';

interface AcademySearchAndFilterProps {
  onSearch: (params: SearchParams) => void;
  initialParams?: SearchParams;
  type?: 'programs' | 'users';
}

const programStatuses = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const userRoles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'program_admin', label: 'Program Admin' },
  { value: 'program_coordinator', label: 'Program Coordinator' },
  { value: 'tutor', label: 'Tutor' },
];

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'created_desc', label: 'Newest First' },
];

export function AcademySearchAndFilter({
  onSearch,
  initialParams = {},
  type = 'programs',
}: AcademySearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const [selectedStatus, setSelectedStatus] = useState(initialParams.status || '');
  const [selectedRole, setSelectedRole] = useState(initialParams.role || '');
  const [selectedSort, setSelectedSort] = useState(
    initialParams.sort_by && initialParams.sort_order
      ? `${initialParams.sort_by}_${initialParams.sort_order}`
      : ''
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Track active filters count
  const activeFiltersCount = [
    selectedStatus,
    selectedRole,
    selectedSort,
  ].filter(Boolean).length;

  // Handle search submission
  const handleSearch = () => {
    const params: SearchParams = {
      search: searchQuery || undefined,
      status: selectedStatus || undefined,
      role: type === 'users' ? selectedRole || undefined : undefined,
    };

    // Parse sort
    if (selectedSort) {
      const [sortBy, sortOrder] = selectedSort.split('_');
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    onSearch(params);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedRole('');
    setSelectedSort('');
    onSearch({});
  };

  // Auto-search on query change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (initialParams.search || '')) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={`Search ${type}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-auto p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {(type === 'programs' ? programStatuses : []).map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter (Users only) */}
              {type === 'users' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All roles</SelectItem>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <Select value={selectedSort} onValueChange={setSelectedSort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default order</SelectItem>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Apply Button */}
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear All Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}