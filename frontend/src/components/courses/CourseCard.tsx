/**
 * CourseCard component for displaying course and curriculum items
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Program, Course, Curriculum, DifficultyLevel, CurriculumStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  item: Program | Course | Curriculum;
  type: 'program' | 'course' | 'curriculum';
  onEdit?: (item: Program | Course | Curriculum) => void;
  onDelete?: (item: Program | Course | Curriculum) => void;
  onView?: (item: Program | Course | Curriculum) => void;
}

const statusColors = {
  [CurriculumStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [CurriculumStatus.PUBLISHED]: 'bg-green-100 text-green-800',
  [CurriculumStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800',
  [CurriculumStatus.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
};

const difficultyColors = {
  [DifficultyLevel.BEGINNER]: 'bg-green-100 text-green-800',
  [DifficultyLevel.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800',
  [DifficultyLevel.ADVANCED]: 'bg-orange-100 text-orange-800',
  [DifficultyLevel.EXPERT]: 'bg-red-100 text-red-800',
};

export function CourseCard({
  item,
  type,
  onEdit,
  onDelete,
  onView,
}: CourseCardProps) {
  const formatDuration = (duration: number | undefined) => {
    if (!duration) return 'N/A';
    if (type === 'program') {
      return `${duration} weeks`;
    }
    return `${duration} hours`;
  };

  const getItemCounts = () => {
    switch (type) {
      case 'program':
        const program = item as Program;
        return {
          primary: program.course_count || 0,
          primaryLabel: 'Courses',
          secondary: program.student_count || 0,
          secondaryLabel: 'Students',
        };
      case 'course':
        const course = item as Course;
        return {
          primary: course.curriculum_count || 0,
          primaryLabel: 'Curricula',
          secondary: course.lesson_count || 0,
          secondaryLabel: 'Lessons',
        };
      case 'curriculum':
        const curriculum = item as Curriculum;
        return {
          primary: curriculum.level_count || 0,
          primaryLabel: 'Levels',
          secondary: curriculum.lesson_count || 0,
          secondaryLabel: 'Lessons',
        };
      default:
        return {
          primary: 0,
          primaryLabel: 'Items',
          secondary: 0,
          secondaryLabel: 'Items',
        };
    }
  };

  const counts = getItemCounts();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {item.code || 'No code'}
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
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusColors[item.status])}
            >
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
            </Badge>
            {'difficulty_level' in item && item.difficulty_level && (
              <Badge
                variant="outline"
                className={cn("text-xs", difficultyColors[item.difficulty_level])}
              >
                {item.difficulty_level.charAt(0).toUpperCase() + item.difficulty_level.slice(1)}
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground">
            {formatDuration(item.duration_hours || (item as Program).duration_weeks)}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-medium">{counts.primary}</div>
              <div className="text-muted-foreground text-xs">{counts.primaryLabel}</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{counts.secondary}</div>
              <div className="text-muted-foreground text-xs">{counts.secondaryLabel}</div>
            </div>
          </div>
          
          {type === 'program' && (item as Program).completion_rate && (
            <div className="text-center">
              <div className="font-medium">
                {Math.round((item as Program).completion_rate || 0)}%
              </div>
              <div className="text-muted-foreground text-xs">Completion</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(item)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(item)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}