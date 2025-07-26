'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useAcademyProgramById, useUpdateAcademyProgram } from '../../hooks';
import { BasicInformationTab } from './forms/BasicInformationTab';
import { ConfigurationTab } from './forms/ConfigurationTab';
import { TeamAssignmentTab } from './forms/TeamAssignmentTab';
import { toast } from 'sonner';

// Same validation schema as create
const updateProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(200, 'Name must be 200 characters or less'),
  program_code: z.string()
    .min(1, 'Program code is required')
    .max(20, 'Program code must be 20 characters or less')
    .regex(/^[A-Za-z0-9_-]+$/, 'Program code can only contain letters, numbers, hyphens, and underscores'),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  display_order: z.number().min(0, 'Display order must be a positive number'),
  
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
  
  team_assignments: z.array(z.object({
    user_id: z.string(),
    role: z.string()
  })).optional()
});

type UpdateProgramFormData = z.infer<typeof updateProgramSchema>;

interface ProgramEditPageProps {
  programId: string;
}

export function ProgramEditPage({ programId }: ProgramEditPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  
  const { data: program, isLoading, error } = useAcademyProgramById(programId);
  const updateProgram = useUpdateAcademyProgram();

  const form = useForm<UpdateProgramFormData>({
    resolver: zodResolver(updateProgramSchema),
    defaultValues: {
      name: '',
      program_code: '',
      description: '',
      category: '',
      status: 'active',
      display_order: 0,
      age_groups: [],
      difficulty_levels: [],
      session_types: [],
      default_session_duration: 60,
      team_assignments: []
    },
  });

  // Populate form when program data loads
  useEffect(() => {
    if (program) {
      form.reset({
        name: program.name || '',
        program_code: program.program_code || '',
        description: program.description || '',
        category: program.category || '',
        status: program.status || 'active',
        display_order: program.display_order || 0,
        age_groups: program.age_groups || [],
        difficulty_levels: program.difficulty_levels || [],
        session_types: program.session_types || [],
        default_session_duration: program.default_session_duration || 60,
        team_assignments: program.team_assignments || []
      });
    }
  }, [program, form]);

  const handleSubmit = async (data: UpdateProgramFormData) => {
    try {
      await updateProgram.mutateAsync({ id: programId, data });
      toast.success('Program updated successfully');
      router.push('/admin/academy/programs');
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error('Failed to update program. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/academy/programs');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/academy/programs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Program</CardTitle>
            <CardDescription>
              Could not load program data for editing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Link href="/admin/academy/programs">
              <Button>Return to Programs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Program</h1>
            <p className="text-gray-600">Update program configuration and settings</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={updateProgram.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)} 
            disabled={updateProgram.isPending}
          >
            {updateProgram.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Program
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
                    Update the fundamental details for your program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BasicInformationTab form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration">
              <Card>
                <CardHeader>
                  <CardTitle>Program Configuration</CardTitle>
                  <CardDescription>
                    Manage age groups, difficulty levels, and session types for this program
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
                    Manage program administrators and coordinators (you can also do this in the Teams section)
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