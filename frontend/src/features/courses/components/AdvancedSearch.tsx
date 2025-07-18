/**
 * Advanced Search - Comprehensive search and filter interface for curriculum content
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  Clock,
  Target,
  BookOpen,
  FileText,
  Video,
  Play,
  Award,
  Users,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MapPin,
  Hash,
  Type,
  Code,
  Image,
  Layers,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface AdvancedSearchProps {
  onSearchResults: (results: SearchResult[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  id: string;
  type: 'curriculum' | 'level' | 'module' | 'section' | 'lesson' | 'assessment';
  title: string;
  description?: string;
  path: string[];
  metadata: {
    [key: string]: any;
  };
  relevance: number;
  lastModified: string;
}

interface SearchFilters {
  query: string;
  types: string[];
  status: string[];
  difficulty: string[];
  duration: {
    min: number;
    max: number;
  };
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  tags: string[];
  author: string[];
  hasResources: boolean;
  hasAssessments: boolean;
  isRequired: boolean;
  sortBy: 'relevance' | 'title' | 'date' | 'duration' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

const contentTypes = [
  { value: 'curriculum', label: 'Curricula', icon: BookOpen, color: 'text-blue-600' },
  { value: 'level', label: 'Levels', icon: Target, color: 'text-green-600' },
  { value: 'module', label: 'Modules', icon: FileText, color: 'text-purple-600' },
  { value: 'section', label: 'Sections', icon: Play, color: 'text-orange-600' },
  { value: 'lesson', label: 'Lessons', icon: Video, color: 'text-red-600' },
  { value: 'assessment', label: 'Assessments', icon: Award, color: 'text-yellow-600' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' },
  { value: 'published', label: 'Published', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'under_review', label: 'Under Review', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'archived', label: 'Archived', icon: XCircle, color: 'bg-yellow-100 text-yellow-800' },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance', icon: Zap },
  { value: 'title', label: 'Title', icon: Type },
  { value: 'date', label: 'Date Modified', icon: Calendar },
  { value: 'duration', label: 'Duration', icon: Clock },
  { value: 'difficulty', label: 'Difficulty', icon: TrendingUp },
];

export function AdvancedSearch({
  onSearchResults,
  onFiltersChange,
  placeholder = "Search curriculum content...",
  className,
}: AdvancedSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    status: [],
    difficulty: [],
    duration: { min: 0, max: 240 },
    dateRange: { start: null, end: null },
    tags: [],
    author: [],
    hasResources: false,
    hasAssessments: false,
    isRequired: false,
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleSearch = useCallback((query: string) => {
    updateFilters({ query });
    
    // Add to search history
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
    }

    // Mock search results - in real implementation, this would call an API
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'lesson',
        title: 'Introduction to Programming',
        description: 'Basic programming concepts and fundamentals',
        path: ['Computer Science', 'Programming Fundamentals', 'Introduction'],
        metadata: {
          duration: 45,
          difficulty: 'beginner',
          status: 'published',
          tags: ['programming', 'basics', 'introduction'],
          hasResources: true,
          hasAssessments: true,
        },
        relevance: 0.95,
        lastModified: '2024-01-15T10:30:00Z',
      },
      // Add more mock results as needed
    ];

    onSearchResults(mockResults);
  }, [updateFilters, searchHistory, onSearchResults]);

  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      types: [],
      status: [],
      difficulty: [],
      duration: { min: 0, max: 240 },
      dateRange: { start: null, end: null },
      tags: [],
      author: [],
      hasResources: false,
      hasAssessments: false,
      isRequired: false,
      sortBy: 'relevance',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.duration.min > 0 || filters.duration.max < 240) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.tags.length > 0) count++;
    if (filters.author.length > 0) count++;
    if (filters.hasResources) count++;
    if (filters.hasAssessments) count++;
    if (filters.isRequired) count++;
    return count;
  }, [filters]);

  const renderQuickFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFilters({ types: ['lesson'] })}
        className={filters.types.includes('lesson') ? 'bg-blue-50 border-blue-200' : ''}
      >
        <Video className="h-4 w-4 mr-2" />
        Lessons
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFilters({ types: ['assessment'] })}
        className={filters.types.includes('assessment') ? 'bg-blue-50 border-blue-200' : ''}
      >
        <Award className="h-4 w-4 mr-2" />
        Assessments
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFilters({ status: ['published'] })}
        className={filters.status.includes('published') ? 'bg-green-50 border-green-200' : ''}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Published
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFilters({ difficulty: ['beginner'] })}
        className={filters.difficulty.includes('beginner') ? 'bg-green-50 border-green-200' : ''}
      >
        <Target className="h-4 w-4 mr-2" />
        Beginner
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFilters({ hasResources: !filters.hasResources })}
        className={filters.hasResources ? 'bg-blue-50 border-blue-200' : ''}
      >
        <FileText className="h-4 w-4 mr-2" />
        Has Resources
      </Button>
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="space-y-6">
      {/* Content Types */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Content Types</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.types.includes(type.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({ types: [...filters.types, type.value] });
                    } else {
                      updateFilters({ types: filters.types.filter(t => t !== type.value) });
                    }
                  }}
                />
                <Label htmlFor={`type-${type.value}`} className="flex items-center gap-2 cursor-pointer">
                  <Icon className={`h-4 w-4 ${type.color}`} />
                  {type.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Status</Label>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((status) => {
            const Icon = status.icon;
            return (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({ status: [...filters.status, status.value] });
                    } else {
                      updateFilters({ status: filters.status.filter(s => s !== status.value) });
                    }
                  }}
                />
                <Label htmlFor={`status-${status.value}`} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-4 w-4" />
                  {status.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
        <div className="grid grid-cols-2 gap-2">
          {difficultyOptions.map((difficulty) => (
            <div key={difficulty.value} className="flex items-center space-x-2">
              <Checkbox
                id={`difficulty-${difficulty.value}`}
                checked={filters.difficulty.includes(difficulty.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilters({ difficulty: [...filters.difficulty, difficulty.value] });
                  } else {
                    updateFilters({ difficulty: filters.difficulty.filter(d => d !== difficulty.value) });
                  }
                }}
              />
              <Label htmlFor={`difficulty-${difficulty.value}`} className="cursor-pointer">
                <Badge variant="outline" className={difficulty.color}>
                  {difficulty.label}
                </Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Duration: {filters.duration.min} - {filters.duration.max} minutes
        </Label>
        <Slider
          value={[filters.duration.min, filters.duration.max]}
          onValueChange={([min, max]) => updateFilters({ duration: { min, max } })}
          min={0}
          max={240}
          step={15}
          className="w-full"
        />
      </div>

      {/* Additional Options */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Additional Options</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasResources"
              checked={filters.hasResources}
              onCheckedChange={(checked) => updateFilters({ hasResources: checked as boolean })}
            />
            <Label htmlFor="hasResources" className="cursor-pointer">Has Resources</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAssessments"
              checked={filters.hasAssessments}
              onCheckedChange={(checked) => updateFilters({ hasAssessments: checked as boolean })}
            />
            <Label htmlFor="hasAssessments" className="cursor-pointer">Has Assessments</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRequired"
              checked={filters.isRequired}
              onCheckedChange={(checked) => updateFilters({ isRequired: checked as boolean })}
            />
            <Label htmlFor="isRequired" className="cursor-pointer">Required Content</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={filters.query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4" align="end">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Advanced Filters</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdvancedOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {renderAdvancedFilters()}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Quick Filters */}
      {renderQuickFilters()}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Recent:</span>
          {searchHistory.map((query, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleSearch(query)}
              className="h-6 px-2 text-xs"
            >
              {query}
            </Button>
          ))}
        </div>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.types.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {contentTypes.find(t => t.value === type)?.label}
              <button
                onClick={() => updateFilters({ types: filters.types.filter(t => t !== type) })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {statusOptions.find(s => s.value === status)?.label}
              <button
                onClick={() => updateFilters({ status: filters.status.filter(s => s !== status) })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.difficulty.map((difficulty) => (
            <Badge key={difficulty} variant="secondary" className="gap-1">
              {difficultyOptions.find(d => d.value === difficulty)?.label}
              <button
                onClick={() => updateFilters({ difficulty: filters.difficulty.filter(d => d !== difficulty) })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}