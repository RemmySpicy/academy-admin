'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, UserPlus, Building2, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';

// Import reusable components
import { FormField } from '@/components/ui/forms';
import { PersonSearchAndSelect } from '@/components/ui/forms/PersonSearchAndSelect';

// Types
interface SponsorshipFormData {
  student_selection: {
    mode: 'existing' | 'new';
    existing_student_id?: string;
    new_student?: {
      full_name: string;
      date_of_birth: string;
      email?: string;
      phone?: string;
      address?: string;
      emergency_contact?: string;
    };
  };
  sponsorship_details: {
    sponsorship_type: 'full' | 'partial';
    coverage_percentage?: number;
    monthly_amount?: number;
    start_date: string;
    end_date?: string;
  };
  enrollment_details: {
    course_id: string;
    level: string;
    preferred_schedule?: string;
    special_requirements?: string;
  };
}

// Mock data
const mockPartnerInfo = {
  id: '1',
  name: 'Lagos Swimming Club',
  monthly_budget: 400000,
  remaining_budget: 80000,
  current_students: 32,
  max_students: 50
};

const mockCourses = [
  { value: '1', label: 'Swimming - Beginner' },
  { value: '2', label: 'Swimming - Intermediate' },
  { value: '3', label: 'Swimming - Advanced' },
  { value: '4', label: 'Swimming - Competitive' }
];

const mockLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'competitive', label: 'Competitive' }
];

