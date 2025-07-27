'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import CourseForm from '@/features/courses/components/CourseForm';
import { useCreateCourse } from '@/features/courses/hooks/useCourses';
import type { CourseCreate } from '@/features/courses/api/courseApiService';

export default function NewCoursePage() {
  const router = useRouter();
  const createCourse = useCreateCourse();

  const handleSubmit = async (data: CourseCreate) => {
    try {
      await createCourse.mutateAsync(data);
      toast.success('Course created successfully');
      router.push('/admin/courses');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create course';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-4 scroll-smooth">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Course
            </h1>
            <p className="text-gray-600">
              Create a new course for your program
            </p>
          </div>
        </div>
      </div>

      <CourseForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createCourse.isPending}
      />
    </div>
  );
}