/**
 * ContentFilter component for filtering content items
 */

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ContentSearchParams } from '../hooks/useContent';

interface ContentFilterProps {
  onFilterChange: (params: ContentSearchParams) => void;
  initialParams?: ContentSearchParams;
}

export function ContentFilter({ onFilterChange, initialParams = {} }: ContentFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialParams.search || '');
  const [contentType, setContentType] = useState(initialParams.content_type || 'all');
  const [status, setStatus] = useState(initialParams.status || '');
  const [difficultyLevel, setDifficultyLevel] = useState(initialParams.difficulty_level || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params: ContentSearchParams = {
      search: searchTerm || undefined,
      content_type: contentType === 'all' ? undefined : contentType as 'lesson' | 'assessment',
      status: status || undefined,
      difficulty_level: difficultyLevel || undefined,
      page: 1,
      per_page: 20,
    };

    onFilterChange(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setContentType('all');
    setStatus('');
    setDifficultyLevel('');
    
    onFilterChange({
      page: 1,
      per_page: 20,
    });
  };

  const hasActiveFilters = () => {
    return searchTerm || contentType !== 'all' || status || difficultyLevel;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (contentType !== 'all') count++;
    if (status) count++;
    if (difficultyLevel) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="lesson">Lessons</SelectItem>
                      <SelectItem value="assessment">Assessments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={applyFilters} size="sm" className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={() => setShowFilters(false)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </form>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Search: {searchTerm}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() => {
                  setSearchTerm('');
                  applyFilters();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {contentType !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Type: {contentType}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() => {
                  setContentType('all');
                  applyFilters();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {status && (
            <Badge variant="secondary" className="text-xs">
              Status: {status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() => {
                  setStatus('');
                  applyFilters();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {difficultyLevel && (
            <Badge variant="secondary" className="text-xs">
              Difficulty: {difficultyLevel}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() => {
                  setDifficultyLevel('');
                  applyFilters();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}