/**
 * CurriculumSearchAndFilter component for comprehensive curriculum filtering
 */

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CurriculumSearchParams } from '../api/curriculaApiService';
import { useCourses } from '../hooks/useCourses';

interface CurriculumSearchAndFilterProps {
  onSearch: (params: CurriculumSearchParams) => void;
  initialParams?: CurriculumSearchParams;
  showCourseFilter?: boolean;
  className?: string;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const difficultyOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const sortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'sequence-asc', label: 'Sequence (1-9)' },
  { value: 'sequence-desc', label: 'Sequence (9-1)' },
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'updated_at-desc', label: 'Recently Updated' },
];

// Common age ranges used in curricula
const commonAgeRanges = [
  '3-5 years',
  '6-8 years',
  '9-12 years',
  '13-16 years',
  '17-18 years',
  'Adult (18+)',
  'All Ages',
];

export function CurriculumSearchAndFilter({
  onSearch,
  initialParams = {},
  showCourseFilter = true,
  className,
}: CurriculumSearchAndFilterProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const [status, setStatus] = useState(initialParams.status || 'all');
  const [difficulty, setDifficulty] = useState(initialParams.difficulty_level || 'all');
  const [courseId, setCourseId] = useState(initialParams.course_id || 'all');
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [isDefaultOnly, setIsDefaultOnly] = useState(initialParams.is_default_only || false);
  const [sortOption, setSortOption] = useState(
    `${initialParams.sort_by || 'sequence'}-${initialParams.sort_order || 'asc'}`
  );

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch courses for course filter
  const { data: coursesData } = useCourses({ page: 1, per_page: 100 });
  const courses = coursesData?.items || [];

  // Update active filters when state changes
  useEffect(() => {
    const filters: string[] = [];
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);
    if (status !== 'all') filters.push(`Status: ${status}`);
    if (difficulty !== 'all') filters.push(`Difficulty: ${difficulty}`);
    if (courseId !== 'all') {
      const course = courses.find(c => c.id === courseId);
      if (course) filters.push(`Course: ${course.name}`);
    }
    if (selectedAgeRanges.length > 0) {
      filters.push(`Age Ranges: ${selectedAgeRanges.length}`);
    }
    if (isDefaultOnly) filters.push('Default Only');
    
    setActiveFilters(filters);
  }, [searchQuery, status, difficulty, courseId, selectedAgeRanges, isDefaultOnly, courses]);

  const handleSearch = () => {
    const [sortBy, sortOrder] = sortOption.split('-');
    
    const params: CurriculumSearchParams = {
      page: 1, // Reset to first page on search
      per_page: initialParams.per_page || 12,
    };

    if (searchQuery) params.search = searchQuery;
    if (status !== 'all') params.status = status as any;
    if (difficulty !== 'all') params.difficulty_level = difficulty as any;
    if (courseId !== 'all') params.course_id = courseId;
    if (selectedAgeRanges.length > 0) params.age_range = selectedAgeRanges.join(',');
    if (isDefaultOnly) params.is_default_only = true;
    
    params.sort_by = sortBy;
    params.sort_order = sortOrder as 'asc' | 'desc';

    onSearch(params);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatus('all');
    setDifficulty('all');
    setCourseId('all');
    setSelectedAgeRanges([]);
    setIsDefaultOnly(false);
    setSortOption('sequence-asc');
    
    onSearch({
      page: 1,
      per_page: initialParams.per_page || 12,
      sort_by: 'sequence',
      sort_order: 'asc',
    });
  };

  const handleRemoveFilter = (filterText: string) => {
    if (filterText.startsWith('Search:')) {
      setSearchQuery('');
    } else if (filterText.startsWith('Status:')) {
      setStatus('all');
    } else if (filterText.startsWith('Difficulty:')) {
      setDifficulty('all');
    } else if (filterText.startsWith('Course:')) {
      setCourseId('all');
    } else if (filterText.startsWith('Age Ranges:')) {
      setSelectedAgeRanges([]);
    } else if (filterText === 'Default Only') {
      setIsDefaultOnly(false);
    }
    
    // Apply search after removing filter
    setTimeout(handleSearch, 0);
  };

  const handleAgeRangeToggle = (ageRange: string, checked: boolean) => {
    if (checked) {
      setSelectedAgeRanges(prev => [...prev, ageRange]);
    } else {
      setSelectedAgeRanges(prev => prev.filter(ar => ar !== ageRange));
    }
  };

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar and Quick Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search curricula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-9"
          />
        </div>
        
        <Button onClick={handleSearch} className="shrink-0">
          Search
        </Button>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filter Curricula</h4>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              {showCourseFilter && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Age Ranges Filter */}
              <div className="space-y-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between h-8 p-0">
                      <Label className="text-xs font-medium cursor-pointer">Age Ranges</Label>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {commonAgeRanges.map((ageRange) => (
                      <div key={ageRange} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${ageRange}`}
                          checked={selectedAgeRanges.includes(ageRange)}
                          onCheckedChange={(checked) =>
                            handleAgeRangeToggle(ageRange, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`age-${ageRange}`}
                          className="text-xs cursor-pointer"
                        >
                          {ageRange}
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Default Only Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default-only"
                  checked={isDefaultOnly}
                  onCheckedChange={setIsDefaultOnly}
                />
                <Label htmlFor="default-only" className="text-xs cursor-pointer">
                  Show default curricula only
                </Label>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sort By</Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="w-full h-8">
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-gray-200"
              onClick={() => handleRemoveFilter(filter)}
            >
              {filter}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}