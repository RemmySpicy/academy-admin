/**
 * GlobalContentEditModal component for editing content with version strategy and impact warnings
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  AlertTriangle,
  Info,
  GitBranch,
  Edit,
  Plus,
  ExternalLink,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContentItem, 
  ContentUpdateData, 
  ContentVersionData,
  ContentUsageInfo,
  CurriculumReference
} from '../api/contentApiService';
import { CurriculumStatus, DifficultyLevel } from '@/lib/api/types';

interface GlobalContentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ContentItem | null;
  onSave: (
    contentId: string, 
    updateData: ContentUpdateData, 
    versionData: ContentVersionData
  ) => void;
  onNavigateToCurriculum?: (curriculumId: string) => void;
  loading?: boolean;
}

type EditStrategy = 'immediate' | 'new_version';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'under_review', label: 'Under Review' },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export function GlobalContentEditModal({
  open,
  onOpenChange,
  content,
  onSave,
  onNavigateToCurriculum,
  loading = false,
}: GlobalContentEditModalProps) {
  const [editStrategy, setEditStrategy] = useState<EditStrategy>('immediate');
  const [changeSummary, setChangeSummary] = useState('');
  const [formData, setFormData] = useState<ContentUpdateData>({});
  const [showImpactWarning, setShowImpactWarning] = useState(false);

  const usageInfo = content?.usage_info;
  const hasUsage = usageInfo && usageInfo.usage_count > 0;

  // Reset form when content changes
  useEffect(() => {
    if (content) {
      setFormData({
        name: content.name,
        code: content.code,
        description: content.description || '',
        objectives: content.objectives || '',
        status: content.status,
        difficulty_level: content.difficulty_level,
        duration_minutes: content.duration_minutes,
        is_required: content.is_required,
      });
      setEditStrategy(hasUsage ? 'new_version' : 'immediate');
      setChangeSummary('');
      setShowImpactWarning(hasUsage || false);
    }
  }, [content, hasUsage]);

  const handleInputChange = (field: keyof ContentUpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!content) return;

    const versionData: ContentVersionData = {
      version_strategy: editStrategy,
      change_summary: changeSummary || undefined,
      notify_curricula: editStrategy === 'new_version',
    };

    onSave(content.id, formData, versionData);
  };

  const getContentTypeIcon = () => {
    const contentType = 'assessment_type' in content! ? 'assessment' : 'lesson';
    return contentType === 'lesson' ? '📚' : '📝';
  };

  const renderUsageImpact = () => {
    if (!hasUsage || !usageInfo) return null;

    return (
      <Alert className={cn(
        "mb-4",
        editStrategy === 'immediate' ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"
      )}>
        <AlertTriangle className={cn(
          "h-4 w-4",
          editStrategy === 'immediate' ? "text-orange-600" : "text-blue-600"
        )} />
        <AlertTitle className="text-sm font-medium">
          {editStrategy === 'immediate' ? 'Global Update Impact' : 'New Version Impact'}
        </AlertTitle>
        <AlertDescription className="text-sm mt-2">
          {editStrategy === 'immediate' ? (
            <div className="space-y-2">
              <p>
                This content is used in <strong>{usageInfo.usage_count} curricul{usageInfo.usage_count === 1 ? 'um' : 'a'}</strong>. 
                Changes will immediately affect all curricula that use this content.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {usageInfo.curricula.slice(0, 3).map((curriculum) => (
                  <Button
                    key={curriculum.id}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => onNavigateToCurriculum?.(curriculum.id)}
                  >
                    {curriculum.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                ))}
                {usageInfo.curricula.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{usageInfo.curricula.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                A new version will be created. Existing curricula will continue using the current version 
                until they choose to update to the new version.
              </p>
              <p className="text-xs text-muted-foreground">
                This allows for gradual adoption and prevents breaking existing learning paths.
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{getContentTypeIcon()}</span>
            <div>
              <div className="flex items-center gap-2">
                Edit Content
                {content.is_locked && (
                  <Badge variant="destructive" className="text-xs">
                    Locked
                  </Badge>
                )}
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                {content.name} ({content.code})
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Make changes to this content item. Consider the impact on existing curricula.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Impact Warning */}
          {renderUsageImpact()}

          {/* Edit Strategy Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Update Strategy</Label>
            <RadioGroup
              value={editStrategy}
              onValueChange={(value) => setEditStrategy(value as EditStrategy)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="immediate" className="text-sm font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Update in Place
                    </div>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Changes will immediately affect all curricula using this content
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="new_version" id="new_version" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="new_version" className="text-sm font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Create New Version
                    </div>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Create a new version while preserving the current one for existing curricula
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Content name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="Content code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Content description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Learning Objectives</Label>
            <Textarea
              id="objectives"
              value={formData.objectives || ''}
              onChange={(e) => handleInputChange('objectives', e.target.value)}
              placeholder="Learning objectives"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value as CurriculumStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty_level || ''}
                onValueChange={(value) => handleInputChange('difficulty_level', value as DifficultyLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
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

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || undefined)}
                placeholder="Duration"
                min="0"
              />
            </div>
          </div>

          {/* Change Summary (required for new versions) */}
          {editStrategy === 'new_version' && (
            <div className="space-y-2">
              <Label htmlFor="changeSummary">
                Change Summary <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="changeSummary"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Describe what changes you made and why..."
                rows={2}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will help curriculum managers understand what changed in this version.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || (editStrategy === 'new_version' && !changeSummary.trim())}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {editStrategy === 'immediate' ? (
                  <Edit className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editStrategy === 'immediate' ? 'Update Content' : 'Create New Version'}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}