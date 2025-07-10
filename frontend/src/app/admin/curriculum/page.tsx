'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Target, BarChart3, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { usePrograms, useCourses, useCurricula } from '@/lib/hooks/useCurriculum';
import { CurriculumCard } from '@/components/curriculum/CurriculumCard';
import { SearchAndFilter } from '@/components/curriculum/SearchAndFilter';
import { Pagination } from '@/components/curriculum/Pagination';
import { SearchParams } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState('programs');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    per_page: 12,
  });

  // Fetch data based on active tab
  const { data: programsData, isLoading: programsLoading } = usePrograms(
    activeTab === 'programs' ? searchParams : { page: 1, per_page: 1 }
  );
  const { data: coursesData, isLoading: coursesLoading } = useCourses(
    activeTab === 'courses' ? searchParams : { page: 1, per_page: 1 }
  );
  const { data: curriculaData, isLoading: curriculaLoading } = useCurricula(
    activeTab === 'curricula' ? searchParams : { page: 1, per_page: 1 }
  );

  const handleSearch = (params: SearchParams) => {
    setSearchParams({
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({
      page: 1,
      per_page: 12,
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'programs':
        return { data: programsData, isLoading: programsLoading };
      case 'courses':
        return { data: coursesData, isLoading: coursesLoading };
      case 'curricula':
        return { data: curriculaData, isLoading: curriculaLoading };
      default:
        return { data: null, isLoading: false };
    }
  };

  const { data: currentData, isLoading: currentLoading } = getCurrentData();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum Management</h1>
          <p className="text-muted-foreground">
            Manage your academy's educational content and structure
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/curriculum/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programsData?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Educational programs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coursesData?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Course offerings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curricula</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {curriculaData?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Curriculum items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Average completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="curricula">Curricula</TabsTrigger>
        </TabsList>

        {/* Search and Filter */}
        <div className="mt-4">
          <SearchAndFilter
            onSearch={handleSearch}
            initialParams={searchParams}
          />
        </div>

        <TabsContent value="programs" className="space-y-4">
          {currentLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentData?.items?.map((program) => (
                  <CurriculumCard
                    key={program.id}
                    item={program}
                    type="program"
                    onView={(item) => window.location.href = `/admin/curriculum/programs/${item.id}`}
                    onEdit={(item) => window.location.href = `/admin/curriculum/programs/${item.id}/edit`}
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
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
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
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentData?.items?.map((course) => (
                  <CurriculumCard
                    key={course.id}
                    item={course}
                    type="course"
                    onView={(item) => window.location.href = `/admin/curriculum/courses/${item.id}`}
                    onEdit={(item) => window.location.href = `/admin/curriculum/courses/${item.id}/edit`}
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
          )}
        </TabsContent>

        <TabsContent value="curricula" className="space-y-4">
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
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentData?.items?.map((curriculum) => (
                  <CurriculumCard
                    key={curriculum.id}
                    item={curriculum}
                    type="curriculum"
                    onView={(item) => window.location.href = `/admin/curriculum/curricula/${item.id}`}
                    onEdit={(item) => window.location.href = `/admin/curriculum/curricula/${item.id}/edit`}
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}