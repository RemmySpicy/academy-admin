/**
 * Academy Program Card Component
 * 
 * Academy-specific program card for displaying programs in the Academy Admin interface
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, Users, BookOpen, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Program } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface AcademyProgramCardProps {
  program: Program;
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
  onView?: (program: Program) => void;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
};

export function AcademyProgramCard({
  program,
  onEdit,
  onDelete,
  onView,
}: AcademyProgramCardProps) {
  const formatDuration = (weeks: number | undefined) => {
    if (!weeks) return 'N/A';
    return `${weeks} weeks`;
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-lg font-semibold">{program.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {program.code || 'No code assigned'}
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
              <DropdownMenuItem onClick={() => onView(program)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(program)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Program
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(program)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Program
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status and Duration */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={cn("text-xs font-medium", getStatusColor(program.status))}
          >
            {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Unknown'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDuration(program.duration_weeks)}
          </span>
        </div>

        {/* Description */}
        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-lg font-semibold">{program.course_count || 0}</div>
            <div className="text-xs text-muted-foreground">Courses</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-lg font-semibold">{program.student_count || 0}</div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-lg font-semibold">
              {program.completion_rate ? `${Math.round(program.completion_rate)}%` : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(program)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(program)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}