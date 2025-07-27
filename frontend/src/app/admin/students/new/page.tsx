'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

// Import the new form component
import StudentCreateForm from '@/features/students/components/StudentCreateForm';

export default function NewStudentPage() {
  usePageTitle('Create Student', 'Add a new student to the program');
  
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/students');
  };

  const handleCancel = () => {
    router.push('/admin/students');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Student</h1>
            <p className="text-gray-600">Add a new student to the program</p>
          </div>
        </div>
      </div>

      {/* Use the new form component */}
      <StudentCreateForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}