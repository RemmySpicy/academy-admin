'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, Eye, Award, Settings } from 'lucide-react';
import Link from 'next/link';
import { useCourse } from '@/features/courses/hooks/useCourses';
import { useCurriculum, useUpdateCurriculum } from '@/features/courses/hooks/useCurricula';
import { CurriculumBuilder } from '@/features/courses/components/CurriculumBuilder';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

interface CurriculumFormData {
  name: string;
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
  const { data: course } = useCourse(curriculum?.course_id || '', { enabled: !!curriculum?.course_id });
  const updateCurriculum = useUpdateCurriculum();

  const [formData, setFormData] = useState<CurriculumFormData>({
    name: '',
    description: '',
    difficulty_level: 'beginner',
    duration_hours: '',
    prerequisites: '',
    learning_objectives: '',
    age_ranges: [],
    is_default_for_age_groups: [],
    status: 'draft',
  });

  usePageTitle(
    curriculum ? `Edit ${curriculum.name}` : 'Edit Curriculum',
    curriculum ? `Edit curriculum for ${curriculum.course_name}` : 'Loading curriculum...'
  );

  // Initialize form data when curriculum loads
  useEffect(() => {
    if (curriculum) {
      setFormData({
        name: curriculum.name || '',
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
      const submitData = {
        ...formData,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
      };
      
      await updateCurriculum.mutateAsync({ id: curriculumId, data: submitData });
      toast.success('Curriculum updated successfully');
      router.push(`/admin/curricula/${curriculumId}`);
    } catch (error) {
      toast.error('Failed to update curriculum');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const submitData = {
        ...formData,
        status: 'draft',
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
      };
      
      await updateCurriculum.mutateAsync({ id: curriculumId, data: submitData });
      toast.success('Curriculum draft saved successfully');
      router.push(`/admin/curricula/${curriculumId}`);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Curriculum not found</h3>
              <p className="text-gray-600 mb-4">The requested curriculum could not be found.</p>
              <Button asChild>
                <Link href="/admin/courses?tab=curricula">
                  Go to Curricula
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFormValid = formData.name.trim() && formData.age_ranges.length > 0;

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
        <Link href={`/admin/courses/${curriculum.course_id}`} className="hover:text-blue-600">
          {curriculum.course_name}
        </Link>
        <span>/</span>
        <Link href={`/admin/curricula/${curriculum.id}`} className="hover:text-blue-600">
          {curriculum.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Edit</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Curriculum</h1>
          <p className="text-gray-600">
            Update {curriculum.name} for {curriculum.course_name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/curricula/${curriculum.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Curriculum
          </Link>
        </Button>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">

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
                    <Label>Course</Label>
                    <Input value={curriculum.course_name} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Course cannot be changed after creation</p>
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
                  disabled={!isFormValid || updateCurriculum.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Curriculum
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleSaveDraft}
                  disabled={!formData.name.trim() || updateCurriculum.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </CardContent>
            </Card>
            </div>
          </div>
        </form>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <CurriculumBuilder
            curriculumId={curriculumId}
            onBack={() => setActiveTab('details')}
            className="bg-white rounded-lg border p-6"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}