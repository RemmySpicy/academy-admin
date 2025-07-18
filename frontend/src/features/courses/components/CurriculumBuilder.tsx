/**
 * Curriculum Builder - Enhanced curriculum creation with tree navigation
 */

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  BookOpen,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  Copy,
  Settings,
  Target,
  FileText,
  Play,
  Video,
  Award,
  Clock,
  Users,
  ArrowUp,
  ArrowDown,
  Layers,
  TreePine
} from 'lucide-react';
import { toast } from 'sonner';
import type { 
  Course, 
  Curriculum, 
  Level, 
  Module, 
  Section, 
  Lesson,
  CurriculumStatus,
  DifficultyLevel 
} from '../api/courseApiService';

interface CurriculumNode {
  id: string;
  type: 'curriculum' | 'level' | 'module' | 'section' | 'lesson';
  data: any;
  children: CurriculumNode[];
  isExpanded?: boolean;
  parentId?: string;
}

interface CurriculumBuilderProps {
  course: Course;
  curriculum?: Curriculum;
  onSave: (curriculum: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

const nodeTypeConfig = {
  curriculum: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Curriculum',
    description: 'Top-level curriculum container',
  },
  level: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Level',
    description: 'Learning progression level',
  },
  module: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Module',
    description: 'Thematic learning module',
  },
  section: {
    icon: Play,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Section',
    description: 'Learning section',
  },
  lesson: {
    icon: Video,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Lesson',
    description: 'Individual lesson content',
  },
};

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'under_review', label: 'Under Review' },
];

