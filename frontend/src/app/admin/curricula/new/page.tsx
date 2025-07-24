'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CurriculumBuilder } from '@/features/courses/components/CurriculumBuilder';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function NewCurriculumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get('course_id');
  
  usePageTitle('Create Curriculum', 'Create a new curriculum for your course');

  const handleBack = () => {
    router.push('/admin/courses?tab=curricula');
  };

  return (
    <CurriculumBuilder
      courseId={preselectedCourseId || undefined}
      onBack={handleBack}
    />
  );
}