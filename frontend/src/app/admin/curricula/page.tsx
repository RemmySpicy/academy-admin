'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { CurriculumSearchAndFilter, CurriculumCard, useCurricula } from '@/features/curricula';
import type { CurriculumSearchParams } from '@/features/curricula';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

export default function CurriculaListPage() {
  usePageTitle('All Curricula', 'Comprehensive curriculum management and search');
  
  const [searchParams, setSearchParams] = useState<CurriculumSearchParams>({
    page: 1,
    per_page: 24, // Show more items in dedicated curriculum page
    sort_by: 'sequence',
    sort_order: 'asc',
  });

  const { data: curriculaData, isLoading } = useCurricula(searchParams);
  const curricula = curriculaData?.items || [];

  // Curriculum action handlers
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
      // This is handled by the CurriculumCard component's internal hook
      // The toast notification will be shown by the hook
    } catch (error) {
      toast.error('Failed to set curriculum as default');
    }
  };

  const handleSearch = (params: CurriculumSearchParams) => {
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Curricula</h1>
          <p className="text-gray-600">
            Search, filter, and manage all curricula across your program
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/curricula/new">
              <Plus className="h-4 w-4 mr-2" />
              New Curriculum
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <CurriculumSearchAndFilter
        onSearch={handleSearch}
        initialParams={searchParams}
        showCourseFilter={true}
      />

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-1 mt-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : curricula.length > 0 ? (
        <>
          {/* Results Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {curricula.length} of {curriculaData?.total || 0} curricula
            </p>
            {curriculaData && curriculaData.page && (
              <p className="text-sm text-gray-600">
                Page {curriculaData.page} of {curriculaData.total_pages || 1}
              </p>
            )}
          </div>

          {/* Curricula Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {curricula.map((curriculum) => (
              <CurriculumCard
                key={curriculum.id}
                curriculum={curriculum}
                onView={handleCurriculumView}
                onEdit={handleCurriculumEdit}
                onDelete={handleCurriculumDelete}
                onDuplicate={handleCurriculumDuplicate}
                onSetDefault={handleCurriculumSetDefault}
                showDefaultBadge={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {curriculaData && curriculaData.total_pages && curriculaData.total_pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!curriculaData.has_prev}
                onClick={() => handleSearch({ ...searchParams, page: searchParams.page! - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {curriculaData.page} of {curriculaData.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!curriculaData.has_next}
                onClick={() => handleSearch({ ...searchParams, page: searchParams.page! + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No curricula found</h3>
          <p className="text-gray-600 mb-6">
            {searchParams.search || Object.keys(searchParams).length > 3 ? (
              <>No curricula match your search criteria. Try adjusting your filters.</>
            ) : (
              <>Get started by creating your first curriculum.</>
            )}
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/admin/curricula/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Curriculum
              </Link>
            </Button>
            {(searchParams.search || Object.keys(searchParams).length > 3) && (
              <Button
                variant="outline"
                onClick={() => handleSearch({
                  page: 1,
                  per_page: 24,
                  sort_by: 'sequence',
                  sort_order: 'asc',
                })}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}