export function CurriculumBuilder({
  course,
  curriculum,
  onSave,
  onCancel,
  className,
}: CurriculumBuilderProps) {
  const [activeTab, setActiveTab] = useState('builder');
  const [treeData, setTreeData] = useState<CurriculumNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<CurriculumNode | null>(null);
  const [formData, setFormData] = useState({
    name: curriculum?.name || '',
    code: curriculum?.code || '',
    description: curriculum?.description || '',
    skill_level: curriculum?.skill_level || 'beginner',
    status: curriculum?.status || 'draft',
    duration_weeks: curriculum?.duration_weeks || 1,
    age_min: curriculum?.age_min || undefined,
    age_max: curriculum?.age_max || undefined,
    objectives: curriculum?.objectives || [],
  });

  // Initialize tree data from existing curriculum
  const initializeTreeData = useCallback(() => {
    if (curriculum) {
      // Convert curriculum data to tree structure
      const rootNode: CurriculumNode = {
        id: curriculum.id,
        type: 'curriculum',
        data: curriculum,
        children: [],
        isExpanded: true,
      };
      setTreeData([rootNode]);
      setExpandedNodes(new Set([curriculum.id]));
    }
  }, [curriculum]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Handle reordering logic here
    // Update treeData with new order
    toast.success('Item reordered successfully');
  };

  const addNewNode = (parentNode: CurriculumNode | null, nodeType: CurriculumNode['type']) => {
    const newNode: CurriculumNode = {
      id: `temp-${Date.now()}`,
      type: nodeType,
      data: {
        name: `New ${nodeTypeConfig[nodeType].label}`,
        description: '',
        sequence: 0,
        status: 'draft',
      },
      children: [],
      parentId: parentNode?.id,
    };

    if (parentNode) {
      // Add to parent's children
      const updateTree = (nodes: CurriculumNode[]): CurriculumNode[] => {
        return nodes.map(node => {
          if (node.id === parentNode.id) {
            return { ...node, children: [...node.children, newNode] };
          }
          return { ...node, children: updateTree(node.children) };
        });
      };
      setTreeData(updateTree(treeData));
      setExpandedNodes(prev => new Set([...prev, parentNode.id]));
    } else {
      // Add as root node
      setTreeData([...treeData, newNode]);
    }

    setEditingNode(newNode);
    setSelectedNode(newNode);
  };

  const updateNode = (nodeId: string, updates: any) => {
    const updateTree = (nodes: CurriculumNode[]): CurriculumNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...updates } };
        }
        return { ...node, children: updateTree(node.children) };
      });
    };
    setTreeData(updateTree(treeData));
  };

  const deleteNode = (nodeId: string) => {
    const removeFromTree = (nodes: CurriculumNode[]): CurriculumNode[] => {
      return nodes.filter(node => node.id !== nodeId).map(node => ({
        ...node,
        children: removeFromTree(node.children),
      }));
    };
    setTreeData(removeFromTree(treeData));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const duplicateNode = (node: CurriculumNode) => {
    const duplicatedNode: CurriculumNode = {
      ...node,
      id: `temp-${Date.now()}`,
      data: {
        ...node.data,
        name: `${node.data.name} (Copy)`,
      },
    };

    // Add to same level as original
    if (node.parentId) {
      const updateTree = (nodes: CurriculumNode[]): CurriculumNode[] => {
        return nodes.map(parentNode => {
          if (parentNode.id === node.parentId) {
            return { ...parentNode, children: [...parentNode.children, duplicatedNode] };
          }
          return { ...parentNode, children: updateTree(parentNode.children) };
        });
      };
      setTreeData(updateTree(treeData));
    } else {
      setTreeData([...treeData, duplicatedNode]);
    }
  };

  const renderTreeNode = (node: CurriculumNode, level: number = 0) => {
    const config = nodeTypeConfig[node.type];
    const Icon = config.icon;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="w-full">
        <Draggable draggableId={node.id} index={0}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`
                flex items-center gap-2 p-3 rounded-lg border transition-all
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
                ${snapshot.isDragging ? 'shadow-lg' : ''}
                ${config.borderColor}
              `}
              style={{ marginLeft: `${level * 24}px` }}
              onClick={() => setSelectedNode(node)}
            >
              <div {...provided.dragHandleProps} className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical className="h-4 w-4" />
              </div>

              {hasChildren && (
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
              )}

              <Icon className={`h-4 w-4 ${config.color}`} />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{node.data.name}</h4>
                {node.data.description && (
                  <p className="text-xs text-gray-600 truncate">{node.data.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {node.data.status && (
                  <Badge variant="outline" className="text-xs">
                    {node.data.status}
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNode(node);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateNode(node);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {config.label}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{node.data.name}"? This will also delete all nested content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteNode(node.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </Draggable>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            <Droppable droppableId={`${node.id}-children`}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {node.children.map((child) => renderTreeNode(child, level + 1))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </div>
    );
  };

  const handleSave = async () => {
    try {
      const curriculumData = {
        ...formData,
        course_id: course.id,
        // Convert tree structure back to API format
        // This would include levels, modules, sections, lessons
      };
      
      await onSave(curriculumData);
      toast.success('Curriculum saved successfully');
    } catch (error) {
      toast.error('Failed to save curriculum');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {curriculum ? 'Edit Curriculum' : 'Create Curriculum'}
          </h2>
          <p className="text-gray-600">Course: {course.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Curriculum
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter curriculum name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter curriculum code"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this curriculum"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Skill Level</label>
                  <Select
                    value={formData.skill_level}
                    onValueChange={(value) => setFormData({ ...formData, skill_level: value as DifficultyLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CurriculumStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration (weeks)</label>
                  <Input
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Age</label>
                  <Input
                    type="number"
                    value={formData.age_min || ''}
                    onChange={(e) => setFormData({ ...formData, age_min: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Age</label>
                  <Input
                    type="number"
                    value={formData.age_max || ''}
                    onChange={(e) => setFormData({ ...formData, age_max: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tree Builder */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TreePine className="h-5 w-5" />
                      Curriculum Structure
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNewNode(null, 'level')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Level
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="curriculum-tree">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-2 min-h-[400px]"
                        >
                          {treeData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="mb-4">Start building your curriculum structure</p>
                              <Button onClick={() => addNewNode(null, 'level')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Level
                              </Button>
                            </div>
                          ) : (
                            treeData.map((node) => renderTreeNode(node))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNode ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = nodeTypeConfig[selectedNode.type].icon;
                          return <Icon className={`h-4 w-4 ${nodeTypeConfig[selectedNode.type].color}`} />;
                        })()}
                        <span className="font-medium">{nodeTypeConfig[selectedNode.type].label}</span>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={selectedNode.data.name}
                          onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={selectedNode.data.description || ''}
                          onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      {/* Add child buttons */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Add Child</label>
                        <div className="flex flex-col gap-2">
                          {selectedNode.type === 'level' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewNode(selectedNode, 'module')}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Module
                            </Button>
                          )}
                          {selectedNode.type === 'module' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewNode(selectedNode, 'section')}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Section
                            </Button>
                          )}
                          {selectedNode.type === 'section' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewNode(selectedNode, 'lesson')}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Lesson
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select a node to edit its properties</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Curriculum Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">{formData.name}</h3>
                  <p className="text-gray-600">{formData.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Level: {formData.skill_level}</span>
                    <span>Duration: {formData.duration_weeks} weeks</span>
                    <span>Status: {formData.status}</span>
                  </div>
                </div>

                {/* Tree preview */}
                <div className="border rounded-lg p-4">
                  {treeData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No structure defined yet</p>
                  ) : (
                    <div className="space-y-2">
                      {treeData.map((node) => renderTreeNode(node))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}