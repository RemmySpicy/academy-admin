'use client';

/**
 * Unified Student Form Component
 * Handles both create and edit modes with tabbed interface
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, MapPin, FileText, Phone, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

// Import shared form components
import { FormField, AddressForm, EmergencyContactForm, TabContainer, TabPanel } from '@/components/ui/forms';
import type { AddressData, EmergencyContactData } from '@/components/ui/forms';

// Import student types and hooks
import {
  Student,
  StudentFormData,
  StudentCreate,
  StudentUpdate,
  STUDENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  SALUTATION_OPTIONS,
  RELATIONSHIP_OPTIONS
} from '../types';
import { useCreateStudent, useUpdateStudent } from '../hooks';

// Import other services
import { programsApi } from '@/features/programs/api';
import { courseApiService } from '@/features/courses/api/courseApiService';

interface StudentFormProps {
  mode: 'create' | 'edit';
  student?: Student;
  onSuccess?: (student: Student) => void;
  onCancel?: () => void;
}

// Initial form data
const getInitialFormData = (student?: Student): StudentFormData => ({
  username: student?.email?.split('@')[0] || '',
  email: student?.email || '',
  password: '', // Only used in create mode
  salutation: student?.salutation || '',
  first_name: student?.first_name || '',
  last_name: student?.last_name || '',
  phone: student?.phone || '',
  date_of_birth: student?.date_of_birth ? student.date_of_birth.split('T')[0] : '',
  gender: student?.gender || '',
  program_id: student?.program_id || '',
  course_id: '',
  referral_source: student?.referral_source || '',
  enrollment_date: student?.enrollment_date ? student.enrollment_date.split('T')[0] : new Date().toISOString().split('T')[0],
  status: student?.status || 'active',
  address: {
    line1: student?.address?.line1 || '',
    line2: student?.address?.line2 || '',
    city: student?.address?.city || '',
    state: student?.address?.state || '',
    postal_code: student?.address?.postal_code || '',
    country: student?.address?.country || 'NG',
  },
  emergency_contact: {
    name: student?.emergency_contact_name || '',
    phone: student?.emergency_contact_phone || '',
    relationship: student?.emergency_contact_relationship || '',
    email: '',
  },
  medical_info: {
    conditions: student?.medical_conditions || '',
    medications: student?.medications || '',
    allergies: student?.allergies || '',
  },
  notes: student?.notes || '',
});

export function StudentForm({ mode, student, onSuccess, onCancel }: StudentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentFormData>(() => getInitialFormData(student));
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Hooks
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  // Load programs and courses
  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (formData.program_id) {
      loadCourses(formData.program_id);
    } else {
      setCourses([]);
    }
  }, [formData.program_id]);

  const loadPrograms = async () => {
    try {
      const response = await programsApi.getPrograms();
      setPrograms(response.programs || []);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const loadCourses = async (programId: string) => {
    try {
      const response = await courseApiService.getCourses({ program_id: programId });
      setCourses(response.items || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  // Form handlers
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (address: AddressData) => {
    setFormData(prev => ({ ...prev, address }));
  };

  const handleEmergencyContactChange = (emergency_contact: EmergencyContactData) => {
    setFormData(prev => ({ ...prev, emergency_contact }));
  };

  const handleMedicalInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        [field]: value
      }
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (mode === 'create' && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (mode === 'create' && !formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (mode === 'create' && formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    if (!formData.program_id) {
      newErrors.program_id = 'Program is required';
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const createData: StudentCreate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender as any,
          salutation: formData.salutation as any,
          program_id: formData.program_id,
          referral_source: formData.referral_source,
          enrollment_date: formData.enrollment_date,
          status: formData.status as any,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          medical_info: formData.medical_info,
          notes: formData.notes,
        };

        const result = await createStudentMutation.mutateAsync(createData);
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push(`/admin/students/${result.id}`);
        }
      } else {
        const updateData: StudentUpdate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender as any,
          salutation: formData.salutation as any,
          program_id: formData.program_id,
          referral_source: formData.referral_source,
          enrollment_date: formData.enrollment_date,
          status: formData.status as any,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          medical_info: formData.medical_info,
          notes: formData.notes,
        };

        const result = await updateStudentMutation.mutateAsync({
          id: student!.id,
          studentData: updateData
        });
        
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push(`/admin/students/${student!.id}`);
        }
      }
    } catch (error: any) {
      setErrors({ submit: error.message || `Failed to ${mode} student` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: <User className="h-4 w-4" />,
      required: true,
      completed: !!(formData.first_name && formData.last_name && formData.email && formData.date_of_birth)
    },
    {
      id: 'contact',
      label: 'Contact & Address',
      icon: <MapPin className="h-4 w-4" />,
      completed: !!(formData.phone || formData.address.line1)
    },
    {
      id: 'enrollment',
      label: 'Enrollment',
      icon: <FileText className="h-4 w-4" />,
      required: true,
      completed: !!(formData.program_id)
    },
    {
      id: 'emergency',
      label: 'Emergency Contact',
      icon: <Phone className="h-4 w-4" />,
      completed: !!(formData.emergency_contact.name && formData.emergency_contact.phone)
    },
    {
      id: 'medical',
      label: 'Medical Info',
      icon: <AlertCircle className="h-4 w-4" />,
      completed: !!(formData.medical_info.conditions || formData.medical_info.medications || formData.medical_info.allergies)
    },
    {
      id: 'additional',
      label: 'Additional',
      icon: <Plus className="h-4 w-4" />,
      completed: !!(formData.notes)
    }
  ];

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/students');
    }
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
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Student' : 'Edit Student'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Create a new student profile' 
                : 'Update student information'
              }
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TabContainer
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showProgress={true}
        >
          {/* Personal Information Tab */}
          <TabPanel
            value="personal"
            title="Personal Information"
            description="Basic student details and account information"
            icon={<User className="h-5 w-5" />}
          >
            <div className="space-y-4">
              {mode === 'create' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Username"
                    field="username"
                    value={formData.username}
                    onChange={handleFieldChange}
                    error={errors.username}
                    required
                    placeholder="Enter username"
                  />
                  <FormField
                    label="Password"
                    field="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleFieldChange}
                    error={errors.password}
                    required
                    placeholder="Enter password"
                  />
                </div>
              )}

              <FormField
                label="Email"
                field="email"
                type="email"
                value={formData.email}
                onChange={handleFieldChange}
                error={errors.email}
                required
                placeholder="Enter email address"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Salutation"
                  field="salutation"
                  type="select"
                  value={formData.salutation}
                  onChange={handleFieldChange}
                  error={errors.salutation}
                  options={SALUTATION_OPTIONS}
                />
                <FormField
                  label="First Name"
                  field="first_name"
                  value={formData.first_name}
                  onChange={handleFieldChange}
                  error={errors.first_name}
                  required
                  placeholder="Enter first name"
                />
                <FormField
                  label="Last Name"
                  field="last_name"
                  value={formData.last_name}
                  onChange={handleFieldChange}
                  error={errors.last_name}
                  required
                  placeholder="Enter last name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Date of Birth"
                  field="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleFieldChange}
                  error={errors.date_of_birth}
                  required
                />
                <FormField
                  label="Gender"
                  field="gender"
                  type="select"
                  value={formData.gender}
                  onChange={handleFieldChange}
                  error={errors.gender}
                  options={GENDER_OPTIONS}
                />
                <FormField
                  label="Phone"
                  field="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFieldChange}
                  error={errors.phone}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </TabPanel>

          {/* Contact & Address Tab */}
          <TabPanel
            value="contact"
            title="Contact & Address"
            description="Student address and location details"
            icon={<MapPin className="h-5 w-5" />}
          >
            <AddressForm
              address={formData.address}
              onChange={handleAddressChange}
              errors={errors}
            />
          </TabPanel>

          {/* Enrollment Tab */}
          <TabPanel
            value="enrollment"
            title="Program & Enrollment"
            description="Program selection and enrollment details"
            icon={<FileText className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Program"
                  field="program_id"
                  type="select"
                  value={formData.program_id}
                  onChange={handleFieldChange}
                  error={errors.program_id}
                  options={programs.map(program => ({
                    value: program.id,
                    label: program.name
                  }))}
                  required
                />
                <FormField
                  label="Course"
                  field="course_id"
                  type="select"
                  value={formData.course_id}
                  onChange={handleFieldChange}
                  error={errors.course_id}
                  options={courses.map(course => ({
                    value: course.id,
                    label: course.name
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Enrollment Date"
                  field="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={handleFieldChange}
                  error={errors.enrollment_date}
                  required
                />
                <FormField
                  label="Status"
                  field="status"
                  type="select"
                  value={formData.status}
                  onChange={handleFieldChange}
                  error={errors.status}
                  options={STUDENT_STATUS_OPTIONS}
                  required
                />
              </div>

              <FormField
                label="Referral Source"
                field="referral_source"
                value={formData.referral_source}
                onChange={handleFieldChange}
                error={errors.referral_source}
                placeholder="How did you hear about us?"
              />
            </div>
          </TabPanel>

          {/* Emergency Contact Tab */}
          <TabPanel
            value="emergency"
            title="Emergency Contact"
            description="Emergency contact information"
            icon={<Phone className="h-5 w-5" />}
          >
            <EmergencyContactForm
              contact={formData.emergency_contact}
              onChange={handleEmergencyContactChange}
              errors={errors}
            />
          </TabPanel>

          {/* Medical Info Tab */}
          <TabPanel
            value="medical"
            title="Medical Information"
            description="Medical conditions, medications, and allergies"
            icon={<AlertCircle className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <FormField
                label="Medical Conditions"
                field="conditions"
                type="textarea"
                value={formData.medical_info.conditions}
                onChange={(field, value) => handleMedicalInfoChange(field, value)}
                error={errors['medical_info.conditions']}
                placeholder="List any medical conditions"
              />
              <FormField
                label="Current Medications"
                field="medications"
                type="textarea"
                value={formData.medical_info.medications}
                onChange={(field, value) => handleMedicalInfoChange(field, value)}
                error={errors['medical_info.medications']}
                placeholder="List current medications"
              />
              <FormField
                label="Allergies"
                field="allergies"
                type="textarea"
                value={formData.medical_info.allergies}
                onChange={(field, value) => handleMedicalInfoChange(field, value)}
                error={errors['medical_info.allergies']}
                placeholder="List any allergies"
              />
            </div>
          </TabPanel>

          {/* Additional Info Tab */}
          <TabPanel
            value="additional"
            title="Additional Information"
            description="Additional notes and observations"
            icon={<Plus className="h-5 w-5" />}
          >
            <FormField
              label="Notes"
              field="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleFieldChange}
              error={errors.notes}
              placeholder="Additional notes or special requirements"
              rows={5}
            />
          </TabPanel>
        </TabContainer>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting 
              ? `${mode === 'create' ? 'Creating' : 'Saving'}...` 
              : `${mode === 'create' ? 'Create Student' : 'Save Changes'}`
            }
          </Button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;