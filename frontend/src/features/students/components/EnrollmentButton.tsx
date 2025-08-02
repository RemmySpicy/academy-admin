/**
 * Enrollment Button Component
 * A simple button component that opens the enrollment wizard
 * Can be easily integrated into existing student management pages
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, BookOpen } from 'lucide-react';
import { EnrollmentWizard } from './enrollment/EnrollmentWizard';
import { EnrollmentData, CourseAssignment } from '../types/enrollment';
import { User } from '@/shared/types';

interface EnrollmentButtonProps {
  // Pre-select a person for enrollment
  selectedPerson?: User;
  // Button variant and styling
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  // Button text
  children?: React.ReactNode;
  // Callbacks
  onEnrollmentComplete?: (assignment: CourseAssignment) => void;
  onEnrollmentCancel?: () => void;
  // Initial data for the wizard
  initialData?: Partial<EnrollmentData>;
}

export function EnrollmentButton({
  selectedPerson,
  variant = 'default',
  size = 'default',
  className,
  children,
  onEnrollmentComplete,
  onEnrollmentCancel,
  initialData = {},
}: EnrollmentButtonProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    onEnrollmentCancel?.();
  };

  const handleEnrollmentComplete = (assignment: CourseAssignment) => {
    setIsWizardOpen(false);
    onEnrollmentComplete?.(assignment);
  };

  // Prepare initial data with pre-selected person
  const wizardInitialData: Partial<EnrollmentData> = {
    ...initialData,
    ...(selectedPerson && {
      selectedPerson,
      personType: 'existing',
    }),
  };

  const defaultButtonContent = selectedPerson ? (
    <>
      <BookOpen className="h-4 w-4 mr-2" />
      Enroll in Course
    </>
  ) : (
    <>
      <Plus className="h-4 w-4 mr-2" />
      New Enrollment
    </>
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpenWizard}
      >
        {children || defaultButtonContent}
      </Button>

      <EnrollmentWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onComplete={handleEnrollmentComplete}
        initialData={wizardInitialData}
      />
    </>
  );
}

// Convenience components for different use cases

/**
 * Quick enrollment button for student pages
 */
export function StudentEnrollmentButton({
  student,
  onEnrollmentComplete,
  className,
}: {
  student: User;
  onEnrollmentComplete?: (assignment: CourseAssignment) => void;
  className?: string;
}) {
  return (
    <EnrollmentButton
      selectedPerson={student}
      variant="default"
      size="sm"
      className={className}
      onEnrollmentComplete={onEnrollmentComplete}
    >
      <BookOpen className="h-4 w-4 mr-2" />
      Enroll in Course
    </EnrollmentButton>
  );
}

/**
 * General enrollment button for dashboard/main pages
 */
export function NewEnrollmentButton({
  onEnrollmentComplete,
  variant = 'default',
  size = 'default',
  className,
}: {
  onEnrollmentComplete?: (assignment: CourseAssignment) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <EnrollmentButton
      variant={variant}
      size={size}
      className={className}
      onEnrollmentComplete={onEnrollmentComplete}
    >
      <Plus className="h-4 w-4 mr-2" />
      New Enrollment
    </EnrollmentButton>
  );
}

/**
 * Bulk enrollment button for admin operations
 */
export function BulkEnrollmentButton({
  onEnrollmentComplete,
  className,
}: {
  onEnrollmentComplete?: (assignment: CourseAssignment) => void;
  className?: string;
}) {
  return (
    <EnrollmentButton
      variant="outline"
      size="sm"
      className={className}
      onEnrollmentComplete={onEnrollmentComplete}
    >
      <Users className="h-4 w-4 mr-2" />
      Bulk Enrollment
    </EnrollmentButton>
  );
}

export default EnrollmentButton;