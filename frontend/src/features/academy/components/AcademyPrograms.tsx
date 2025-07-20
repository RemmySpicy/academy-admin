'use client';

import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAcademyPrograms, useCreateAcademyProgram, useDeleteAcademyProgram, useAcademyProgramStats } from '../hooks';
import { AcademyProgramCard } from './AcademyProgramCard';
import { AcademySearchAndFilter } from './AcademySearchAndFilter';
import { AcademyPagination } from './AcademyPagination';
import { CreateProgramDialog } from './CreateProgramDialog';
import { EditProgramDialog } from './EditProgramDialog';
import { ProgramDetailsDialog } from './ProgramDetailsDialog';
import { SearchParams } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { Program } from '@/lib/api/types';

/**
 * Academy Programs Management Component
 * 
 * Super admin-only component for managing all programs across the academy
 */
export function AcademyPrograms() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    per_page: 12,
  });

  // Dialog states
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const { data: programsData, isLoading: programsLoading, refetch: refetchPrograms } = useAcademyPrograms(searchParams);
  const { data: programStats, isLoading: statsLoading, refetch: refetchStats } = useAcademyProgramStats();
  const createProgram = useCreateAcademyProgram();
  const deleteProgram = useDeleteAcademyProgram();

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

  const handleProgramCreated = () => {
    refetchPrograms();
    refetchStats();
  };

  const handleViewProgram = (program: Program) => {
    setSelectedProgramId(program.id);
    setDetailsDialogOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setSelectedProgram(program);
    setEditDialogOpen(true);
  };

  const handleProgramUpdated = () => {
    refetchPrograms();
    refetchStats();
  };

  const handleDeleteProgram = async (program: Program) => {
    if (window.confirm(`Are you sure you want to delete "${program.name}"? This action cannot be undone.`)) {
      try {
        await deleteProgram.mutateAsync(program.id);
        refetchPrograms();
        refetchStats();
      } catch (error) {
        console.error('Failed to delete program:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Programs Management</h2>
          <p className="text-gray-600">
            Manage all academy programs, create new programs, and configure program settings
          </p>
        </div>
        <CreateProgramDialog onProgramCreated={handleProgramCreated} />
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
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                programStats?.total_programs || programsData?.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Academy-wide programs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                programStats?.active_programs || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                programStats?.total_students || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                programStats?.total_courses || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <AcademySearchAndFilter
        onSearch={handleSearch}
        initialParams={searchParams}
        type="programs"
      />

      {/* Programs Grid */}
      {programsLoading ? (
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
          {programsData?.items?.length ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {programsData.items.map((program) => (
                  <AcademyProgramCard
                    key={program.id}
                    program={program}
                    onView={handleViewProgram}
                    onEdit={handleEditProgram}
                    onDelete={handleDeleteProgram}
                  />
                ))}
              </div>
              
              {programsData.total_pages > 1 && (
                <AcademyPagination
                  currentPage={programsData.page}
                  totalPages={programsData.total_pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first program.</p>
              <CreateProgramDialog onProgramCreated={handleProgramCreated} />
            </div>
          )}
        </>
      )}

      {/* Dialog Components */}
      <EditProgramDialog
        program={selectedProgram}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProgramUpdated={handleProgramUpdated}
      />

      <ProgramDetailsDialog
        programId={selectedProgramId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onEdit={handleEditProgram}
      />
    </div>
  );
}