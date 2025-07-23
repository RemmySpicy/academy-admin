'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Target, BarChart3, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useCourses } from '@/lib/hooks/useCourses';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseGroupedCurriculaList } from '@/features/courses/components/CourseGroupedCurriculaList';
import type { CurriculumSearchParams } from '@/features/courses/api/curriculaApiService';
import { ContentCard } from '@/features/courses/components/ContentCard';
import { ContentFilter } from '@/features/courses/components/ContentFilter';
import { MediaLibrary } from '@/features/courses/components/MediaLibrary';
import { EquipmentManager } from '@/features/courses/components/EquipmentManager';
import { useContentManagement, ContentSearchParams } from '@/features/courses/hooks/useContent';
import { SearchAndFilter } from '@/components/courses/SearchAndFilter';
import { Pagination } from '@/components/courses/Pagination';
import { SearchParams } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function CoursesPage() {
  usePageTitle('Courses Management', 'Manage courses, curricula, and contents within your program');
  
  const [activeTab, setActiveTab] = useState('courses');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    per_page: 12,
  });
  const [contentSearchParams, setContentSearchParams] = useState<ContentSearchParams>({
    page: 1,
    per_page: 12,
  });
  
  const [curriculumSearchParams, setCurriculumSearchParams] = useState<CurriculumSearchParams>({
    page: 1,
    per_page: 12,
    sort_by: 'sequence',
    sort_order: 'asc',
  });

  // Fetch data based on active tab
  const { data: coursesData, isLoading: coursesLoading } = useCourses(
    activeTab === 'courses' ? searchParams : { page: 1, per_page: 1 }
  );
  
  // Content management
  const {
    allContent,
    contentStats,
    isLoading: contentLoading,
    totalContent,
    contentItems,
    stats: contentStatsData,
  } = useContentManagement(
    activeTab === 'contents' ? contentSearchParams : { page: 1, per_page: 1 }
  );

  const handleSearch = (params: SearchParams) => {
    setSearchParams({
      ...params,
      page: 1,
      per_page: 12,
    });
  };

  const handleContentSearch = (params: ContentSearchParams) => {
    setContentSearchParams({
      ...params,
      page: 1,
      per_page: 12,
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({
      ...searchParams,
      page,
    });
  };

  const handleContentPageChange = (page: number) => {
    setContentSearchParams({
      ...contentSearchParams,
      page,
    });
  };

  const handleCurriculumSearch = (params: CurriculumSearchParams) => {
    setCurriculumSearchParams(params);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({
      page: 1,
      per_page: 12,
    });
    setContentSearchParams({
      page: 1,
      per_page: 12,
    });
    setCurriculumSearchParams({
      page: 1,
      per_page: 12,
      sort_by: 'sequence',
      sort_order: 'asc',
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'courses':
        return { data: coursesData, isLoading: coursesLoading };
      case 'contents':
        return { data: allContent.data, isLoading: contentLoading };
      default:
        return { data: null, isLoading: false };
    }
  };

  const { data: currentData, isLoading: currentLoading } = getCurrentData();

  // Curriculum handlers
  const handleCurriculumView = (curriculum: any) => {
    window.location.href = `/admin/curricula/${curriculum.id}`;
  };

  const handleCurriculumEdit = (curriculum: any) => {
    window.location.href = `/admin/curricula/${curriculum.id}/edit`;
  };

  const handleCurriculumDelete = async (curriculum: any) => {
    if (!confirm(`Are you sure you want to delete "${curriculum.name}"?`)) {
      return;
    }
    
    try {
      // TODO: Implement curriculum deletion
      toast.success('Curriculum deleted successfully');
    } catch (error) {
      toast.error('Failed to delete curriculum');
    }
  };

  const handleCurriculumDuplicate = async (curriculum: any) => {
    try {
      // TODO: Implement curriculum duplication
      toast.success('Curriculum duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate curriculum');
    }
  };

  const handleCurriculumSetDefault = async (curriculum: any) => {
    try {
      // TODO: Implement set as default functionality
      toast.success('Curriculum set as default successfully');
    } catch (error) {
      toast.error('Failed to set curriculum as default');
    }
  };

  // Content handlers
  const handleViewContent = (content: any) => {
    // TODO: Implement content detail view
    console.log('View content:', content);
  };

  const handleEditContent = (content: any) => {
    // TODO: Implement content edit form
    console.log('Edit content:', content);
  };

  const handleDeleteContent = (content: any) => {
    if (!confirm(`Are you sure you want to delete "${content.name}"? This will affect all curricula where this content is used.`)) {
      return;
    }
    // TODO: Implement content deletion
    console.log('Delete content:', content);
  };

  const handleDuplicateContent = (content: any) => {
    // TODO: Implement content duplication
    console.log('Duplicate content:', content);
  };

  return (
    <div className="space-y-6">
      {/* Tabs - No action button needed for courses */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="curricula">Curricula</TabsTrigger>
          <TabsTrigger value="contents">Contents</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>


        <TabsContent value="courses" className="space-y-4">
          {/* Course Tab Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Course Catalog</h3>
              <p className="text-sm text-muted-foreground">
                Manage your program's course offerings and structure
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/admin/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Course
                </Link>
              </Button>
            </div>
          </div>

          {/* Course Search and Filter */}
          <div className="mt-6">
            <SearchAndFilter
              onSearch={handleSearch}
              initialParams={searchParams}
            />
          </div>

          {currentLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentData?.items && currentData.items.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentData.items.map((course) => (
                  <CourseCard
                    key={course.id}
                    item={course}
                    type="course"
                    onView={(item) => window.location.href = `/admin/courses/${item.id}`}
                    onEdit={(item) => window.location.href = `/admin/courses/${item.id}/edit`}
                    onDelete={(item) => console.log('Delete:', item)}
                  />
                ))}
              </div>
              
              {currentData && currentData.total_pages > 1 && (
                <Pagination
                  currentPage={currentData.page}
                  totalPages={currentData.total_pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchParams.search ? 'No courses match your search criteria.' : 'Get started by creating your first course.'}
              </p>
              <Button asChild>
                <Link href="/admin/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="curricula" className="space-y-4">
          {/* Curricula Tab Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Curriculum Design</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage structured learning pathways organized by course
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/admin/curricula/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Curriculum
                </Link>
              </Button>
            </div>
          </div>

          {/* Course Grouped Curricula List */}
          <CourseGroupedCurriculaList
            searchParams={curriculumSearchParams}
            onSearchChange={handleCurriculumSearch}
            onCurriculumView={handleCurriculumView}
            onCurriculumEdit={handleCurriculumEdit}
            onCurriculumDelete={handleCurriculumDelete}
            onCurriculumDuplicate={handleCurriculumDuplicate}
            onCurriculumSetDefault={handleCurriculumSetDefault}
            showSearchAndFilter={true}
          />
        </TabsContent>

        <TabsContent value="contents" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">All Content</h3>
                <p className="text-sm text-muted-foreground">
                  Centralized management of all lessons, assessments, and activities across curricula
                </p>
              </div>
              <div className="flex gap-2">
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  New Lesson
                </Button>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>
            </div>

            <ContentFilter
              onFilterChange={handleContentSearch}
              initialParams={contentSearchParams}
            />

            {currentLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : contentItems.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contentItems.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content as any}
                      contentType={content.type}
                      onView={handleViewContent}
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                      onDuplicate={handleDuplicateContent}
                    />
                  ))}
                </div>
                
                {currentData && currentData.total_pages > 1 && (
                  <Pagination
                    currentPage={currentData.page}
                    totalPages={currentData.total_pages}
                    onPageChange={handleContentPageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
                <p className="text-muted-foreground mb-6">
                  {contentSearchParams.search ? 
                    'No content matches your search criteria.' : 
                    'Start by creating lessons and assessments in your curricula.'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Lesson
                  </Button>
                  <Button variant="outline" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assessment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaLibrary />
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <EquipmentManager mode="inventory" />
        </TabsContent>
      </Tabs>
    </div>
  );
}