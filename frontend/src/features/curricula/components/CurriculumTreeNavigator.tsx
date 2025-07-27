/**
 * Curriculum Tree Navigator - Interactive tree navigation for curriculum structure
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  FileText,
  Play,
  Video,
  Award,
  Clock,
  Users,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  ChevronsUp,
  TreePine,
  Map,
  Layout,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedSearch } from '@/features/content';
import type { CourseTree, Curriculum, Level, Module, Section, Lesson } from '../api/courseApiService';

interface CurriculumTreeNavigatorProps {
  courseTree: CourseTree;
  onSelectItem?: (item: any, type: string) => void;
  onEditItem?: (item: any, type: string) => void;
  onDeleteItem?: (item: any, type: string) => void;
  onAddItem?: (parentItem: any, parentType: string, childType: string) => void;
  selectedItemId?: string;
  className?: string;
}

interface TreeNode {
  id: string;
  type: 'curriculum' | 'level' | 'module' | 'section' | 'lesson';
  data: any;
  children: TreeNode[];
  path: string[];
  depth: number;
}

const nodeTypeConfig = {
  curriculum: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Curriculum',
    plural: 'Curricula',
    childType: 'level' as const,
  },
  level: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Level',
    plural: 'Levels',
    childType: 'module' as const,
  },
  module: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Module',
    plural: 'Modules',
    childType: 'section' as const,
  },
  section: {
    icon: Play,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Section',
    plural: 'Sections',
    childType: 'lesson' as const,
  },
  lesson: {
    icon: Video,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Lesson',
    plural: 'Lessons',
    childType: null,
  },
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
};

const statusIcons = {
  draft: AlertCircle,
  published: CheckCircle,
  archived: XCircle,
  under_review: Clock,
};

export function CurriculumTreeNavigator({
  courseTree,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  selectedItemId,
  className,
}: CurriculumTreeNavigatorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Convert CourseTree to TreeNode structure
  const treeData = useMemo((): TreeNode[] => {
    if (!courseTree?.curricula) return [];

    return courseTree.curricula.map(({ curriculum, levels }) => ({
      id: curriculum.id,
      type: 'curriculum' as const,
      data: curriculum,
      path: [curriculum.name],
      depth: 0,
      children: levels.map(({ level, modules }) => ({
        id: level.id,
        type: 'level' as const,
        data: level,
        path: [curriculum.name, level.name],
        depth: 1,
        children: modules.map(({ module, sections }) => ({
          id: module.id,
          type: 'module' as const,
          data: module,
          path: [curriculum.name, level.name, module.name],
          depth: 2,
          children: sections.map(({ section, lessons }) => ({
            id: section.id,
            type: 'section' as const,
            data: section,
            path: [curriculum.name, level.name, module.name, section.name],
            depth: 3,
            children: lessons.map((lesson) => ({
              id: lesson.id,
              type: 'lesson' as const,
              data: lesson,
              path: [curriculum.name, level.name, module.name, section.name, lesson.name],
              depth: 4,
              children: [],
            })),
          })),
        })),
      })),
    }));
  }, [courseTree]);

  // Flatten tree for search and filtering
  const flattenTree = useCallback((nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        traverse(node.children);
      });
    };
    traverse(nodes);
    return result;
  }, []);

  const flatData = useMemo(() => flattenTree(treeData), [treeData, flattenTree]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = flatData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(node =>
        node.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(node => node.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(node => node.data.status === filterStatus);
    }

    return filtered;
  }, [flatData, searchQuery, filterType, filterStatus]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(flatData.map(node => node.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleAction = (action: string, node: TreeNode) => {
    switch (action) {
      case 'select':
        onSelectItem?.(node.data, node.type);
        break;
      case 'edit':
        onEditItem?.(node.data, node.type);
        break;
      case 'delete':
        onDeleteItem?.(node.data, node.type);
        break;
      case 'add-child':
        const childType = nodeTypeConfig[node.type].childType;
        if (childType) {
          onAddItem?.(node.data, node.type, childType);
        }
        break;
    }
  };

  const renderTreeNode = (node: TreeNode) => {
    const config = nodeTypeConfig[node.type];
    const Icon = config.icon;
    const StatusIcon = statusIcons[node.data.status as keyof typeof statusIcons] || AlertCircle;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedItemId === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="w-full">
        <div
          className={`
            flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer
            ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'}
          `}
          style={{ paddingLeft: `${node.depth * 20 + 8}px` }}
          onClick={() => handleAction('select', node)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          <Icon className={`h-4 w-4 ${config.color} flex-shrink-0`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{node.data.name}</h4>
              {node.data.status && (
                <Badge variant="outline" className={`${statusColors[node.data.status as keyof typeof statusColors]} text-xs`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {node.data.status}
                </Badge>
              )}
            </div>
            {node.data.description && (
              <p className="text-xs text-gray-600 truncate mt-1">{node.data.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {hasChildren && (
              <Badge variant="secondary" className="text-xs">
                {node.children.length}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAction('select', node)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('edit', node)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {config.childType && (
                  <DropdownMenuItem onClick={() => handleAction('add-child', node)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {nodeTypeConfig[config.childType].label}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleAction('delete', node)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const renderFlatNode = (node: TreeNode) => {
    const config = nodeTypeConfig[node.type];
    const Icon = config.icon;
    const StatusIcon = statusIcons[node.data.status as keyof typeof statusIcons] || AlertCircle;
    const isSelected = selectedItemId === node.id;

    return (
      <div
        key={node.id}
        className={`
          flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
          ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}
        `}
        onClick={() => handleAction('select', node)}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{node.data.name}</h4>
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
            {node.data.status && (
              <Badge variant="outline" className={`${statusColors[node.data.status as keyof typeof statusColors]} text-xs`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {node.data.status}
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-600">
            {node.path.join(' > ')}
          </div>
          {node.data.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{node.data.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAction('select', node)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('edit', node)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleAction('delete', node)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5" />
              Curriculum Navigator
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={showAdvancedSearch ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'tree' ? expandAll : undefined}
                disabled={viewMode === 'flat'}
              >
                <ChevronsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'tree' ? collapseAll : undefined}
                disabled={viewMode === 'flat'}
              >
                <ChevronsUp className="h-4 w-4" />
              </Button>
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'tree' | 'flat')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-4 w-4" />
                      Tree
                    </div>
                  </SelectItem>
                  <SelectItem value="flat">
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      Flat
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {showAdvancedSearch && (
            <div className="mb-4">
              <AdvancedSearch
                onSearchResults={(results) => {
                  // Handle search results
                  console.log('Search results:', results);
                }}
                onFiltersChange={(filters) => {
                  // Handle filter changes
                  console.log('Filters changed:', filters);
                }}
                placeholder="Search curriculum content..."
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search curriculum content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="curriculum">Curricula</SelectItem>
                <SelectItem value="level">Levels</SelectItem>
                <SelectItem value="module">Modules</SelectItem>
                <SelectItem value="section">Sections</SelectItem>
                <SelectItem value="lesson">Lessons</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="p-4">
          <div className={`${viewMode === 'tree' ? 'space-y-1' : 'space-y-3'} min-h-[400px]`}>
            {viewMode === 'tree' ? (
              // Tree view
              <>
                {searchQuery || filterType !== 'all' || filterStatus !== 'all' ? (
                  // Filtered results
                  filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No items match your search criteria</p>
                    </div>
                  ) : (
                    filteredData.map(node => renderFlatNode(node))
                  )
                ) : (
                  // Full tree
                  treeData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <TreePine className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No curriculum structure available</p>
                    </div>
                  ) : (
                    treeData.map(node => renderTreeNode(node))
                  )
                )}
              </>
            ) : (
              // Flat view
              filteredData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Layout className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No curriculum content available</p>
                </div>
              ) : (
                filteredData.map(node => renderFlatNode(node))
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      {filteredData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm">
              {Object.entries(nodeTypeConfig).map(([type, config]) => {
                const count = filteredData.filter(node => node.type === type).length;
                const Icon = config.icon;
                return (
                  <div key={type} className="flex flex-col items-center gap-1">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-600">{config.plural}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}