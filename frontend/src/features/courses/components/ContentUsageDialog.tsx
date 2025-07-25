/**
 * ContentUsageDialog component for viewing and managing content usage across curricula
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ExternalLink,
  GitBranch,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContentItem, 
  ContentUsageInfo,
  CurriculumReference,
  CurriculumAssignmentData
} from '../api/contentApiService';

interface ContentUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ContentItem | null;
  usageInfo: ContentUsageInfo | null;
  onNavigateToCurriculum?: (curriculumId: string) => void;
  onAssignToCurriculum?: (contentId: string, assignmentData: CurriculumAssignmentData) => void;
  onRemoveFromCurriculum?: (contentId: string, curriculumId: string) => void;
  availableCurricula?: Array<{ id: string; name: string; course_name: string; }>;
  loading?: boolean;
}

interface AssignmentFormData {
  curriculum_id: string;
  section_id?: string;
  sequence?: number;
  custom_title?: string;
  custom_instructions?: string;
  is_required?: boolean;
}

export function ContentUsageDialog({
  open,
  onOpenChange,
  content,
  usageInfo,
  onNavigateToCurriculum,
  onAssignToCurriculum,
  onRemoveFromCurriculum,
  availableCurricula = [],
  loading = false,
}: ContentUsageDialogProps) {
  const [activeTab, setActiveTab] = useState('usage');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormData>({
    curriculum_id: '',
    is_required: true,
  });
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  // Filter curricula based on search
  const filteredCurricula = usageInfo?.curricula.filter(curriculum =>
    curriculum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curriculum.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAvailableCurricula = availableCurricula.filter(curriculum =>
    !usageInfo?.curricula.some(used => used.id === curriculum.id) &&
    (curriculum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     curriculum.course_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab('usage');
      setSearchTerm('');
      setAssignmentForm({
        curriculum_id: '',
        is_required: true,
      });
    }
  }, [open]);

  const handleAssignToCurriculum = () => {
    if (!content || !assignmentForm.curriculum_id) return;

    onAssignToCurriculum?.(content.id, {
      curriculum_id: assignmentForm.curriculum_id,
      section_id: assignmentForm.section_id,
      sequence: assignmentForm.sequence,
      custom_title: assignmentForm.custom_title,
      custom_instructions: assignmentForm.custom_instructions,
      is_required: assignmentForm.is_required,
    });

    // Reset form
    setAssignmentForm({
      curriculum_id: '',
      is_required: true,
    });
  };

  const handleRemoveFromCurriculum = (curriculumId: string) => {
    if (!content) return;
    onRemoveFromCurriculum?.(content.id, curriculumId);
    setRemoveTargetId(null);
  };

  const getContentTypeIcon = () => {
    if (!content) return '📄';
    const contentType = 'assessment_type' in content ? 'assessment' : 'lesson';
    return contentType === 'lesson' ? '📚' : '📝';
  };

  const renderUsageCard = (curriculum: CurriculumReference) => (
    <div
      key={curriculum.id}
      className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{curriculum.name}</h4>
            {curriculum.custom_title && (
              <Badge variant="outline" className="text-xs">
                Custom Title
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {curriculum.course_name}
          </p>
          {curriculum.usage_sequence && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Settings className="h-3 w-3" />
              <span>Sequence: {curriculum.usage_sequence}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToCurriculum?.(curriculum.id)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setRemoveTargetId(curriculum.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from Curriculum</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this content from "{curriculum.name}"?
                  This will remove it from the curriculum's learning path.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleRemoveFromCurriculum(curriculum.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {curriculum.custom_instructions && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <strong>Custom Instructions:</strong> {curriculum.custom_instructions}
        </div>
      )}
    </div>
  );

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{getContentTypeIcon()}</span>
            <div>
              <div className="flex items-center gap-2">
                Content Usage Management
                <Badge variant="secondary" className="text-xs">
                  {usageInfo?.usage_count || 0} usage{(usageInfo?.usage_count || 0) === 1 ? '' : 's'}
                </Badge>
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                {content.name} ({content.code})
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            View where this content is used and manage its curriculum assignments.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Current Usage ({usageInfo?.usage_count || 0})
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add to Curricula
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search current usage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Usage Summary */}
            {usageInfo && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {usageInfo.usage_count}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {usageInfo.curricula.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Curricula</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    usageInfo.is_orphaned ? "text-orange-600" : "text-gray-600"
                  )}>
                    {usageInfo.is_orphaned ? (
                      <AlertTriangle className="h-8 w-8 mx-auto" />
                    ) : (
                      <CheckCircle className="h-8 w-8 mx-auto" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {usageInfo.is_orphaned ? 'Orphaned' : 'In Use'}
                  </div>
                </div>
              </div>
            )}

            {/* Usage List */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredCurricula.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {usageInfo?.usage_count === 0 ? (
                      <div className="space-y-2">
                        <GitBranch className="h-16 w-16 mx-auto opacity-50" />
                        <p>This content is not used in any curricula yet.</p>
                        <p className="text-xs">Use the "Add to Curricula" tab to assign it.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Search className="h-16 w-16 mx-auto opacity-50" />
                        <p>No usage found matching your search.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredCurricula.map(renderUsageCard)
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4 mt-4">
            {/* Assignment Form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Assign to New Curriculum</h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="curriculum">Curriculum</Label>
                  <Select
                    value={assignmentForm.curriculum_id}
                    onValueChange={(value) => 
                      setAssignmentForm(prev => ({ ...prev, curriculum_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableCurricula.map((curriculum) => (
                        <SelectItem key={curriculum.id} value={curriculum.id}>
                          <div className="flex flex-col">
                            <span>{curriculum.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {curriculum.course_name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sequence">Sequence (Optional)</Label>
                    <Input
                      id="sequence"
                      type="number"
                      placeholder="Sequence order"
                      value={assignmentForm.sequence || ''}
                      onChange={(e) => 
                        setAssignmentForm(prev => ({ 
                          ...prev, 
                          sequence: parseInt(e.target.value) || undefined 
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="required">Requirement</Label>
                    <Select
                      value={assignmentForm.is_required ? 'required' : 'optional'}
                      onValueChange={(value) => 
                        setAssignmentForm(prev => ({ 
                          ...prev, 
                          is_required: value === 'required' 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customTitle">Custom Title (Optional)</Label>
                  <Input
                    id="customTitle"
                    placeholder="Override the default content title"
                    value={assignmentForm.custom_title || ''}
                    onChange={(e) => 
                      setAssignmentForm(prev => ({ 
                        ...prev, 
                        custom_title: e.target.value 
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
                  <Input
                    id="customInstructions"
                    placeholder="Special instructions for this curriculum"
                    value={assignmentForm.custom_instructions || ''}
                    onChange={(e) => 
                      setAssignmentForm(prev => ({ 
                        ...prev, 
                        custom_instructions: e.target.value 
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handleAssignToCurriculum}
                  disabled={!assignmentForm.curriculum_id || loading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign to Curriculum
                </Button>
              </div>
            </div>

            {/* Available Curricula */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Available Curricula</h4>
                <Badge variant="outline" className="text-xs">
                  {filteredAvailableCurricula.length} available
                </Badge>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search available curricula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredAvailableCurricula.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="space-y-2">
                        <LinkIcon className="h-16 w-16 mx-auto opacity-50" />
                        <p>No available curricula found.</p>
                        <p className="text-xs">
                          This content may already be assigned to all curricula.
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredAvailableCurricula.map((curriculum) => (
                      <div
                        key={curriculum.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/30 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">{curriculum.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {curriculum.course_name}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => 
                            setAssignmentForm(prev => ({ 
                              ...prev, 
                              curriculum_id: curriculum.id 
                            }))
                          }
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Select
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}