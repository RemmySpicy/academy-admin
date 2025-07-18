/**
 * Course Catalog Component - Browse and manage courses
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  RefreshCw,
  Download,
  Settings,
  Users,
  BookOpen,
  Star,
  Award,
  TrendingUp,
  Calendar,
  Target,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { CourseCard } from './CourseCard';
import { useCourseManagement } from '../hooks/useCourses';
import type { Course, CourseSearchParams } from '../api/courseApiService';

interface CourseCatalogProps {
  onCreateCourse?: () => void;
  onEditCourse?: (course: Course) => void;
  onViewCourse?: (course: Course) => void;
  onDuplicateCourse?: (course: Course) => void;
  onDeleteCourse?: (course: Course) => void;
  onAssignInstructor?: (course: Course) => void;
  className?: string;
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Archived', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'duration_weeks', label: 'Duration' },
  { value: 'difficulty_level', label: 'Difficulty' },
  { value: 'total_students', label: 'Students' },
  { value: 'completion_rate', label: 'Completion Rate' },
];

export function CourseCatalog({
  onCreateCourse,
  onEditCourse,
  onViewCourse,
  onDuplicateCourse,
  onDeleteCourse,
  onAssignInstructor,
  className,
}: CourseCatalogProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    page: 1,
    per_page: 20,
    search: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

  const {
    courses,
    stats,
    pagination,
    isLoading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    bulkUpdateCourses,
    refetch,
  } = useCourseManagement(searchParams);

  const handleSearch = useCallback((query: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: query,
      page: 1,
    }));
  }, []);

  const handleFilterChange = useCallback((filters: Partial<CourseSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchParams(prev => ({
      ...prev,
      sort_by: sortBy,
      sort_order: sortOrder,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
    }));
  }, []);

  const handleDuplicateCourse = async (course: Course) => {
    try {
      await duplicateCourse.mutateAsync({
        id: course.id,
        options: {
          new_name: `${course.name} (Copy)`,
          include_curricula: true,
        },
      });
      onDuplicateCourse?.(course);
    } catch (error) {
      console.error('Failed to duplicate course:', error);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    try {
      await deleteCourse.mutateAsync(course.id);
      onDeleteCourse?.(course);
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      page: 1,
      per_page: 20,
      search: '',
      sort_by: 'name',
      sort_order: 'asc',
    });
  };

  const activeFiltersCount = Object.keys(searchParams).filter(key => 
    key !== 'page' && key !== 'limit' && key !== 'sort_by' && key !== 'sort_order' && 
    searchParams[key as keyof CourseSearchParams]
  ).length;

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load courses</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_courses || 0}</p>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.published_courses || 0}</p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_students_enrolled || 0}</p>
                <p className="text-sm text-gray-600">Students Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.average_completion_rate?.toFixed(1) || 0}%</p>
                <p className="text-sm text-gray-600">Avg Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Course Catalog</CardTitle>
            <div className="flex items-center gap-2">
              {onCreateCourse && (
                <Button onClick={onCreateCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchParams.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Difficulty Level</DropdownMenuLabel>
                  {difficultyOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={searchParams.difficulty_level === option.value}
                      onCheckedChange={(checked) =>
                        handleFilterChange({
                          difficulty_level: checked ? option.value as Course['difficulty_level'] : undefined,
                        })
                      }
                    >
                      <Badge variant="outline" className={`${option.color} text-xs mr-2`}>
                        {option.label}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {statusOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={searchParams.status === option.value}
                      onCheckedChange={(checked) =>
                        handleFilterChange({
                          status: checked ? option.value as Course['status'] : undefined,
                        })
                      }
                    >
                      <Badge variant="outline" className={`${option.color} text-xs mr-2`}>
                        {option.label}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={searchParams.is_featured === true}
                    onCheckedChange={(checked) =>
                      handleFilterChange({
                        is_featured: checked ? true : undefined,
                      })
                    }
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Featured Only
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={searchParams.is_certification_course === true}
                    onCheckedChange={(checked) =>
                      handleFilterChange({
                        is_certification_course: checked ? true : undefined,
                      })
                    }
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Certification Courses
                  </DropdownMenuCheckboxItem>

                  {activeFiltersCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters}>
                        Clear All Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {searchParams.sort_order === 'asc' ? (
                      <SortAsc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortDesc className="h-4 w-4 mr-2" />
                    )}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value, 'asc')}
                    >
                      {option.label} (A-Z)
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={`${option.value}-desc`}
                      onClick={() => handleSortChange(option.value, 'desc')}
                    >
                      {option.label} (Z-A)
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Catalog
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Catalog Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchParams.difficulty_level && (
                <Badge variant="secondary" className="gap-1">
                  Difficulty: {searchParams.difficulty_level}
                  <button onClick={() => handleFilterChange({ difficulty_level: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchParams.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {searchParams.status}
                  <button onClick={() => handleFilterChange({ status: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchParams.is_featured && (
                <Badge variant="secondary" className="gap-1">
                  Featured
                  <button onClick={() => handleFilterChange({ is_featured: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchParams.is_certification_course && (
                <Badge variant="secondary" className="gap-1">
                  Certification
                  <button onClick={() => handleFilterChange({ is_certification_course: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Grid/List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">
                  {searchParams.search || activeFiltersCount > 0
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first course'}
                </p>
                {onCreateCourse && (
                  <Button onClick={onCreateCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={onViewCourse}
                  onEdit={onEditCourse}
                  onDelete={handleDeleteCourse}
                  onDuplicate={handleDuplicateCourse}
                  onAssignInstructor={onAssignInstructor}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * (pagination.limit || 20) + 1} to{' '}
                  {Math.min(pagination.page * (pagination.limit || 20), pagination.total)} of{' '}
                  {pagination.total} courses
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.has_prev}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.total_pages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}