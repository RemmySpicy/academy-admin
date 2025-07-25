/**
 * ContentTable component for table view of content items with advanced features
 */

import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  GitBranch,
  Link,
  ExternalLink,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContentItem, 
  ContentUsageInfo,
  CurriculumReference 
} from '../api/contentApiService';
import { CurriculumStatus, DifficultyLevel } from '@/lib/api/types';

interface ContentTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
}

interface ContentTableProps {
  content: ContentItem[];
  columns?: ContentTableColumn[];
  loading?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (column: string, value: string) => void;
  onView?: (content: ContentItem) => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  onDuplicate?: (content: ContentItem) => void;
  onViewUsage?: (content: ContentItem) => void;
  onManageReferences?: (content: ContentItem) => void;
  onNavigateToCurriculum?: (curriculumId: string) => void;
  showUsageInfo?: boolean;
  className?: string;
}

const DEFAULT_COLUMNS: ContentTableColumn[] = [
  { key: 'selection', label: '', width: '40px' },
  { key: 'name', label: 'Name', sortable: true, width: '250px' },
  { key: 'type', label: 'Type', filterable: true, width: '100px' },
  { key: 'status', label: 'Status', filterable: true, sortable: true, width: '120px' },
  { key: 'usage_count', label: 'Used In', sortable: true, width: '100px' },
  { key: 'difficulty_level', label: 'Difficulty', filterable: true, width: '120px' },
  { key: 'duration', label: 'Duration', sortable: true, width: '100px' },
  { key: 'updated_at', label: 'Modified', sortable: true, width: '140px' },
  { key: 'actions', label: 'Actions', width: '100px' },
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export function ContentTable({
  content,
  columns = DEFAULT_COLUMNS,
  loading = false,
  selectedItems = [],
  onSelectionChange,
  onSort,
  onFilter,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onViewUsage,
  onManageReferences,
  onNavigateToCurriculum,
  showUsageInfo = false,
  className,
}: ContentTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === columnKey && sortDirection === 'asc') {
      newDirection = 'desc';
    }

    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort?.(columnKey, newDirection);
  };

  // Handle column filtering
  const handleFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    onFilter?.(columnKey, value);
  };

  // Handle row selection
  const handleRowSelect = (contentId: string, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = checked
      ? [...selectedItems, contentId]
      : selectedItems.filter(id => id !== contentId);
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = checked ? content.map(item => item.id) : [];
    onSelectionChange(newSelection);
  };

  // Utility functions
  const inferContentType = (item: ContentItem): 'lesson' | 'assessment' => {
    if ('usage_info' in item) {
      return (item as any).content_type === 'lesson' ? 'lesson' : 'assessment';
    }
    return 'assessment_type' in item ? 'assessment' : 'lesson';
  };

  const getUsageInfo = (item: ContentItem): ContentUsageInfo | undefined => {
    return (item as any).usage_info;
  };

  const isLocked = (item: ContentItem): boolean => {
    return (item as any).is_locked || false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const renderCellContent = (item: ContentItem, column: ContentTableColumn) => {
    const usageInfo = getUsageInfo(item);
    const contentType = inferContentType(item);

    switch (column.key) {
      case 'selection':
        return (
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => handleRowSelect(item.id, checked as boolean)}
          />
        );

      case 'name':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.name}</span>
              {isLocked(item) && (
                <Lock className="h-3 w-3 text-red-500" />
              )}
              {(item as any).has_newer_version && (
                <Badge variant="outline" className="text-xs px-1 py-0 text-orange-600 border-orange-600">
                  Update
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {item.code}
              {(item as any).version_number && (
                <span className="ml-2">v{(item as any).version_number}</span>
              )}
            </div>
          </div>
        );

      case 'type':
        return (
          <Badge variant="outline" className="text-xs">
            {contentType}
          </Badge>
        );

      case 'status':
        return (
          <Badge 
            variant="outline" 
            className={cn("text-xs", statusColors[item.status as keyof typeof statusColors])}
          >
            {item.status}
          </Badge>
        );

      case 'usage_count':
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {usageInfo?.usage_count || 0}
            </span>
            {usageInfo?.is_orphaned && (
              <AlertTriangle className="h-3 w-3 text-orange-500" />
            )}
          </div>
        );

      case 'difficulty_level':
        return item.difficulty_level ? (
          <Badge 
            variant="outline" 
            className={cn("text-xs", difficultyColors[item.difficulty_level as keyof typeof difficultyColors])}
          >
            {item.difficulty_level}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );

      case 'duration':
        return (
          <span className="text-sm">
            {item.duration_minutes ? `${item.duration_minutes}m` : '-'}
          </span>
        );

      case 'updated_at':
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.updated_at)}
          </span>
        );

      case 'actions':
        return (
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
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem 
                  onClick={() => onEdit(item)}
                  disabled={isLocked(item)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isLocked(item) ? 'Locked' : 'Edit'}
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(item)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              
              {showUsageInfo && onViewUsage && (
                <DropdownMenuItem onClick={() => onViewUsage(item)}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  View Usage
                </DropdownMenuItem>
              )}
              {showUsageInfo && onManageReferences && (
                <DropdownMenuItem onClick={() => onManageReferences(item)}>
                  <Link className="mr-2 h-4 w-4" />
                  Manage References
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );

      default:
        return null;
    }
  };

  const renderFilterInput = (column: ContentTableColumn) => {
    if (!column.filterable) return null;

    return (
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={`Filter ${column.label.toLowerCase()}...`}
          value={columnFilters[column.key] || ''}
          onChange={(e) => handleFilter(column.key, e.target.value)}
          className="h-8 pl-7 text-xs"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Content Table</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {selectedItems.length > 0 && (
              <span>{selectedItems.length} selected</span>
            )}
            <span>{content.length} items</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(column.className)}
                  >
                    {column.key === 'selection' ? (
                      <Checkbox
                        checked={selectedItems.length === content.length && content.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{column.label}</span>
                          {column.sortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleSort(column.key)}
                            >
                              {getSortIcon(column.key)}
                            </Button>
                          )}
                        </div>
                        {renderFilterInput(column)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No content items found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                content.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      selectedItems.includes(item.id) && "bg-muted/30"
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${item.id}-${column.key}`}
                        className={cn("py-3", column.className)}
                      >
                        {renderCellContent(item, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}