'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Save, Eye, Award, Settings, Plus, Target, Trash2, ChevronDown, ChevronRight, Layers, AlertCircle, GripVertical, Library, FileText, Video, Clock, Play, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useCourse } from '@/features/courses/hooks/useCourses';
import { useCurriculum, useUpdateCurriculum, useSaveCurriculumStructure, useLevelsByCurriculum } from '@/features/courses/hooks/useCurricula';
import { CurriculumBuilder } from '@/features/courses/components/CurriculumBuilder';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

interface CurriculumFormData {
  name: string;
  curriculum_code: string;
  description: string;
  difficulty_level: string;
  duration_hours: string;
  prerequisites: string;
  learning_objectives: string;
  age_ranges: string[];
  is_default_for_age_groups: string[];
  status: string;
}

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
];

export default function EditCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const curriculumId = params.id as string;
  const initialTab = searchParams.get('tab') || 'details';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: curriculum, isLoading } = useCurriculum(curriculumId);
  const { data: course } = useCourse(curriculum?.course_id || '');
  const updateCurriculum = useUpdateCurriculum();
  const saveCurriculumStructure = useSaveCurriculumStructure();
  const { data: existingLevels, isLoading: levelsLoading } = useLevelsByCurriculum(curriculumId);

  const [formData, setFormData] = useState<CurriculumFormData>({
    name: '',
    curriculum_code: '',
    description: '',
    difficulty_level: 'beginner',
    duration_hours: '',
    prerequisites: '',
    learning_objectives: '',
    age_ranges: [],
    is_default_for_age_groups: [],
    status: 'draft',
  });

  // New Builder tab state
  const [levels, setLevels] = useState<any[]>([]);
  const [activeLevel, setActiveLevel] = useState<string>('');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Progression settings state
  const [progressionSettings, setProgressionSettings] = useState({
    module_unlock_threshold_percentage: 70.0,
    require_minimum_one_star_per_lesson: true,
    allow_cross_level_progression: true,
    allow_lesson_retakes: true,
  });

  const MAX_LEVELS = 15;

  usePageTitle(
    curriculum ? `Edit ${curriculum.name}` : 'Edit Curriculum',
    curriculum ? `Edit curriculum for ${curriculum.course_name}` : 'Loading curriculum...'
  );

  // Initialize form data when curriculum loads
  useEffect(() => {
    if (curriculum) {
      setFormData({
        name: curriculum.name || '',
        curriculum_code: curriculum.curriculum_code || '',
        description: curriculum.description || '',
        difficulty_level: curriculum.difficulty_level || 'beginner',
        duration_hours: curriculum.duration_hours ? curriculum.duration_hours.toString() : '',
        prerequisites: curriculum.prerequisites || '',
        learning_objectives: curriculum.learning_objectives || '',
        age_ranges: curriculum.age_ranges || [],
        is_default_for_age_groups: curriculum.is_default_for_age_groups || [],
        status: curriculum.status || 'draft',
      });
    }
  }, [curriculum]);

  const courseAgeRanges = course?.age_ranges || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save basic curriculum metadata
      const submitData: any = {
        name: formData.name,
        curriculum_code: formData.curriculum_code,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
        prerequisites: formData.prerequisites,
        learning_objectives: formData.learning_objectives,
        age_ranges: formData.age_ranges,
        is_default_for_age_groups: formData.is_default_for_age_groups,
      };
      
      await updateCurriculum.mutateAsync({ id: curriculumId, data: submitData });
      
      // Save curriculum structure (levels, modules, sections, lessons)
      if (levels.length > 0) {
        await saveCurriculumStructure.mutateAsync({
          curriculumId,
          structure: {
            levels,
            progressionSettings
          }
        });
      }
      
      toast.success('Curriculum updated successfully');
      router.push(`/admin/curricula/${curriculumId}`);
    } catch (error) {
      toast.error('Failed to update curriculum');
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Save basic curriculum metadata as draft
      const submitData: any = {
        name: formData.name,
        curriculum_code: formData.curriculum_code,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
        prerequisites: formData.prerequisites,
        learning_objectives: formData.learning_objectives,
        age_ranges: formData.age_ranges,
        is_default_for_age_groups: formData.is_default_for_age_groups,
        status: 'draft',
      };
      
      await updateCurriculum.mutateAsync({ id: curriculumId, data: submitData });
      
      // Save curriculum structure (levels, modules, sections, lessons)
      if (levels.length > 0) {
        await saveCurriculumStructure.mutateAsync({
          curriculumId,
          structure: {
            levels,
            progressionSettings
          }
        });
      }
      
      toast.success('Curriculum saved as draft');
    } catch (error) {
      toast.error('Failed to save curriculum draft');
    }
  };

  const handleAgeRangeToggle = (ageRange: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      age_ranges: checked 
        ? [...prev.age_ranges, ageRange]
        : prev.age_ranges.filter(range => range !== ageRange)
    }));
  };

  const handleDefaultAgeGroupToggle = (ageGroup: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_default_for_age_groups: checked
        ? [...prev.is_default_for_age_groups, ageGroup]
        : prev.is_default_for_age_groups.filter(group => group !== ageGroup)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/curricula"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Curricula
          </Link>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/curricula"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Curricula
          </Link>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={updateCurriculum.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button type="submit" disabled={updateCurriculum.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Curriculum Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter curriculum name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curriculum_code">Curriculum Code *</Label>
                    <Input
                      id="curriculum_code"
                      value={formData.curriculum_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, curriculum_code: e.target.value }))}
                      placeholder="e.g., SWIM-101"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty_level}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_hours">Duration (Hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: e.target.value }))}
                      placeholder="e.g., 40"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this curriculum covers..."
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="learning_objectives">Learning Objectives</Label>
                    <Textarea
                      id="learning_objectives"
                      value={formData.learning_objectives}
                      onChange={(e) => setFormData(prev => ({ ...prev, learning_objectives: e.target.value }))}
                      placeholder="What will students learn from this curriculum?"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="prerequisites">Prerequisites</Label>
                    <Textarea
                      id="prerequisites"
                      value={formData.prerequisites}
                      onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                      placeholder="What should students know before starting this curriculum?"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age Groups Configuration */}
            {courseAgeRanges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Age Groups Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Target Age Ranges</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Select which age groups this curriculum is designed for
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {courseAgeRanges.map((ageRange) => (
                          <div key={ageRange} className="flex items-center space-x-2">
                            <Checkbox
                              id={`age-range-${ageRange}`}
                              checked={formData.age_ranges.includes(ageRange)}
                              onCheckedChange={(checked) => 
                                handleAgeRangeToggle(ageRange, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`age-range-${ageRange}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {ageRange}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Default Curriculum for Age Groups
                      </Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Set this curriculum as the default for specific age groups (students will be automatically assigned to this curriculum)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.age_ranges.map((ageRange) => (
                          <div key={ageRange} className="flex items-center space-x-2">
                            <Checkbox
                              id={`default-${ageRange}`}
                              checked={formData.is_default_for_age_groups.includes(ageRange)}
                              onCheckedChange={(checked) => 
                                handleDefaultAgeGroupToggle(ageRange, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`default-${ageRange}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {ageRange}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.is_default_for_age_groups.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Setting this as default will automatically assign new students 
                            in the selected age groups to this curriculum. Any existing default curricula 
                            for these age groups will be updated.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <CurriculumBuilder
              curriculumId={curriculumId}
              onBack={() => setActiveTab('details')}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}