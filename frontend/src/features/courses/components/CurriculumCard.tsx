/**
 * CurriculumCard component for displaying curriculum items
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Users, Clock, Target, BookOpen, Settings, Award } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import { Curriculum } from '../api/curriculaApiService';
import { useSetDefaultCurriculum, useRemoveDefaultCurriculum } from '../hooks/useCurricula';

interface CurriculumCardProps {
  curriculum: Curriculum;
  onView?: (curriculum: Curriculum) => void;
  onEdit?: (curriculum: Curriculum) => void;
  onDelete?: (curriculum: Curriculum) => void;
  onDuplicate?: (curriculum: Curriculum) => void;
  onManageContent?: (curriculum: Curriculum) => void;
  onSetDefault?: (curriculum: Curriculum) => void;
  showDefaultBadge?: boolean;
  className?: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-purple-100 text-purple-800',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export function CurriculumCard({
  curriculum,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onManageContent,
  onSetDefault,
  showDefaultBadge = false,
  className,
}: CurriculumCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const setDefaultCurriculum = useSetDefaultCurriculum();
  const removeDefaultCurriculum = useRemoveDefaultCurriculum();

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(curriculum);
  };

  const handleSetDefault = () => {
    if (curriculum.age_ranges && curriculum.age_ranges.length > 0) {
      setDefaultCurriculum.mutate({
        curriculumId: curriculum.id,
        ageGroups: curriculum.age_ranges
      });
    }
    onSetDefault?.(curriculum);
  };

  const formatDuration = () => {
    if (curriculum.duration_hours) {
      return `${curriculum.duration_hours} hours`;
    }
    return 'Duration not specified';
  };

  const handleViewDetails = () => {
    window.location.href = `/admin/curricula/${curriculum.id}`;
  };

  const handleEdit = () => {
    window.location.href = `/admin/curricula/${curriculum.id}/edit`;
  };

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium line-clamp-1">
                  {curriculum.name}
                </CardTitle>
                {showDefaultBadge && curriculum.is_default && (
                  <Badge variant="default" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                {curriculum.course_name || 'No course'}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = `/admin/curricula/${curriculum.id}/builder`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Curriculum Builder
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(curriculum)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onSetDefault && (
                  <DropdownMenuItem onClick={handleSetDefault} disabled={setDefaultCurriculum.isPending}>
                    <Award className="mr-2 h-4 w-4" />
                    {setDefaultCurriculum.isPending ? 'Setting...' : 'Set as Default'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Primary Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewDetails} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit} className="flex-1">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* Status and Difficulty Level */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-xs", statusColors[curriculum.status])}
            >
              {curriculum.status}
            </Badge>
            {curriculum.difficulty_level && (
              <Badge
                variant="outline"
                className={cn("text-xs", difficultyColors[curriculum.difficulty_level])}
              >
                {curriculum.difficulty_level}
              </Badge>
            )}
          </div>

          {/* Description */}
          {curriculum.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {curriculum.description}
            </p>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{curriculum.level_count || 0} levels</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{curriculum.total_lesson_count || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDuration()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Sequence {curriculum.sequence || '-'}</span>
            </div>
          </div>

          {/* Age Ranges */}
          {curriculum.age_ranges && curriculum.age_ranges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {curriculum.age_ranges.map((ageRange) => (
                <Badge 
                  key={ageRange} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {ageRange}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the curriculum "{curriculum.name}" and all its content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}