export default function NewSponsoredStudentPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;
  
  usePageTitle('Add Sponsored Student', `Add a new student sponsored by ${mockPartnerInfo.name}`);
  
  const { currentProgram } = useProgramContext();
  
  // Form data
  const [formData, setFormData] = useState<SponsorshipFormData>({
    student_selection: {
      mode: 'new'
    },
    sponsorship_details: {
      sponsorship_type: 'full',
      coverage_percentage: 100,
      start_date: new Date().toISOString().split('T')[0]
    },
    enrollment_details: {
      course_id: '',
      level: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Handlers
  const handleStudentModeChange = (mode: 'existing' | 'new') => {
    setFormData(prev => ({
      ...prev,
      student_selection: {
        mode,
        existing_student_id: undefined,
        new_student: mode === 'new' ? {
          full_name: '',
          date_of_birth: '',
          email: '',
          phone: '',
          address: '',
          emergency_contact: ''
        } : undefined
      }
    }));
    setSelectedStudent(null);
  };

  const handleNewStudentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      student_selection: {
        ...prev.student_selection,
        new_student: {
          ...prev.student_selection.new_student!,
          [field]: value
        }
      }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSponsorshipDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sponsorship_details: {
        ...prev.sponsorship_details,
        [field]: value
      }
    }));
  };

  const handleEnrollmentDetailsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      enrollment_details: {
        ...prev.enrollment_details,
        [field]: value
      }
    }));
  };

  const handleSelectedStudentChange = (students: any[]) => {
    const student = students[0];
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      student_selection: {
        ...prev.student_selection,
        existing_student_id: student?.id
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Student selection validation
    if (formData.student_selection.mode === 'existing' && !formData.student_selection.existing_student_id) {
      newErrors.existing_student = 'Please select a student';
    }

    if (formData.student_selection.mode === 'new') {
      if (!formData.student_selection.new_student?.full_name?.trim()) {
        newErrors.full_name = 'Student name is required';
      }
      if (!formData.student_selection.new_student?.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required';
      }
    }

    // Sponsorship details validation
    if (formData.sponsorship_details.sponsorship_type === 'partial') {
      if (!formData.sponsorship_details.coverage_percentage || formData.sponsorship_details.coverage_percentage <= 0) {
        newErrors.coverage_percentage = 'Coverage percentage is required for partial sponsorship';
      }
    }

    // Enrollment details validation
    if (!formData.enrollment_details.course_id) {
      newErrors.course_id = 'Course is required';
    }
    if (!formData.enrollment_details.level) {
      newErrors.level = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        partner_id: partnerId,
        program_id: currentProgram?.id
      };

      const response = await fetch('/api/v1/sponsorships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Program-Context': currentProgram?.id || ''
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create sponsored student');
      }

      const result = await response.json();
      
      // Redirect to partner dashboard or student list
      router.push(`/admin/partners/${partnerId}/dashboard`);
      
    } catch (error) {
      console.error('Creation error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create sponsored student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/partners/${partnerId}`);
  };

  const calculateMonthlyCost = () => {
    if (formData.sponsorship_details.sponsorship_type === 'full') {
      return 10000; // Base fee
    } else if (formData.sponsorship_details.coverage_percentage) {
      return Math.round(10000 * (formData.sponsorship_details.coverage_percentage / 100));
    }
    return 0;
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
            <h1 className="text-2xl font-bold text-gray-900">Add Sponsored Student</h1>
            <p className="text-gray-600">Add a new student to be sponsored by {mockPartnerInfo.name}</p>
          </div>
        </div>
      </div>

      {/* Partner Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Partnership Budget Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Students</p>
              <p className="text-lg font-semibold">{mockPartnerInfo.current_students}/{mockPartnerInfo.max_students}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Budget</p>
              <p className="text-lg font-semibold">₦{mockPartnerInfo.monthly_budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Budget</p>
              <p className="text-lg font-semibold text-green-600">₦{mockPartnerInfo.remaining_budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Monthly Cost</p>
              <p className="text-lg font-semibold text-blue-600">₦{calculateMonthlyCost().toLocaleString()}</p>
            </div>
          </div>

          {mockPartnerInfo.remaining_budget < calculateMonthlyCost() && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: The estimated monthly cost exceeds the remaining budget. Please review the sponsorship details.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Student Selection
          </CardTitle>
          <CardDescription>
            Choose an existing student or create a new student profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Mode Toggle */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="existing"
                name="student_mode"
                checked={formData.student_selection.mode === 'existing'}
                onChange={() => handleStudentModeChange('existing')}
                className="text-blue-600"
              />
              <label htmlFor="existing" className="text-sm font-medium">
                Select Existing Student
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="new"
                name="student_mode"
                checked={formData.student_selection.mode === 'new'}
                onChange={() => handleStudentModeChange('new')}
                className="text-blue-600"
              />
              <label htmlFor="new" className="text-sm font-medium">
                Create New Student
              </label>
            </div>
          </div>

          {/* Existing Student Selection */}
          {formData.student_selection.mode === 'existing' && (
            <div>
              <PersonSearchAndSelect
                selectedPersons={selectedStudent ? [selectedStudent] : []}
                onSelectionChange={handleSelectedStudentChange}
                maxSelections={1}
                placeholder="Search for students..."
                roleFilter={['student']}
                label="Select Student"
                required
                error={errors.existing_student}
              />
            </div>
          )}

          {/* New Student Form */}
          {formData.student_selection.mode === 'new' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Full Name"
                type="text"
                value={formData.student_selection.new_student?.full_name || ''}
                onChange={(value) => handleNewStudentChange('full_name', value)}
                placeholder="Enter student's full name"
                required
                error={errors.full_name}
              />
              
              <FormField
                label="Date of Birth"
                type="date"
                value={formData.student_selection.new_student?.date_of_birth || ''}
                onChange={(value) => handleNewStudentChange('date_of_birth', value)}
                required
                error={errors.date_of_birth}
              />
              
              <FormField
                label="Email"
                type="email"
                value={formData.student_selection.new_student?.email || ''}
                onChange={(value) => handleNewStudentChange('email', value)}
                placeholder="student@example.com"
              />
              
              <FormField
                label="Phone Number"
                type="tel"
                value={formData.student_selection.new_student?.phone || ''}
                onChange={(value) => handleNewStudentChange('phone', value)}
                placeholder="+234 xxx xxx xxxx"
              />
              
              <div className="md:col-span-2">
                <FormField
                  label="Address"
                  type="textarea"
                  value={formData.student_selection.new_student?.address || ''}
                  onChange={(value) => handleNewStudentChange('address', value)}
                  placeholder="Student's home address"
                  rows={2}
                />
              </div>
              
              <div className="md:col-span-2">
                <FormField
                  label="Emergency Contact"
                  type="text"
                  value={formData.student_selection.new_student?.emergency_contact || ''}
                  onChange={(value) => handleNewStudentChange('emergency_contact', value)}
                  placeholder="Emergency contact name and phone"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsorship Details */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsorship Details</CardTitle>
          <CardDescription>
            Configure the sponsorship terms and coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Sponsorship Type"
              type="select"
              value={formData.sponsorship_details.sponsorship_type}
              onChange={(value) => handleSponsorshipDetailsChange('sponsorship_type', value)}
              options={[
                { value: 'full', label: 'Full Sponsorship (100%)', description: 'Cover all fees' },
                { value: 'partial', label: 'Partial Sponsorship', description: 'Cover percentage of fees' }
              ]}
              required
            />
            
            {formData.sponsorship_details.sponsorship_type === 'partial' && (
              <FormField
                label="Coverage Percentage"
                type="number"
                value={formData.sponsorship_details.coverage_percentage?.toString() || ''}
                onChange={(value) => handleSponsorshipDetailsChange('coverage_percentage', parseInt(value) || 0)}
                placeholder="50"
                required
                error={errors.coverage_percentage}
                note="Percentage of fees to be covered (1-100%)"
              />
            )}
            
            <FormField
              label="Start Date"
              type="date"
              value={formData.sponsorship_details.start_date}
              onChange={(value) => handleSponsorshipDetailsChange('start_date', value)}
              required
            />
            
            <FormField
              label="End Date (Optional)"
              type="date"
              value={formData.sponsorship_details.end_date || ''}
              onChange={(value) => handleSponsorshipDetailsChange('end_date', value)}
              note="Leave blank for ongoing sponsorship"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
          <CardDescription>
            Course and program enrollment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Course"
              type="select"
              value={formData.enrollment_details.course_id}
              onChange={(value) => handleEnrollmentDetailsChange('course_id', value)}
              options={mockCourses}
              required
              error={errors.course_id}
            />
            
            <FormField
              label="Level"
              type="select"
              value={formData.enrollment_details.level}
              onChange={(value) => handleEnrollmentDetailsChange('level', value)}
              options={mockLevels}
              required
              error={errors.level}
            />
            
            <FormField
              label="Preferred Schedule"
              type="text"
              value={formData.enrollment_details.preferred_schedule || ''}
              onChange={(value) => handleEnrollmentDetailsChange('preferred_schedule', value)}
              placeholder="e.g., Weekday evenings, Weekend mornings"
            />
          </div>
          
          <FormField
            label="Special Requirements"
            type="textarea"
            value={formData.enrollment_details.special_requirements || ''}
            onChange={(value) => handleEnrollmentDetailsChange('special_requirements', value)}
            placeholder="Any special requirements or notes for the student..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>Creating...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Sponsorship
            </>
          )}
        </Button>
      </div>
    </div>
  );
}