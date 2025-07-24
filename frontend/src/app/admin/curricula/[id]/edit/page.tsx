'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CurriculumBuilder } from '@/features/courses/components/CurriculumBuilder';
import { useCurriculum } from '@/features/courses/hooks/useCurricula';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function EditCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.id as string;
  
  const { data: curriculum, isLoading } = useCurriculum(curriculumId);

  usePageTitle(
    curriculum ? `Edit ${curriculum.name}` : 'Edit Curriculum',
    curriculum ? `Edit curriculum for ${curriculum.course_name}` : 'Loading curriculum...'
  );

  const handleBack = () => {
    router.push('/admin/courses?tab=curricula');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-gray-500">
          <h3 className="text-lg font-medium mb-2">Curriculum not found</h3>
          <p className="mb-4">The requested curriculum could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <CurriculumBuilder
      curriculumId={curriculumId}
      onBack={handleBack}
    />
  );
}