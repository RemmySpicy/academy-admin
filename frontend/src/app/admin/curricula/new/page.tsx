'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, Save, Eye, Award } from 'lucide-react';
import Link from 'next/link';
import { useCourse, useCourses } from '@/features/courses/hooks/useCourses';
import { useCreateCurriculum } from '@/features/courses/hooks/useCurricula';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

interface CurriculumFormData {
  name: string;
  description: string;
  course_id: string;
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

export default function NewCurriculumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get('course_id');
  
  const [formData, setFormData] = useState<CurriculumFormData>({
    name: '',
    description: '',
    course_id: preselectedCourseId || '',
    difficulty_level: 'beginner',
    duration_hours: '',
    prerequisites: '',
    learning_objectives: '',
    age_ranges: [],
    is_default_for_age_groups: [],
    status: 'draft',
  });

  const createCurriculum = useCreateCurriculum();
  const { data: coursesData } = useCourses({ page: 1, per_page: 100 });
  const { data: selectedCourse } = useCourse(formData.course_id, { enabled: !!formData.course_id });

  usePageTitle('Create Curriculum', 'Create a new curriculum for your course');

  const availableCourses = coursesData?.items || [];
  const courseAgeRanges = selectedCourse?.age_ranges || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
      };
      
      const newCurriculum = await createCurriculum.mutateAsync(submitData);
      toast.success('Curriculum created successfully');
      router.push(`/admin/curricula/${newCurriculum.id}`);
    } catch (error) {
      toast.error('Failed to create curriculum');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const submitData = {
        ...formData,
        status: 'draft',
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
      };
      
      const newCurriculum = await createCurriculum.mutateAsync(submitData);
      toast.success('Curriculum draft saved successfully');
      router.push(`/admin/curricula/${newCurriculum.id}`);
    } catch (error) {
      toast.error('Failed to save curriculum draft');
    }
  };

  const handleAgeRangeToggle = (ageRange: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      age_ranges: checked 
        ? [...prev.age_ranges, ageRange]
        : prev.age_ranges.filter(ar => ar !== ageRange)
    }));
  };

  const handleDefaultToggle = (ageRange: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_default_for_age_groups: checked 
        ? [...prev.is_default_for_age_groups, ageRange]
        : prev.is_default_for_age_groups.filter(ar => ar !== ageRange)
    }));
  };

  const isFormValid = formData.name.trim() && formData.course_id && formData.age_ranges.length > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/courses" className="hover:text-blue-600">
          Courses
        </Link>
        <span>/</span>
        <Link href="/admin/courses?tab=curricula" className="hover:text-blue-600">
          Curricula
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New Curriculum</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Curriculum</h1>
          <p className="text-gray-600">
            Create a structured learning pathway for your course
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/courses?tab=curricula">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Curricula
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Curriculum Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Swimming Fundamentals - Beginner"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course_id">Course *</Label>
                    <Select 
                      value={formData.course_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="duration_hours">Duration (hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      min="1"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: e.target.value }))}
                      placeholder="e.g., 40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn in this curriculum..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learning_objectives">Learning Objectives</Label>
                  <Textarea
                    id="learning_objectives"
                    value={formData.learning_objectives}
                    onChange={(e) => setFormData(prev => ({ ...prev, learning_objectives: e.target.value }))}
                    placeholder="List the main learning objectives for this curriculum..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                    placeholder="List any prerequisites or prior knowledge required..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Age Groups Selection */}
            {courseAgeRanges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Age Groups *</CardTitle>
                  <p className="text-sm text-gray-600">
                    Select the age groups this curriculum applies to
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseAgeRanges.map((ageRange) => (
                      <div key={ageRange} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`age-${ageRange}`}
                            checked={formData.age_ranges.includes(ageRange)}
                            onCheckedChange={(checked) => handleAgeRangeToggle(ageRange, checked as boolean)}
                          />
                          <Label htmlFor={`age-${ageRange}`} className="font-medium">
                            {ageRange}
                          </Label>
                        </div>
                        
                        {formData.age_ranges.includes(ageRange) && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`default-${ageRange}`}
                              checked={formData.is_default_for_age_groups.includes(ageRange)}
                              onCheckedChange={(checked) => handleDefaultToggle(ageRange, checked as boolean)}
                            />
                            <Label htmlFor={`default-${ageRange}`} className="text-sm text-orange-600">
                              <Award className="h-3 w-3 inline mr-1" />
                              Set as default
                            </Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
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

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Selected Age Groups:</h4>
                  {formData.age_ranges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.age_ranges.map((ageRange) => (
                        <Badge 
                          key={ageRange} 
                          variant={formData.is_default_for_age_groups.includes(ageRange) ? "default" : "outline"}
                        >
                          {formData.is_default_for_age_groups.includes(ageRange) && (
                            <Award className="h-3 w-3 mr-1" />
                          )}
                          {ageRange}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No age groups selected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!isFormValid || createCurriculum.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Curriculum
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleSaveDraft}
                  disabled={!formData.name.trim() || createCurriculum.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}