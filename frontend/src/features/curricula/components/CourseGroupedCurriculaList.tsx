/**
 * Course Grouped Curricula List - Shows curricula organized by course sections
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronDown,
  ChevronRight,
  Plus,
  BookOpen,
  Target,
  ArrowUpDown,
  Users,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { CurriculumCard } from './CurriculumCard';
import { CurriculumSearchAndFilter } from './CurriculumSearchAndFilter';
import { useCourses } from '../hooks/useCourses';
import { useCurricula } from '../hooks/useCurricula';
import { Curriculum, CurriculumSearchParams } from '../api/curriculaApiService';

interface CourseSection {
  course_id: string;
  course_name: string;
  course_status: string;
  curricula: Curriculum[];
  curricula_count: number;
  is_expanded: boolean;
}

interface CourseGroupedCurriculaListProps {
  searchParams: CurriculumSearchParams;
  onSearchChange?: (params: CurriculumSearchParams) => void;
  onCurriculumView?: (curriculum: Curriculum) => void;
  onCurriculumEdit?: (curriculum: Curriculum) => void;
  onCurriculumDelete?: (curriculum: Curriculum) => void;
  onCurriculumDuplicate?: (curriculum: Curriculum) => void;
  onCurriculumSetDefault?: (curriculum: Curriculum) => void;
  showSearchAndFilter?: boolean;
  className?: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-purple-100 text-purple-800',
};

const sortOptions = [
  { value: 'name-asc', label: 'Course Name (A-Z)' },
  { value: 'name-desc', label: 'Course Name (Z-A)' },
];

export function CourseGroupedCurriculaList({
  searchParams,
  onSearchChange,
  onCurriculumView,
  onCurriculumEdit,
  onCurriculumDelete,
  onCurriculumDuplicate,
  onCurriculumSetDefault,
  showSearchAndFilter = true,
  className,
}: CourseGroupedCurriculaListProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('name-asc');

  // Fetch courses and curricula
  const { data: coursesData, isLoading: coursesLoading } = useCourses({ page: 1, per_page: 100 });
  const { data: curriculaData, isLoading: curriculaLoading } = useCurricula(searchParams);

  const courses = coursesData?.items || [];
  const curricula = curriculaData?.items || [];
  const isLoading = coursesLoading || curriculaLoading;

  // Group curricula by course
  const coursesections = useMemo<CourseSection[]>(() => {
    // Create a map of course_id to curricula
    const curriculaByCourse = curricula.reduce((acc, curriculum) => {
      const courseId = curriculum.course_id;
      if (!acc[courseId]) {
        acc[courseId] = [];
      }
      acc[courseId].push(curriculum);
      return acc;
    }, {} as Record<string, Curriculum[]>);

    // Create course sections for all courses (even those without curricula)
    const sections = courses.map((course): CourseSection => ({
      course_id: course.id,
      course_name: course.name,
      course_status: course.status,
      curricula: curriculaByCourse[course.id] || [],
      curricula_count: (curriculaByCourse[course.id] || []).length,
      is_expanded: true, // All expanded by default
    }));

    // Sort sections based on sortBy
    return sections.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.course_name.localeCompare(b.course_name);
        case 'name-desc':
          return b.course_name.localeCompare(a.course_name);
        default:
          return 0;
      }
    });
  }, [courses, curricula, sortBy]);

  // Initialize expanded state for all courses when courses load
  useEffect(() => {
    if (coursesections.length > 0) {
      const allCourseIds = new Set(coursesections.map(section => section.course_id));
      setExpandedCourses(allCourseIds);
    }
  }, [coursesections]);

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allCourseIds = new Set(coursesections.map(section => section.course_id));
    setExpandedCourses(allCourseIds);
  };

  const collapseAll = () => {
    setExpandedCourses(new Set());
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter */}
      {showSearchAndFilter && onSearchChange && (
        <CurriculumSearchAndFilter
          onSearch={onSearchChange}
          initialParams={searchParams}
          showCourseFilter={true}
        />
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
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
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Course Sections */}
      <div className="space-y-4">
        {coursesections.length > 0 ? (
          coursesections.map((section) => (
            <Collapsible
              key={section.course_id}
              open={expandedCourses.has(section.course_id)}
              onOpenChange={() => toggleCourseExpansion(section.course_id)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCourses.has(section.course_id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{section.course_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={statusColors[section.course_status]}>
                              {section.course_status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {section.curricula_count} {section.curricula_count === 1 ? 'curriculum' : 'curricula'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/admin/curricula/new?course_id=${section.course_id}`;
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Curriculum
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.curricula.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {section.curricula.map((curriculum) => (
                          <CurriculumCard
                            key={curriculum.id}
                            curriculum={curriculum}
                            onView={onCurriculumView}
                            onEdit={onCurriculumEdit}
                            onDelete={onCurriculumDelete}
                            onDuplicate={onCurriculumDuplicate}
                            onManageContent={() => {
                              // Navigate to curriculum builder
                              window.location.href = `/admin/curricula/${curriculum.id}/builder`;
                            }}
                            showDefaultBadge={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No curricula yet</h3>
                        <p className="text-gray-600 mb-4">
                          Get started by creating your first curriculum for {section.course_name}
                        </p>
                        <Button asChild>
                          <Link href={`/admin/curricula/new?course_id=${section.course_id}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Curriculum
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              Create courses first to start building curricula
            </p>
            <Button asChild>
              <Link href="/admin/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Course
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}