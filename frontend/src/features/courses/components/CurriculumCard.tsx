/**
 * CurriculumCard component for displaying curriculum items
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Users, Clock, Target, BookOpen, Settings } from 'lucide-react';
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
import { Curriculum } from '@/lib/api/types';

interface CurriculumCardProps {
  curriculum: Curriculum;
  onView?: (curriculum: Curriculum) => void;
  onEdit?: (curriculum: Curriculum) => void;
  onDelete?: (curriculum: Curriculum) => void;
  onDuplicate?: (curriculum: Curriculum) => void;
  onManageContent?: (curriculum: Curriculum) => void;
  className?: string;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
};

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-orange-100 text-orange-800',
  EXPERT: 'bg-red-100 text-red-800',
};

export function CurriculumCard({
  curriculum,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onManageContent,
  className,
}: CurriculumCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(curriculum);
  };

  const formatDuration = () => {
    if (curriculum.duration_hours) {
      return `${curriculum.duration_hours} hours`;
    }
    return 'Duration not specified';
  };

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-medium line-clamp-1">
              {curriculum.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {curriculum.code} • {curriculum.course?.name || 'No course'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(curriculum)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(curriculum)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(curriculum)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onManageContent && (
                <DropdownMenuItem onClick={() => onManageContent(curriculum)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Content
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
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status and Difficulty Level */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Seq: {curriculum.sequence}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDuration()}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{curriculum.level_count || 0} levels</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{curriculum.lesson_count || 0} lessons</span>
            </div>
          </div>

          {/* Learning Objectives */}
          {curriculum.objectives && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Learning Objectives</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {curriculum.objectives}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          {curriculum.prerequisites && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Prerequisites</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {curriculum.prerequisites}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView?.(curriculum)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(curriculum)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageContent?.(curriculum)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
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