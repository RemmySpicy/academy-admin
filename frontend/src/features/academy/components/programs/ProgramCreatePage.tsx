'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useCreateAcademyProgram } from '../../hooks';
import { BasicInformationTab } from './forms/BasicInformationTab';
import { ConfigurationTab } from './forms/ConfigurationTab';
import { TeamAssignmentTab } from './forms/TeamAssignmentTab';
import { toast } from 'sonner';

// Enhanced validation schema for program creation
const createProgramSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Program name is required').max(200, 'Name must be 200 characters or less'),
  program_code: z.string()
    .min(1, 'Program code is required')
    .max(20, 'Program code must be 20 characters or less')
    .regex(/^[A-Za-z0-9_-]+$/, 'Program code can only contain letters, numbers, hyphens, and underscores'),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).default('active'),
  display_order: z.number().min(0, 'Display order must be a positive number').default(0),
  
  // Configuration
  age_groups: z.array(z.object({
    id: z.string(),
    name: z.string(),
    from_age: z.number().min(3).max(99),
    to_age: z.number().min(3).max(99)
  })).min(1, 'At least one age group is required').max(20, 'Maximum 20 age groups allowed'),
  
  difficulty_levels: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(50),
    weight: z.number().min(1)
  })).min(1, 'At least one difficulty level is required').max(10, 'Maximum 10 difficulty levels allowed'),
  
  session_types: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(50),
    capacity: z.number().min(1).max(100)
  })).min(1, 'At least one session type is required').max(20, 'Maximum 20 session types allowed'),
  
  default_session_duration: z.number().min(15, 'Minimum 15 minutes').max(300, 'Maximum 5 hours'),
  
  // Team Assignment
  team_assignments: z.array(z.object({
    user_id: z.string(),
    role: z.string()
  })).optional()
});

type CreateProgramFormData = z.infer<typeof createProgramSchema>;

// Default configuration values
const DEFAULT_CONFIGURATION = {
  age_groups: [
    { id: "6-8", name: "6-8 years", from_age: 6, to_age: 8 },
    { id: "9-12", name: "9-12 years", from_age: 9, to_age: 12 },
    { id: "13-17", name: "13-17 years", from_age: 13, to_age: 17 },
    { id: "18+", name: "18+ years", from_age: 18, to_age: 99 }
  ],
  difficulty_levels: [
    { id: "beginner", name: "Beginner", weight: 1 },
    { id: "intermediate", name: "Intermediate", weight: 2 },
    { id: "advanced", name: "Advanced", weight: 3 }
  ],
  session_types: [
    { id: "private", name: "Private", capacity: 2 },
    { id: "group", name: "Group", capacity: 5 },
    { id: "school-group", name: "School Group", capacity: 50 }
  ],
  default_session_duration: 60
};

export function ProgramCreatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const createProgram = useCreateAcademyProgram();

  const form = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: '',
      program_code: '',
      description: '',
      category: '',
      status: 'active',
      display_order: 1,
      ...DEFAULT_CONFIGURATION,
      team_assignments: []
    },
  });

  const handleSubmit = async (data: CreateProgramFormData) => {
    try {
      await createProgram.mutateAsync(data);
      toast.success('Program created successfully');
      router.push('/admin/academy/programs');
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error('Failed to create program. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/academy/programs');
  };

  // Auto-generate program code from name
  const handleNameChange = (name: string) => {
    if (!form.getValues('program_code') && name) {
      const generatedCode = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
      form.setValue('program_code', generatedCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/academy/programs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Program</h1>
            <p className="text-gray-600">Set up a comprehensive academy program with configuration and team assignment</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={createProgram.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)} 
            disabled={createProgram.isPending}
          >
            {createProgram.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Program
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="team">Team Assignment</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Set up the fundamental details for your program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BasicInformationTab 
                    form={form} 
                    onNameChange={handleNameChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration">
              <Card>
                <CardHeader>
                  <CardTitle>Program Configuration</CardTitle>
                  <CardDescription>
                    Define age groups, difficulty levels, and session types that will be used throughout the program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConfigurationTab form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Assignment</CardTitle>
                  <CardDescription>
                    Optionally assign program administrators and coordinators (you can also do this later in the Teams section)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamAssignmentTab form={form} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}