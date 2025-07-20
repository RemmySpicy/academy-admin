'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  Edit,
  Tag,
  Hash,
  FileText,
  Activity
} from 'lucide-react';
import { useAcademyProgram } from '../hooks';
import type { Program } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface ProgramDetailsDialogProps {
  programId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (program: Program) => void;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export function ProgramDetailsDialog({ 
  programId, 
  open, 
  onOpenChange, 
  onEdit 
}: ProgramDetailsDialogProps) {
  const { data: program, isLoading } = useAcademyProgram(programId || '');

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Program Details</DialogTitle>
          <DialogDescription>
            View comprehensive information about this program
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading program details...</span>
            </div>
          ) : program ? (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{program.name}</h2>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs font-medium", getStatusColor(program.status))}
                    >
                      {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{program.program_code || 'No code'}</span>
                    {program.category && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Tag className="h-4 w-4" />
                        <span>{program.category}</span>
                      </>
                    )}
                  </div>
                </div>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(program)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Program
                  </Button>
                )}
              </div>

              {/* Description */}
              {program.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {program.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{program.course_count || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Available courses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{program.student_count || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Enrolled students
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {program.completion_rate ? `${Math.round(program.completion_rate)}%` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Student success rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Program Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Program Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Program Code</h4>
                        <p className="font-mono">{program.program_code || 'Not set'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                        <p>{program.category || 'Not categorized'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Display Order</h4>
                        <p>{program.display_order || 0}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs font-medium", getStatusColor(program.status))}
                        >
                          {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Unknown'}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Total Curricula</h4>
                        <p>{program.total_curriculum_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                        <p className="text-sm">{formatDate(program.created_at)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                        <p className="text-sm">{program.created_by || 'System'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                        <p className="text-sm">{formatDate(program.updated_at)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Updated By</h4>
                        <p className="text-sm">{program.updated_by || 'System'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Program not found or failed to load.</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}