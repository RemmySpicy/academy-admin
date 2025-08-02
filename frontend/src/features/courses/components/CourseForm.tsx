/**
 * Course Form Component - Create and Edit Courses
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProgramContext } from '@/store/programContext';
import { useProgramConfiguration, useProgramAgeGroups, useProgramDifficultyLevels, useProgramSessionTypes } from '@/features/academy/hooks/useAcademyPrograms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload,
  Star,
  Award,
  BookOpen,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, CourseCreate, CourseUpdate } from '../api/courseApiService';
import { useProgramAgeGroups, useProgramDifficultyLevels, useProgramSessionTypes } from '@/features/programs/hooks';

interface CourseFormProps {
  course?: Course; // For editing
  onSubmit: (data: any) => Promise<void>; // Generic to handle both create and update
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const courseFormSchema = z.object({
  program_id: z.string().min(1, 'Program is required'),
  name: z.string().min(1, 'Course name is required').max(200, 'Course name is too long'),
  code: z.string().min(1, 'Course code is required').max(50, 'Course code is too long'),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  duration_weeks: z.coerce.number().min(1, 'Duration must be at least 1 week').max(104, 'Duration cannot exceed 2 years').optional(),
  sessions_per_payment: z.coerce.number().min(1, 'Must have at least 1 session').max(100, 'Cannot exceed 100 sessions'),
  completion_deadline_weeks: z.coerce.number().min(1, 'Must have at least 1 week').max(52, 'Cannot exceed 1 year'),
  age_groups: z.array(z.string()).min(1, 'At least one age group is required'),
  location_types: z.array(z.string()).min(1, 'At least one location type is required'),
  session_types: z.array(z.string()).min(1, 'At least one session type is required'),
  pricing_ranges: z.array(z.object({
    age_group: z.string(),
    price_from: z.coerce.number().min(0, 'Price cannot be negative'),
    price_to: z.coerce.number().min(0, 'Price cannot be negative'),
  })).min(1, 'At least one pricing range must be set').refine(data => {
    return data.every(range => range.price_to >= range.price_from);
  }, 'price_to must be greater than or equal to price_from'),
  instructor_id: z.string().optional(),
  max_students: z.coerce.number().optional(),
  min_students: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  sequence: z.coerce.number().optional(),
  difficulty_level: z.string().optional().or(z.literal('')), // Dynamic validation based on program config
  status: z.enum(['draft', 'under_review', 'approved', 'published', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
  is_certification_course: z.boolean().default(false),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

// Fallback static options for when program configuration is loading
const fallbackAgeRangeOptions = [
  { value: '6-8', label: '6-8 years' },
  { value: '9-12', label: '9-12 years' },
  { value: '13-17', label: '13-17 years' },
  { value: '18+', label: '18+ years' },
];

const locationTypeOptions = [
  { value: 'our-facility', label: 'Our Facility' },
  { value: 'client-location', label: 'Client\'s Preferred Location' },
  { value: 'virtual', label: 'Virtual (Online)' },
];

const fallbackSessionTypeOptions = [
  { value: 'private', label: 'Private' },
  { value: 'group', label: 'Group' },
  { value: 'school-group', label: 'School Group' },
];

const fallbackDifficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function CourseForm({
  course,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CourseFormProps) {
  const { currentProgram } = useProgramContext();
  
  // Get program configuration from Academy Administration setup
  const { data: ageGroups, isLoading: ageGroupsLoading } = useProgramAgeGroups(currentProgram?.id);
  const { data: difficultyLevels, isLoading: difficultyLoading } = useProgramDifficultyLevels(currentProgram?.id);
  const { data: sessionTypes, isLoading: sessionTypesLoading } = useProgramSessionTypes(currentProgram?.id);
  
  // Combined loading state for all configuration data
  const configLoading = ageGroupsLoading || difficultyLoading || sessionTypesLoading;
  const [objectives, setObjectives] = useState<string[]>(course?.objectives || ['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(course?.prerequisites || ['']);
  const [tags, setTags] = useState<string[]>(course?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(course?.age_groups || []);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>(course?.location_types || []);
  const [selectedSessionTypes, setSelectedSessionTypes] = useState<string[]>(course?.session_types || []);
  const [pricingRanges, setPricingRanges] = useState<any[]>(course?.pricing_ranges || []);

  // Prepare options from program configuration
  const ageGroupOptions = ageGroups?.map(ag => ({ value: ag.id, label: ag.name })) || fallbackAgeRangeOptions;
  const difficultyOptions = difficultyLevels?.map(dl => ({ value: dl.id, label: dl.name })) || fallbackDifficultyOptions;
  const sessionTypeOptions = sessionTypes?.map(st => ({ value: st.id, label: st.name })) || fallbackSessionTypeOptions;
  
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      program_id: course?.program_id || currentProgram?.id || '',
      name: course?.name || '',
      code: course?.code || '',
      description: course?.description || '',
      objectives: course?.objectives || [],
      prerequisites: course?.prerequisites || [],
      duration_weeks: course?.duration_weeks || undefined,
      sessions_per_payment: course?.sessions_per_payment || 8,
      completion_deadline_weeks: course?.completion_deadline_weeks || 6,
      age_groups: course?.age_groups || [],
      location_types: course?.location_types || [],
      session_types: course?.session_types || [],
      pricing_ranges: course?.pricing_ranges || [],
      instructor_id: course?.instructor_id || '',
      max_students: course?.max_students || undefined,
      min_students: course?.min_students || undefined,
      tags: course?.tags || [],
      image_url: course?.image_url || '',
      video_url: course?.video_url || '',
      sequence: course?.sequence, // Let backend auto-assign if not provided
      difficulty_level: course?.difficulty_level || undefined,
      status: course?.status || 'draft',
      is_featured: course?.is_featured || false,
      is_certification_course: course?.is_certification_course || false,
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    try {
      const submitData = {
        ...data,
        objectives: objectives.filter(obj => obj.trim() !== ''),
        prerequisites: prerequisites.filter(prereq => prereq.trim() !== ''),
        tags: tags,
        age_groups: selectedAgeGroups,
        location_types: selectedLocationTypes,
        session_types: selectedSessionTypes,
        pricing_ranges: pricingRanges,
        image_url: data.image_url || undefined,
        video_url: data.video_url || undefined,
        instructor_id: data.instructor_id || undefined,
        max_students: data.max_students || undefined,
        min_students: data.min_students || undefined,
        duration_weeks: data.duration_weeks || undefined,
        sequence: data.sequence,
      };

      await onSubmit(submitData);
      toast.success(course ? 'Course updated successfully' : 'Course created successfully');
    } catch (error) {
      toast.error(`Failed to ${course ? 'update' : 'create'} course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const addPrerequisite = () => {
    setPrerequisites([...prerequisites, '']);
  };

  const updatePrerequisite = (index: number, value: string) => {
    const newPrerequisites = [...prerequisites];
    newPrerequisites[index] = value;
    setPrerequisites(newPrerequisites);
  };

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Generate pricing ranges when age groups change
  useEffect(() => {
    if (selectedAgeGroups.length > 0) {
      const newPricingRanges = [];
      for (const ageGroup of selectedAgeGroups) {
        // Check if this age group already exists in the current ranges
        const existingRange = pricingRanges.find(
          range => range.age_group === ageGroup
        );
        
        newPricingRanges.push({
          age_group: ageGroup,
          price_from: existingRange ? existingRange.price_from : 0,
          price_to: existingRange ? existingRange.price_to : 0
        });
      }
      setPricingRanges(newPricingRanges);
      form.setValue('pricing_ranges', newPricingRanges);
    } else {
      setPricingRanges([]);
      form.setValue('pricing_ranges', []);
    }
  }, [selectedAgeGroups, form]);

  // Update program_id when current program changes
  useEffect(() => {
    if (currentProgram?.id && !course?.program_id) {
      form.setValue('program_id', currentProgram.id);
    }
  }, [currentProgram, form, course]);

  const handlePricingRangeChange = (index: number, field: 'price_from' | 'price_to', value: number) => {
    const updatedRanges = [...pricingRanges];
    updatedRanges[index][field] = value;
    setPricingRanges(updatedRanges);
    form.setValue('pricing_ranges', updatedRanges);
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Format with commas (simple formatting)
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Currency change handler removed - now handled inline in pricing ranges UI

  // Show loading state while fetching program configuration
  if (configLoading && !currentProgram) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
              <p className="text-muted-foreground mt-4">Loading program configuration...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className ? `space-y-4 ${className}` : "space-y-4"}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter course name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CS101, SWIM-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide a detailed description of the course"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {difficultyLevels && difficultyLevels.length > 0 
                          ? `Difficulty levels from ${currentProgram?.name || 'program'} configuration`
                          : 'Using default difficulty levels (configure in Academy Administration)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sessions_per_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sessions per Payment *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" max="100" placeholder="e.g., 8" />
                      </FormControl>
                      <FormDescription>
                        Number of sessions included in each payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completion_deadline_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Deadline (weeks) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" max="52" placeholder="e.g., 6" />
                      </FormControl>
                      <FormDescription>
                        Time limit to complete paid sessions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Duration (weeks)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" max="104" placeholder="Optional" />
                      </FormControl>
                      <FormDescription>
                        Estimated course length (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Learning objective ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeObjective(index)}
                    disabled={objectives.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Learning Objective
              </Button>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    placeholder={`Prerequisite ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePrerequisite(index)}
                    disabled={prerequisites.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrerequisite}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prerequisite
              </Button>
            </CardContent>
          </Card>

          {/* Enrollment & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="min_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Students</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Instructor ID (optional)" />
                      </FormControl>
                      <FormDescription>
                        Leave empty to assign later
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>


          {/* Availability Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Availability Options
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure age groups, locations, and session types for this course
              </p>
            </CardHeader>
            <CardContent>
              {/* Side-by-side layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Age Groups */}
                <div className="bg-muted/20 rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-muted-foreground">1.</span>
                  <Label className="text-sm font-medium">Age Groups *</Label>
                  {(ageGroupsLoading || configLoading) && (
                    <span className="text-xs text-muted-foreground">(Loading from program...)</span>
                  )}
                </div>
                <div className="space-y-2">
                  {ageGroupOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        id={`age-${option.value}`}
                        checked={selectedAgeGroups.includes(option.value)}
                        onChange={(e) => {
                          const updatedGroups = e.target.checked
                            ? [...selectedAgeGroups, option.value]
                            : selectedAgeGroups.filter(group => group !== option.value);
                          setSelectedAgeGroups(updatedGroups);
                          form.setValue('age_groups', updatedGroups);
                        }}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <Label 
                        htmlFor={`age-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {ageGroups && ageGroups.length > 0 
                    ? `Age groups from ${currentProgram?.name || 'program'} configuration`
                    : 'Using default age groups (configure in Academy Administration)'}
                </p>
                {form.formState.errors.age_groups && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.age_groups.message}</p>
                )}
                </div>

                {/* Location Types */}
                <div className="bg-muted/20 rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-muted-foreground">2.</span>
                  <Label className="text-sm font-medium">Location Types *</Label>
                </div>
                <div className="space-y-2">
                  {locationTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        id={`location-${option.value}`}
                        checked={selectedLocationTypes.includes(option.value)}
                        onChange={(e) => {
                          const updatedTypes = e.target.checked
                            ? [...selectedLocationTypes, option.value]
                            : selectedLocationTypes.filter(type => type !== option.value);
                          setSelectedLocationTypes(updatedTypes);
                          form.setValue('location_types', updatedTypes);
                        }}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <Label 
                        htmlFor={`location-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.location_types && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.location_types.message}</p>
                )}
                </div>

                {/* Session Types */}
                <div className="bg-muted/20 rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-muted-foreground">3.</span>
                  <Label className="text-sm font-medium">Session Types *</Label>
                  {(sessionTypesLoading || configLoading) && (
                    <span className="text-xs text-muted-foreground">(Loading from program...)</span>
                  )}
                </div>
                <div className="space-y-2">
                  {sessionTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        id={`session-${option.value}`}
                        checked={selectedSessionTypes.includes(option.value)}
                        onChange={(e) => {
                          const updatedTypes = e.target.checked
                            ? [...selectedSessionTypes, option.value]
                            : selectedSessionTypes.filter(type => type !== option.value);
                          setSelectedSessionTypes(updatedTypes);
                          form.setValue('session_types', updatedTypes);
                        }}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <Label 
                        htmlFor={`session-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {sessionTypes && sessionTypes.length > 0 
                    ? `Session types from ${currentProgram?.name || 'program'} configuration`
                    : 'Using default session types (configure in Academy Administration)'}
                </p>
                {form.formState.errors.session_types && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.session_types.message}</p>
                )}
                </div>
              </div>

              {/* Simple Progress Indicator */}
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <div className="text-sm">
                  <span className="font-medium">Progress: </span>
                  <span className="text-muted-foreground">
                    {selectedAgeGroups.length} age groups, {selectedLocationTypes.length} locations, {selectedSessionTypes.length} session types
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Course Pricing Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Course Pricing Setup
              </CardTitle>
              <p className="text-sm text-muted-foreground">Set price ranges for each age group to give customers an idea of cost without exact pricing</p>
            </CardHeader>
            <CardContent>
              {pricingRanges.length > 0 ? (
                <div className="space-y-4">
                  {pricingRanges.map((range, index) => (
                    <div key={range.age_group} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <h4 className="font-semibold text-gray-900">
                          {ageGroupOptions.find(opt => opt.value === range.age_group)?.label || range.age_group}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">From (₦)</Label>
                          <Input
                            type="text"
                            value={range.price_from ? formatCurrency(range.price_from.toString()) : ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                              handlePricingRangeChange(index, 'price_from', value);
                            }}
                            className="w-full"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">To (₦)</Label>
                          <Input
                            type="text"
                            value={range.price_to ? formatCurrency(range.price_to.toString()) : ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                              handlePricingRangeChange(index, 'price_to', value);
                            }}
                            className="w-full"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-muted/30 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Price Range:</span> ₦{formatCurrency((range.price_from || 0).toString())} - ₦{formatCurrency((range.price_to || 0).toString())}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This range will be displayed to customers for this age group. Exact prices are configured per facility.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pricing Ranges Available</h3>
                  <p className="text-gray-600 mb-1">
                    To set course pricing ranges, please first select at least one age group above.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Pricing ranges give potential customers an idea of cost without revealing exact facility-specific prices.
                  </p>
                </div>
              )}
              {form.formState.errors.pricing_ranges && (
                <p className="text-sm text-red-600 mt-3">{form.formState.errors.pricing_ranges.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Media & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Media & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/course-image.jpg" />
                    </FormControl>
                    <FormDescription>
                      URL to the course thumbnail image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Preview Video URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://youtube.com/watch?v=..." />
                    </FormControl>
                    <FormDescription>
                      URL to the course preview video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sequence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Order</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0" 
                        placeholder={course ? "Current order" : "Auto-assigned"}
                        disabled={!course} // Only allow editing for existing courses
                      />
                    </FormControl>
                    <FormDescription>
                      {course ? "Order of this course in the program" : "Will be automatically assigned as the next sequence"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Course Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Featured Course
                      </FormLabel>
                      <FormDescription>
                        Display this course prominently in the catalog
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_certification_course"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Certification Course
                      </FormLabel>
                      <FormDescription>
                        Students will receive a certificate upon completion
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CourseForm;