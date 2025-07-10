/**
 * SearchAndFilter component for curriculum management
 */

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { CurriculumStatus, DifficultyLevel, SearchParams } from '@/lib/api/types';

interface SearchAndFilterProps {
  onSearch: (params: SearchParams) => void;
  initialParams?: SearchParams;
  showProgramFilter?: boolean;
  showCourseFilter?: boolean;
  showCurriculumFilter?: boolean;
}

export function SearchAndFilter({
  onSearch,
  initialParams = {},
  showProgramFilter = false,
  showCourseFilter = false,
  showCurriculumFilter = false,
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const [status, setStatus] = useState<CurriculumStatus | 'all'>(
    initialParams.status || 'all'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>(
    initialParams.difficulty_level || 'all'
  );
  const [sortBy, setSortBy] = useState(initialParams.sort_by || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    initialParams.sort_order || 'asc'
  );

  const handleSearch = () => {
    const params: SearchParams = {
      search: searchQuery || undefined,
      status: status !== 'all' ? status : undefined,
      difficulty_level: difficulty !== 'all' ? difficulty : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    onSearch(params);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatus('all');
    setDifficulty('all');
    setSortBy('name');
    setSortOrder('asc');
    onSearch({});
  };

  const hasActiveFilters = status !== 'all' || difficulty !== 'all' || searchQuery;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search curriculum..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10"
        />
      </div>

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {[status !== 'all', difficulty !== 'all', searchQuery].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="font-medium">Filter Options</div>
            
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as CurriculumStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={CurriculumStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={CurriculumStatus.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={CurriculumStatus.ARCHIVED}>Archived</SelectItem>
                  <SelectItem value={CurriculumStatus.UNDER_REVIEW}>Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
                  <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                  <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
                  <SelectItem value={DifficultyLevel.EXPERT}>Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="updated_at">Updated Date</SelectItem>
                    <SelectItem value="duration_hours">Duration</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSearch} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Search Button */}
      <Button onClick={handleSearch}>
        Search
      </Button>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {status !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatus('all')}>
              Status: {status} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {difficulty !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setDifficulty('all')}>
              Difficulty: {difficulty} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
              Search: {searchQuery} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}