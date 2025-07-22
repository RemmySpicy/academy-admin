'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CourseForm } from '@/features/courses/components/CourseForm';
import { useCourse, useUpdateCourse } from '@/features/courses/hooks/useCourses';
import type { CourseUpdate } from '@/features/courses/api/courseApiService';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const { data: course, isLoading } = useCourse(courseId);
  const updateCourse = useUpdateCourse();

  const handleSubmit = async (data: CourseUpdate) => {
    try {
      await updateCourse.mutateAsync({ id: courseId, data });
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      // Error is handled by the hook's onError
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <div>Loading course for editing...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

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
              Edit Course: {course.name}
            </h1>
            <p className="text-gray-600">
              Modify course details and settings for {course.name}
            </p>
          </div>
        </div>
      </div>

      <CourseForm
        course={course}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateCourse.isPending}
      />
    </div>
  );
}