/**
 * Multi-step Enrollment Wizard Component
 * Provides a comprehensive workflow for course enrollment with facility selection
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  EnrollmentStep,
  EnrollmentData,
  EnrollmentFormState,
  EnrollmentStepValidation,
  EnrollmentValidationError,
  CourseAssignment,
} from '../../types/enrollment';

// Step Components (will be imported)
import { PersonSelectionStep } from './steps/PersonSelectionStep';
import { CourseSelectionStep } from './steps/CourseSelectionStep';
import { FacilitySelectionStep } from './steps/FacilitySelectionStep';
import { ReviewPaymentStep } from './steps/ReviewPaymentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

// Step configuration
const STEPS: Array<{
  key: EnrollmentStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'person-selection',
    title: 'Select Person',
    description: 'Choose who to enroll',
    icon: <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">1</div>,
  },
  {
    key: 'course-selection',
    title: 'Choose Course',
    description: 'Select course and verify eligibility',
    icon: <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">2</div>,
  },
  {
    key: 'facility-selection',
    title: 'Facility & Pricing',
    description: 'Choose facility and session details',
    icon: <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">3</div>,
  },
  {
    key: 'review-payment',
    title: 'Review & Payment',
    description: 'Review details and set payment',
    icon: <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">4</div>,
  },
  {
    key: 'confirmation',
    title: 'Confirmation',
    description: 'Enrollment complete',
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
  },
];

interface EnrollmentWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: (assignment: CourseAssignment) => void;
  initialData?: Partial<EnrollmentData>;
  className?: string;
}

export function EnrollmentWizard({
  isOpen = true,
  onClose,
  onComplete,
  initialData = {},
  className,
}: EnrollmentWizardProps) {
  // Form state management
  const [formState, setFormState] = useState<EnrollmentFormState>({
    currentStep: 'person-selection',
    data: {
      ...initialData,
    },
    validation: {
      'person-selection': { isValid: false, errors: [], canProceed: false },
      'course-selection': { isValid: false, errors: [], canProceed: false },
      'facility-selection': { isValid: false, errors: [], canProceed: false },
      'review-payment': { isValid: false, errors: [], canProceed: false },
      'confirmation': { isValid: true, errors: [], canProceed: true },
    },
    isLoading: false,
    isSubmitting: false,
  });

  // Step navigation
  const currentStepIndex = useMemo(
    () => STEPS.findIndex(step => step.key === formState.currentStep),
    [formState.currentStep]
  );

  const progress = useMemo(
    () => ((currentStepIndex + 1) / STEPS.length) * 100,
    [currentStepIndex]
  );

  const canGoNext = useMemo(
    () => formState.validation[formState.currentStep]?.canProceed || false,
    [formState.validation, formState.currentStep]
  );

  const canGoPrevious = useMemo(
    () => currentStepIndex > 0 && formState.currentStep !== 'confirmation',
    [currentStepIndex, formState.currentStep]
  );

  // Update enrollment data
  const updateData = useCallback((updates: Partial<EnrollmentData>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
    }));
  }, []);

  // Update step validation
  const updateValidation = useCallback((
    step: EnrollmentStep,
    validation: EnrollmentStepValidation
  ) => {
    setFormState(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [step]: validation,
      },
    }));
  }, []);

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (!canGoNext || currentStepIndex >= STEPS.length - 1) return;
    
    const nextStep = STEPS[currentStepIndex + 1];
    setFormState(prev => ({
      ...prev,
      currentStep: nextStep.key,
    }));
  }, [canGoNext, currentStepIndex]);

  const goToPrevious = useCallback(() => {
    if (!canGoPrevious || currentStepIndex <= 0) return;
    
    const previousStep = STEPS[currentStepIndex - 1];
    setFormState(prev => ({
      ...prev,
      currentStep: previousStep.key,
    }));
  }, [canGoPrevious, currentStepIndex]);

  const goToStep = useCallback((step: EnrollmentStep) => {
    const stepIndex = STEPS.findIndex(s => s.key === step);
    if (stepIndex === -1) return;
    
    setFormState(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  // Handle enrollment completion
  const handleComplete = useCallback((assignment: CourseAssignment) => {
    updateData({ enrollmentResult: assignment });
    setFormState(prev => ({
      ...prev,
      currentStep: 'confirmation',
    }));
    onComplete?.(assignment);
  }, [updateData, onComplete]);

  // Handle close
  const handleClose = useCallback(() => {
    if (formState.isSubmitting) return;
    onClose?.();
  }, [onClose, formState.isSubmitting]);

  // Render current step
  const renderCurrentStep = () => {
    const stepProps = {
      data: formState.data,
      onUpdate: updateData,
      onNext: goToNext,
      onPrevious: goToPrevious,
      onValidationChange: updateValidation,
      isLoading: formState.isLoading,
      error: formState.error,
    };

    switch (formState.currentStep) {
      case 'person-selection':
        return <PersonSelectionStep {...stepProps} />;
      case 'course-selection':
        return <CourseSelectionStep {...stepProps} />;
      case 'facility-selection':
        return <FacilitySelectionStep {...stepProps} />;
      case 'review-payment':
        return <ReviewPaymentStep {...stepProps} onComplete={handleComplete} />;
      case 'confirmation':
        return <ConfirmationStep {...stepProps} onClose={handleClose} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
      className
    )}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Course Enrollment
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Complete the enrollment process in {STEPS.length} easy steps
              </p>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={formState.isSubmitting}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6 px-2">
            {STEPS.map((step, index) => {
              const isActive = step.key === formState.currentStep;
              const isCompleted = index < currentStepIndex;
              const hasError = formState.validation[step.key]?.errors.length > 0;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex flex-col items-center cursor-pointer transition-all",
                    isActive && "text-primary",
                    isCompleted && "text-green-600",
                    hasError && "text-destructive"
                  )}
                  onClick={() => goToStep(step.key)}
                >
                  <div className={cn(
                    "flex items-center justify-center mb-2",
                    isActive && "scale-110",
                    isCompleted && "text-green-600"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : hasError ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      isActive && "font-semibold"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Error display */}
          {formState.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          {/* Current step validation errors */}
          {formState.validation[formState.currentStep]?.errors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {formState.validation[formState.currentStep].errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Step content */}
          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>

          {/* Navigation buttons */}
          {formState.currentStep !== 'confirmation' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={!canGoPrevious || formState.isSubmitting}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentStepIndex < STEPS.length - 2 && (
                  <Button
                    onClick={goToNext}
                    disabled={!canGoNext || formState.isSubmitting}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EnrollmentWizard;