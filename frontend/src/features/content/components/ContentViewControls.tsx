/**
 * ContentViewControls component for managing view modes, selections, and bulk actions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { 
  Grid3X3,
  List,
  Plus,
  MoreHorizontal,
  Trash2,
  Download,
  Link,
  Archive,
  CheckCircle2,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentItem } from '../api/contentApiService';
import { CurriculumStatus } from '@/lib/api/types';

export type ViewMode = 'cards' | 'table';

export interface BulkAction {
  type: 'delete' | 'status_change' | 'export' | 'assign_to_curriculum' | 'archive';
  payload?: {
    new_status?: CurriculumStatus;
    curriculum_id?: string;
    export_format?: 'json' | 'csv' | 'pdf';
  };
}

interface ContentViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  totalItems: number;
  onBulkAction?: (action: BulkAction, contentIds: string[]) => void;
  onCreateContent?: (contentType: 'lesson' | 'assessment') => void;
  showBulkActions?: boolean;
  className?: string;
}

export function ContentViewControls({
  viewMode,
  onViewModeChange,
  selectedItems,
  onSelectionChange,
  totalItems,
  onBulkAction,
  onCreateContent,
  showBulkActions = true,
  className,
}: ContentViewControlsProps) {
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const hasSelection = selectedItems.length > 0;

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const handleSelectAll = () => {
    // This would typically require access to all content IDs
    // For now, we'll just emit an event that the parent can handle
    onSelectionChange(['all']);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(false);
    onBulkAction?.({ type: 'delete' }, selectedItems);
    onSelectionChange([]);
  };

  const handleBulkStatusChange = (status: CurriculumStatus) => {
    onBulkAction?.({ 
      type: 'status_change', 
      payload: { new_status: status } 
    }, selectedItems);
    onSelectionChange([]);
  };

  const handleBulkExport = (format: 'json' | 'csv' | 'pdf' = 'json') => {
    onBulkAction?.({ 
      type: 'export', 
      payload: { export_format: format } 
    }, selectedItems);
  };

  const handleBulkArchive = () => {
    onBulkAction?.({ type: 'archive' }, selectedItems);
    onSelectionChange([]);
  };

  return (
    <>
      <div className={cn("flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg", className)}>
        {/* Left Section: View Controls */}
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-background rounded-md p-1 border">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Selection Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasSelection ? (
              <>
                <Badge variant="secondary" className="text-xs">
                  {selectedItems.length} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </>
            ) : (
              <span>{totalItems} items</span>
            )}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* Bulk Actions (shown when items are selected) */}
          {hasSelection && showBulkActions && (
            <>
              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkExport('json')}
                  className="h-8"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                {/* More Bulk Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('published')}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Publish Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('draft')}>
                      <Archive className="mr-2 h-4 w-4" />
                      Move to Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Selected
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => handleBulkExport('csv')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkExport('pdf')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => setShowBulkDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Create Actions */}
          {onCreateContent && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-2" />
                    New Content
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateContent('lesson')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Lesson
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateContent('assessment')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Assessment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Selection Actions (when no items selected) */}
          {!hasSelection && totalItems > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs"
            >
              Select All
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Multiple Items
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} content item{selectedItems.length === 1 ? '' : 's'}?
              
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Warning:</strong> This action cannot be undone. Any content that is currently 
                    being used in curricula will be removed from those curricula, which may affect 
                    the structure and completeness of the affected learning paths.
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                Consider exporting these items first if you need to keep a backup.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedItems.length} Item{selectedItems.length === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Additional components for specific bulk action dialogs can be added here
export function BulkAssignToCurriculumDialog() {
  // This would be a more complex dialog for assigning multiple content items to curricula
  // Implementation would depend on curriculum selection requirements
  return null;
}

export function BulkStatusChangeDialog() {
  // This would be a dialog for changing status with additional options
  // Implementation would depend on specific status change requirements
  return null;
}