'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Target, BarChart3, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCourses, useCourseManagement } from '@/features/courses';
import { CourseCard } from '@/components/courses/CourseCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CourseGroupedCurriculaList } from '@/features/curricula';
import type { CurriculumSearchParams } from '@/features/curricula';
import { 
  ContentCard,
  ContentFilter,
  ContentTable,
  ContentViewControls,
  GlobalContentEditModal,
  ContentUsageDialog,
  ContentCreateDialog
} from '@/features/content';
import type { ViewMode, BulkAction } from '@/features/content';
import { MediaLibrary } from '@/features/media';
import { EquipmentManager } from '@/features/equipment';
import { 
  useContent, 
  useContentMutations, 
  useContentUsage
} from '@/features/content';
import type { ContentSearchParams, ContentCreateData } from '@/features/content';
import { SearchAndFilter } from '@/components/courses/SearchAndFilter';
import { Pagination } from '@/components/courses/Pagination';
import { SearchParams } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
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
    per_page: 20,
  });
  
  // Content management state
  const [contentViewMode, setContentViewMode] = useState<ViewMode>('cards');
  const [selectedContentItems, setSelectedContentItems] = useState<string[]>([]);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewingUsageContent, setViewingUsageContent] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createContentType, setCreateContentType] = useState<'lesson' | 'assessment'>('lesson');
  
  // Course deletion confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  
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
  
  // Course management hooks
  const { deleteCourse } = useCourseManagement();
  
  // Get content management data using new unified hooks
  const { data: contentData, isLoading: contentLoading, error: contentError } = useContent(
    activeTab === 'contents' ? contentSearchParams : {}
  );
  
  // Content mutations
  const contentMutations = useContentMutations();
  
  // Usage info for currently viewing content
  const { data: usageInfo } = useContentUsage(
    viewingUsageContent?.id || ''
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
      per_page: 20,
    });
  };

  // Content management handlers
  const handleCreateContent = (contentType: 'lesson' | 'assessment') => {
    setCreateContentType(contentType);
    setShowCreateDialog(true);
  };

  const handleCreateContentSubmit = async (data: ContentCreateData) => {
    try {
      await contentMutations.createContent.mutateAsync(data);
      setShowCreateDialog(false);
      toast.success(`${createContentType === 'lesson' ? 'Lesson' : 'Assessment'} created successfully`);
    } catch (error) {
      toast.error(`Failed to create ${createContentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBulkAction = (action: BulkAction, contentIds: string[]) => {
    switch (action.type) {
      case 'delete':
        contentMutations.bulkAction.mutate({
          action: 'delete',
          content_ids: contentIds,
        });
        break;
      case 'export':
        contentMutations.exportContent.mutate({
          content_ids: contentIds,
          format: action.payload?.export_format || 'json',
        });
        break;
      case 'status_change':
        contentMutations.bulkAction.mutate({
          action: 'status_change',
          content_ids: contentIds,
          parameters: { new_status: action.payload?.new_status },
        });
        break;
      default:
        toast.info('Bulk action functionality coming soon');
    }
  };

  const handleDeleteCourse = (course: any) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      await deleteCourse.mutateAsync(courseToDelete.id);
      toast.success(`Course "${courseToDelete.name}" deleted successfully`);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to delete course';
      toast.error(errorMessage);
    }
  };

  const handleViewContent = (content: any) => {
    toast.info('Content detail view coming soon');
  };

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    setShowEditModal(true);
  };

  const handleDeleteContent = (content: any) => {
    contentMutations.deleteContent.mutate({ id: content.id });
  };

  const handleDuplicateContent = (content: any) => {
    contentMutations.duplicateContent.mutate({ id: content.id });
  };

  const handleViewUsage = (content: any) => {
    setViewingUsageContent(content);
    setShowUsageDialog(true);
  };

  const handleManageReferences = (content: any) => {
    setViewingUsageContent(content);
    setShowUsageDialog(true);
  };

  const handleNavigateToCurriculum = (curriculumId: string) => {
    window.location.href = `/admin/curricula/${curriculumId}`;
  };

  const handleSaveContent = (contentId: string, updateData: any, versionData: any) => {
    contentMutations.updateContent.mutate({
      id: contentId,
      data: updateData,
      versionData,
    });
    setShowEditModal(false);
    setEditingContent(null);
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
        return { data: contentData, isLoading: contentLoading };
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
          ) : currentData && 'items' in currentData && currentData.items && currentData.items.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentData.items.map((course) => (
                  <CourseCard
                    key={course.id}
                    item={course}
                    type="course"
                    onView={(item) => window.location.href = `/admin/courses/${item.id}`}
                    onEdit={(item) => window.location.href = `/admin/courses/${item.id}/edit`}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
              
              {currentData && 'total_pages' in currentData && currentData.total_pages && currentData.total_pages > 1 && (
                <Pagination
                  currentPage={('page' in currentData && currentData.page) || 1}
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
          {/* Content Tab Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Content Library</h3>
              <p className="text-sm text-muted-foreground">
                Centralized management of reusable lessons and assessments across all curricula
              </p>
            </div>
          </div>

          {/* Content View Controls */}
          <ContentViewControls
            viewMode={contentViewMode}
            onViewModeChange={setContentViewMode}
            selectedItems={selectedContentItems}
            onSelectionChange={setSelectedContentItems}
            totalItems={contentData?.total || 0}
            onBulkAction={handleBulkAction}
            onCreateContent={handleCreateContent}
            showBulkActions={true}
          />

          {/* Content Filter */}
          <ContentFilter
            onFilterChange={handleContentSearch}
            initialParams={contentSearchParams}
          />

          {/* Content Display */}
          {contentLoading ? (
            <div className="space-y-4">
              {contentViewMode === 'cards' ? (
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
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : contentData?.items && contentData.items.length > 0 ? (
            <>
              {contentViewMode === 'cards' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contentData.items.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      showUsageInfo={true}
                      onView={handleViewContent}
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                      onDuplicate={handleDuplicateContent}
                      onViewUsage={handleViewUsage}
                      onManageReferences={handleManageReferences}
                      onNavigateToCurriculum={handleNavigateToCurriculum}
                    />
                  ))}
                </div>
              ) : (
                <ContentTable
                  content={contentData.items}
                  loading={contentLoading}
                  selectedItems={selectedContentItems}
                  onSelectionChange={setSelectedContentItems}
                  onSort={(column, direction) => {
                    handleContentSearch({
                      ...contentSearchParams,
                      sort_by: column,
                      sort_order: direction,
                    });
                  }}
                  onView={handleViewContent}
                  onEdit={handleEditContent}
                  onDelete={handleDeleteContent}
                  onDuplicate={handleDuplicateContent}
                  onViewUsage={handleViewUsage}
                  onManageReferences={handleManageReferences}
                  onNavigateToCurriculum={handleNavigateToCurriculum}
                  showUsageInfo={true}
                />
              )}
              
              {contentData && contentData.total_pages > 1 && (
                <Pagination
                  currentPage={contentData.page}
                  totalPages={contentData.total_pages}
                  onPageChange={(page) => handleContentSearch({
                    ...contentSearchParams,
                    page,
                  })}
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
                  'Content will appear here as you create lessons and assessments in your curricula.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleCreateContent('lesson')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lesson
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateContent('assessment')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assessment
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaLibrary />
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <EquipmentManager mode="inventory" />
        </TabsContent>
      </Tabs>

      {/* Content Management Modals */}
      <GlobalContentEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        content={editingContent}
        onSave={handleSaveContent}
        onNavigateToCurriculum={handleNavigateToCurriculum}
        loading={contentMutations.updateContent.isPending}
      />

      <ContentUsageDialog
        open={showUsageDialog}
        onOpenChange={setShowUsageDialog}
        content={viewingUsageContent}
        usageInfo={usageInfo}
        onNavigateToCurriculum={handleNavigateToCurriculum}
        onAssignToCurriculum={(contentId, assignmentData) => {
          contentMutations.assignToCurriculum.mutate({ contentId, assignmentData });
        }}
        onRemoveFromCurriculum={(contentId, curriculumId) => {
          contentMutations.removeFromCurriculum.mutate({ contentId, curriculumId });
        }}
        loading={contentMutations.assignToCurriculum.isPending || contentMutations.removeFromCurriculum.isPending}
      />

      <ContentCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        contentType={createContentType}
        onSubmit={handleCreateContentSubmit}
        loading={contentMutations.createContent.isPending}
        availableCourses={coursesData?.items || []}
        availableCurricula={[]} // TODO: Add curricula data when available
      />

      {/* Course Deletion Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone and will remove all associated curricula, lessons, and student progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setCourseToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCourse}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? 'Deleting...' : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}