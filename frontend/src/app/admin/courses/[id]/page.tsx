'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { CourseDetail } from '@/features/courses/components/CourseDetail';
import { useCourse } from '@/features/courses/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const { data: course, isLoading } = useCourse(courseId);

  if (isLoading) {
    return <div>Loading course details...</div>;
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
              Course Details: {course.name}
            </h1>
            <p className="text-gray-600">
              View details and manage {course.name}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/courses/${courseId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Link>
        </Button>
      </div>
      
      <CourseDetail courseId={courseId} />
    </div>
  );
}