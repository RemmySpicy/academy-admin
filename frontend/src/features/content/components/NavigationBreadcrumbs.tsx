/**
 * Navigation Breadcrumbs - Enhanced breadcrumb navigation with context actions
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Home,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  BookOpen,
  Target,
  FileText,
  Play,
  Video,
  Award,
  Users,
  Settings,
  Copy,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  History,
  Star,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Calendar,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';

interface NavigationBreadcrumbsProps {
  path: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem) => void;
  onAction?: (action: string, item: BreadcrumbItem) => void;
  showActions?: boolean;
  showStats?: boolean;
  className?: string;
}

interface BreadcrumbItem {
  id: string;
  type: 'course' | 'curriculum' | 'level' | 'module' | 'section' | 'lesson' | 'assessment';
  title: string;
  description?: string;
  url?: string;
  metadata?: {
    status?: 'draft' | 'published' | 'archived';
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    duration?: number;
    progress?: number;
    isRequired?: boolean;
    lastModified?: string;
    author?: string;
  };
  actions?: string[];
  children?: BreadcrumbItem[];
}

const itemTypeConfig = {
  course: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Course',
  },
  curriculum: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Curriculum',
  },
  level: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Level',
  },
  module: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Module',
  },
  section: {
    icon: Play,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Section',
  },
  lesson: {
    icon: Video,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Lesson',
  },
  assessment: {
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Assessment',
  },
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export function NavigationBreadcrumbs({
  path,
  onNavigate,
  onAction,
  showActions = true,
  showStats = true,
  className,
}: NavigationBreadcrumbsProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavigate = useCallback((item: BreadcrumbItem) => {
    onNavigate?.(item);
  }, [onNavigate]);

  const handleAction = useCallback((action: string, item: BreadcrumbItem) => {
    onAction?.(action, item);
  }, [onAction]);

  const renderItemActions = (item: BreadcrumbItem) => {
    if (!showActions || !item.actions) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.actions.includes('view') && (
            <DropdownMenuItem onClick={() => handleAction('view', item)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          {item.actions.includes('edit') && (
            <DropdownMenuItem onClick={() => handleAction('edit', item)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {item.actions.includes('copy') && (
            <DropdownMenuItem onClick={() => handleAction('copy', item)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
          )}
          {item.actions.includes('share') && (
            <DropdownMenuItem onClick={() => handleAction('share', item)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {item.actions.includes('delete') && (
            <DropdownMenuItem 
              onClick={() => handleAction('delete', item)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderItemStats = (item: BreadcrumbItem) => {
    if (!showStats || !item.metadata) return null;

    const { status, difficulty, duration, progress, isRequired, lastModified } = item.metadata;

    return (
      <div className="flex items-center gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        {status && (
          <Badge variant="outline" className={`${statusColors[status]} text-xs`}>
            {status}
          </Badge>
        )}
        {difficulty && (
          <Badge variant="outline" className={`${difficultyColors[difficulty]} text-xs`}>
            {difficulty}
          </Badge>
        )}
        {duration && (
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{duration}m</span>
          </div>
        )}
        {progress !== undefined && (
          <div className="flex items-center gap-1 text-gray-500">
            <Activity className="h-3 w-3" />
            <span>{progress}%</span>
          </div>
        )}
        {isRequired && (
          <div className="flex items-center gap-1 text-red-500">
            <Star className="h-3 w-3" />
            <span>Required</span>
          </div>
        )}
      </div>
    );
  };

  const renderChildrenMenu = (item: BreadcrumbItem) => {
    if (!item.children || item.children.length === 0) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Navigate to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.children.map((child) => {
            const config = itemTypeConfig[child.type];
            const Icon = config.icon;
            
            return (
              <DropdownMenuItem
                key={child.id}
                onClick={() => handleNavigate(child)}
                className="flex items-center gap-2 p-2"
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{child.title}</div>
                  {child.description && (
                    <div className="text-xs text-gray-500 truncate">{child.description}</div>
                  )}
                </div>
                {child.metadata?.status && (
                  <Badge variant="outline" className={`${statusColors[child.metadata.status]} text-xs`}>
                    {child.metadata.status}
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const config = itemTypeConfig[item.type];
    const Icon = config.icon;
    const isHovered = hoveredItem === item.id;

    return (
      <div
        key={item.id}
        className="group flex items-center gap-2"
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className="font-medium">{item.title}</span>
              {item.metadata?.isRequired && (
                <Star className="h-3 w-3 text-red-500 fill-red-500" />
              )}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={() => handleNavigate(item)}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
            >
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span>{item.title}</span>
              {item.metadata?.isRequired && (
                <Star className="h-3 w-3 text-red-500 fill-red-500" />
              )}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {/* Context Actions */}
        <div className="flex items-center gap-1">
          {renderChildrenMenu(item)}
          {renderItemActions(item)}
        </div>

        {/* Stats */}
        {renderItemStats(item)}

        {/* Separator */}
        {!isLast && <BreadcrumbSeparator />}
      </div>
    );
  };

  const currentItem = path[path.length - 1];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home */}
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => handleNavigate({ id: 'home', type: 'course', title: 'Home' })}>
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {path.length > 0 && <BreadcrumbSeparator />}

            {/* Path Items */}
            {path.map((item, index) => renderBreadcrumbItem(item, index, index === path.length - 1))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Quick Actions */}
        {showActions && currentItem && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('back', currentItem)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('history', currentItem)}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('share', currentItem)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Current Item Details */}
      {currentItem && currentItem.description && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-700">{currentItem.description}</p>
              {currentItem.metadata?.lastModified && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Last modified: {new Date(currentItem.metadata.lastModified).toLocaleDateString()}</span>
                </div>
              )}
              {currentItem.metadata?.author && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>By: {currentItem.metadata.author}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {currentItem.metadata?.status && (
                <Badge variant="outline" className={statusColors[currentItem.metadata.status]}>
                  {currentItem.metadata.status}
                </Badge>
              )}
              {currentItem.metadata?.difficulty && (
                <Badge variant="outline" className={difficultyColors[currentItem.metadata.difficulty]}>
                  {currentItem.metadata.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {currentItem?.metadata?.progress !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentItem.metadata.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{currentItem.metadata.progress}% complete</span>
        </div>
      )}
    </div>
  );
}