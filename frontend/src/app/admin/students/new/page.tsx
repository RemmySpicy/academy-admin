'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  FileText,
  Users,
  UserPlus,
  Baby
} from 'lucide-react';
import { programsApi } from '@/features/programs/api';
import { courseApiService } from '@/features/courses/api/courseApiService';
import { studentApi } from '@/features/students/api/studentApi';
import { isApiSuccess, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/features/authentication/hooks';
import { RELATIONSHIP_OPTIONS } from '@/features/students/types';

type CreationMode = 'student' | 'parent_child';

interface StudentFormData {
  // Student information
  student_username: string;
  student_email: string;
  student_password: string;
  student_salutation: string;
  student_first_name: string;
  student_last_name: string;
  student_phone: string;
  student_date_of_birth: string;
  student_gender: string;
  referral_source: string;
  enrollment_date: string;
  status: string;
  program_id: string;
  course_id: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_info: {
    conditions: string;
    medications: string;
    allergies: string;
  };
  notes: string;
}

interface ParentChildFormData {
  // Parent information
  parent_username: string;
  parent_email: string;
  parent_password: string;
  parent_full_name: string;
  parent_phone: string;
  parent_date_of_birth: string;
  
  // Child information
  child_username: string;
  child_email: string;
  child_password: string;
  child_full_name: string;
  child_phone: string;
  child_date_of_birth: string;
  
  // Relationship
  relationship_type: string;
  
  // Course enrollment
  course_id: string;
  program_id: string;
}

const initialStudentFormData: StudentFormData = {
  student_username: '',
  student_email: '',
  student_password: '',
  student_salutation: '',
  student_first_name: '',
  student_last_name: '',
  student_phone: '',
  student_date_of_birth: '',
  student_gender: '',
  referral_source: '',
  enrollment_date: new Date().toISOString().split('T')[0],
  status: 'active',
  program_id: '',
  course_id: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: 'NG'
  },
  emergency_contact: {
    name: '',
    phone: '',
    relationship: ''
  },
  medical_info: {
    conditions: '',
    medications: '',
    allergies: ''
  },
  notes: ''
};

const initialParentChildFormData: ParentChildFormData = {
  parent_username: '',
  parent_email: '',
  parent_password: '',
  parent_full_name: '',
  parent_phone: '',
  parent_date_of_birth: '',
  child_username: '',
  child_email: '',
  child_password: '',
  child_full_name: '',
  child_phone: '',
  child_date_of_birth: '',
  relationship_type: 'guardian',
  course_id: '',
  program_id: ''
};

export default function NewStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [creationMode, setCreationMode] = useState<CreationMode>('student');
  const [studentFormData, setStudentFormData] = useState<StudentFormData>(initialStudentFormData);
  const [parentChildFormData, setParentChildFormData] = useState<ParentChildFormData>(initialParentChildFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  // Load programs and courses
  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadCourses(selectedProgram);
    }
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      const response = await programsApi.getPrograms();
      setPrograms(response.programs);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const loadCourses = async (programId: string) => {
    try {
      const response = await courseApiService.getCourses({ program_id: programId });
      setCourses(response.items);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleStudentInputChange = (field: string, value: string) => {
    setStudentFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Handle program selection
    if (field === 'program_id') {
      setSelectedProgram(value);
      setStudentFormData(prev => ({ ...prev, course_id: '' })); // Reset course when program changes
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleParentChildInputChange = (field: string, value: string) => {
    setParentChildFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Handle program selection
    if (field === 'program_id') {
      setSelectedProgram(value);
      setParentChildFormData(prev => ({ ...prev, course_id: '' })); // Reset course when program changes
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    if (creationMode === 'student') {
      setStudentFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof StudentFormData],
          [field]: value
        }
      }));
    }
  };

  const validateStudentForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!studentFormData.student_username.trim()) {
      newErrors.student_username = 'Username is required';
    }
    if (!studentFormData.student_first_name.trim()) {
      newErrors.student_first_name = 'First name is required';
    }
    if (!studentFormData.student_last_name.trim()) {
      newErrors.student_last_name = 'Last name is required';
    }
    if (!studentFormData.student_email.trim()) {
      newErrors.student_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentFormData.student_email)) {
      newErrors.student_email = 'Please enter a valid email address';
    }
    if (!studentFormData.student_password.trim()) {
      newErrors.student_password = 'Password is required';
    } else if (studentFormData.student_password.length < 8) {
      newErrors.student_password = 'Password must be at least 8 characters';
    }
    if (!studentFormData.student_date_of_birth) {
      newErrors.student_date_of_birth = 'Date of birth is required';
    }
    if (!studentFormData.program_id) {
      newErrors.program_id = 'Program is required';
    }

    // Phone validation
    if (studentFormData.student_phone && !/^\d{10}$/.test(studentFormData.student_phone.replace(/\D/g, ''))) {
      newErrors.student_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateParentChildForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Parent validation
    if (!parentChildFormData.parent_username.trim()) {
      newErrors.parent_username = 'Parent username is required';
    }
    if (!parentChildFormData.parent_email.trim()) {
      newErrors.parent_email = 'Parent email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentChildFormData.parent_email)) {
      newErrors.parent_email = 'Please enter a valid parent email address';
    }
    if (!parentChildFormData.parent_password.trim()) {
      newErrors.parent_password = 'Parent password is required';
    } else if (parentChildFormData.parent_password.length < 8) {
      newErrors.parent_password = 'Parent password must be at least 8 characters';
    }
    if (!parentChildFormData.parent_full_name.trim()) {
      newErrors.parent_full_name = 'Parent full name is required';
    }

    // Child validation
    if (!parentChildFormData.child_username.trim()) {
      newErrors.child_username = 'Child username is required';
    }
    if (!parentChildFormData.child_email.trim()) {
      newErrors.child_email = 'Child email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentChildFormData.child_email)) {
      newErrors.child_email = 'Please enter a valid child email address';
    }
    if (!parentChildFormData.child_password.trim()) {
      newErrors.child_password = 'Child password is required';
    } else if (parentChildFormData.child_password.length < 8) {
      newErrors.child_password = 'Child password must be at least 8 characters';
    }
    if (!parentChildFormData.child_full_name.trim()) {
      newErrors.child_full_name = 'Child full name is required';
    }
    if (!parentChildFormData.child_date_of_birth) {
      newErrors.child_date_of_birth = 'Child date of birth is required';
    }
    if (!parentChildFormData.program_id) {
      newErrors.program_id = 'Program is required';
    }
    if (!parentChildFormData.relationship_type) {
      newErrors.relationship_type = 'Relationship type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = creationMode === 'student' ? validateStudentForm() : validateParentChildForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (creationMode === 'student') {
        // Create single student
        const response = await studentApi.create({
          first_name: studentFormData.student_first_name,
          last_name: studentFormData.student_last_name,
          email: studentFormData.student_email,
          phone: studentFormData.student_phone,
          date_of_birth: studentFormData.student_date_of_birth,
          gender: studentFormData.student_gender,
          salutation: studentFormData.student_salutation,
          program_id: studentFormData.program_id,
          referral_source: studentFormData.referral_source,
          enrollment_date: studentFormData.enrollment_date,
          status: studentFormData.status,
          address: studentFormData.address,
          emergency_contact: studentFormData.emergency_contact,
          medical_info: studentFormData.medical_info,
          notes: studentFormData.notes
        });
        
        if (isApiSuccess(response)) {
          router.push(`/admin/students/${response.data.id}`);
        } else {
          throw new Error(getApiErrorMessage(response));
        }
      } else {
        // Create parent-child profile
        const response = await fetch('/api/v1/users/student-parent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify(parentChildFormData)
        });
        
        if (response.ok) {
          const result = await response.json();
          router.push('/admin/students');
        } else {
          const error = await response.json();
          throw new Error(error.detail || 'Failed to create parent-child profile');
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      // Handle error - show toast or error message
      alert(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ 
    label, 
    field, 
    type = 'text', 
    required = false, 
    section = null,
    mode = null
  }: {
    label: string;
    field: string;
    type?: string;
    required?: boolean;
    section?: string | null;
    mode?: 'student' | 'parent_child' | null;
  }) => {
    const currentMode = mode || creationMode;
    const formData = currentMode === 'student' ? studentFormData : parentChildFormData;
    
    const value = section 
      ? (formData[section as keyof (StudentFormData | ParentChildFormData)] as any)[field]
      : formData[field as keyof (StudentFormData | ParentChildFormData)];
    
    const error = errors[section ? `${section}.${field}` : field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => {
            if (section) {
              handleNestedInputChange(section, field, e.target.value);
            } else {
              if (currentMode === 'student') {
                handleStudentInputChange(field, e.target.value);
              } else {
                handleParentChildInputChange(field, e.target.value);
              }
            }
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  const SelectField = ({ 
    label, 
    field, 
    options, 
    required = false, 
    section = null,
    mode = null
  }: {
    label: string;
    field: string;
    options: { value: string; label: string }[];
    required?: boolean;
    section?: string | null;
    mode?: 'student' | 'parent_child' | null;
  }) => {
    const currentMode = mode || creationMode;
    const formData = currentMode === 'student' ? studentFormData : parentChildFormData;
    
    const value = section 
      ? (formData[section as keyof (StudentFormData | ParentChildFormData)] as any)[field]
      : formData[field as keyof (StudentFormData | ParentChildFormData)];
    
    const error = errors[section ? `${section}.${field}` : field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => {
            if (section) {
              handleNestedInputChange(section, field, e.target.value);
            } else {
              if (currentMode === 'student') {
                handleStudentInputChange(field, e.target.value);
              } else {
                handleParentChildInputChange(field, e.target.value);
              }
            }
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  const TextareaField = ({ 
    label, 
    field, 
    required = false, 
    section = null,
    mode = null
  }: {
    label: string;
    field: string;
    required?: boolean;
    section?: string | null;
    mode?: 'student' | 'parent_child' | null;
  }) => {
    const currentMode = mode || creationMode;
    const formData = currentMode === 'student' ? studentFormData : parentChildFormData;
    
    const value = section 
      ? (formData[section as keyof (StudentFormData | ParentChildFormData)] as any)[field]
      : formData[field as keyof (StudentFormData | ParentChildFormData)];
    
    const error = errors[section ? `${section}.${field}` : field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={value || ''}
          onChange={(e) => {
            if (section) {
              handleNestedInputChange(section, field, e.target.value);
            } else {
              if (currentMode === 'student') {
                handleStudentInputChange(field, e.target.value);
              } else {
                handleParentChildInputChange(field, e.target.value);
              }
            }
          }}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {creationMode === 'student' ? 'Add New Student' : 'Add Parent & Child'}
            </h1>
            <p className="text-gray-600">
              {creationMode === 'student' 
                ? 'Create a new student profile' 
                : 'Create parent account with associated child'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Creation Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Creation Mode
          </CardTitle>
          <CardDescription>
            Choose how you want to create the student profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCreationMode('student')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                creationMode === 'student'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-semibold">Student Only</h3>
              </div>
              <p className="text-sm text-gray-600">
                Create a single student profile. Parent information can be added later.
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setCreationMode('parent_child')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                creationMode === 'parent_child'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <Baby className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="font-semibold">Parent & Child</h3>
              </div>
              <p className="text-sm text-gray-600">
                Create both parent and child accounts with family relationship.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {creationMode === 'student' ? (
          // Single Student Form
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="contact">Contact & Address</TabsTrigger>
              <TabsTrigger value="enrollment">Program & Enrollment</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
              <TabsTrigger value="medical">Medical Info</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Student Information
                  </CardTitle>
                  <CardDescription>
                    Basic student details and account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Username"
                      field="student_username"
                      required
                    />
                    <InputField
                      label="Email"
                      field="student_email"
                      type="email"
                      required
                    />
                  </div>
                  
                  <InputField
                    label="Password"
                    field="student_password"
                    type="password"
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField
                      label="Salutation"
                      field="student_salutation"
                      options={[
                        { value: 'Mr', label: 'Mr' },
                        { value: 'Mrs', label: 'Mrs' },
                        { value: 'Ms', label: 'Ms' },
                        { value: 'Dr', label: 'Dr' },
                        { value: 'Prof', label: 'Prof' }
                      ]}
                    />
                    <InputField
                      label="First Name"
                      field="student_first_name"
                      required
                    />
                    <InputField
                      label="Last Name"
                      field="student_last_name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="Date of Birth"
                      field="student_date_of_birth"
                      type="date"
                      required
                    />
                    <SelectField
                      label="Gender"
                      field="student_gender"
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                      ]}
                    />
                    <InputField
                      label="Phone"
                      field="student_phone"
                      type="tel"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact & Address Tab */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address Information
                  </CardTitle>
                  <CardDescription>
                    Student address and location details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    label="Address Line 1"
                    field="line1"
                    section="address"
                  />
                  <InputField
                    label="Address Line 2"
                    field="line2"
                    section="address"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="City"
                      field="city"
                      section="address"
                    />
                    <InputField
                      label="State"
                      field="state"
                      section="address"
                    />
                    <InputField
                      label="Postal Code"
                      field="postal_code"
                      section="address"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Program & Enrollment Tab */}
            <TabsContent value="enrollment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Program & Enrollment
                  </CardTitle>
                  <CardDescription>
                    Program selection and enrollment details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Program"
                      field="program_id"
                      options={programs.map(program => ({
                        value: program.id,
                        label: program.name
                      }))}
                      required
                    />
                    <SelectField
                      label="Course"
                      field="course_id"
                      options={courses.map(course => ({
                        value: course.id,
                        label: course.name
                      }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Enrollment Date"
                      field="enrollment_date"
                      type="date"
                      required
                    />
                    <SelectField
                      label="Status"
                      field="status"
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'suspended', label: 'Suspended' }
                      ]}
                      required
                    />
                  </div>
                  
                  <InputField
                    label="Referral Source"
                    field="referral_source"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Contact Tab */}
            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>
                    Emergency contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    label="Contact Name"
                    field="name"
                    section="emergency_contact"
                  />
                  <InputField
                    label="Contact Phone"
                    field="phone"
                    type="tel"
                    section="emergency_contact"
                  />
                  <SelectField
                    label="Relationship"
                    field="relationship"
                    section="emergency_contact"
                    options={RELATIONSHIP_OPTIONS}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Info Tab */}
            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Medical Information
                  </CardTitle>
                  <CardDescription>
                    Medical conditions, medications, and allergies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TextareaField
                    label="Medical Conditions"
                    field="conditions"
                    section="medical_info"
                  />
                  <TextareaField
                    label="Current Medications"
                    field="medications"
                    section="medical_info"
                  />
                  <TextareaField
                    label="Allergies"
                    field="allergies"
                    section="medical_info"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Info Tab */}
            <TabsContent value="additional">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Additional Information
                  </CardTitle>
                  <CardDescription>
                    Additional notes and observations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TextareaField
                    label="Notes"
                    field="notes"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Parent-Child Form
          <div className="space-y-6">
            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Parent Information
                </CardTitle>
                <CardDescription>
                  Parent account details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Parent Username"
                    field="parent_username"
                    mode="parent_child"
                    required
                  />
                  <InputField
                    label="Parent Email"
                    field="parent_email"
                    type="email"
                    mode="parent_child"
                    required
                  />
                </div>
                
                <InputField
                  label="Parent Password"
                  field="parent_password"
                  type="password"
                  mode="parent_child"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Parent Full Name"
                    field="parent_full_name"
                    mode="parent_child"
                    required
                  />
                  <InputField
                    label="Parent Phone"
                    field="parent_phone"
                    type="tel"
                    mode="parent_child"
                  />
                  <InputField
                    label="Parent Date of Birth"
                    field="parent_date_of_birth"
                    type="date"
                    mode="parent_child"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Child Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Baby className="h-5 w-5 mr-2" />
                  Child Information
                </CardTitle>
                <CardDescription>
                  Child account details and enrollment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Child Username"
                    field="child_username"
                    mode="parent_child"
                    required
                  />
                  <InputField
                    label="Child Email"
                    field="child_email"
                    type="email"
                    mode="parent_child"
                    required
                  />
                </div>
                
                <InputField
                  label="Child Password"
                  field="child_password"
                  type="password"
                  mode="parent_child"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Child Full Name"
                    field="child_full_name"
                    mode="parent_child"
                    required
                  />
                  <InputField
                    label="Child Phone"
                    field="child_phone"
                    type="tel"
                    mode="parent_child"
                  />
                  <InputField
                    label="Child Date of Birth"
                    field="child_date_of_birth"
                    type="date"
                    mode="parent_child"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Relationship & Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Relationship & Enrollment
                </CardTitle>
                <CardDescription>
                  Family relationship and course enrollment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  label="Relationship Type"
                  field="relationship_type"
                  mode="parent_child"
                  options={RELATIONSHIP_OPTIONS}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Program"
                    field="program_id"
                    mode="parent_child"
                    options={programs.map(program => ({
                      value: program.id,
                      label: program.name
                    }))}
                    required
                  />
                  <SelectField
                    label="Course (Optional)"
                    field="course_id"
                    mode="parent_child"
                    options={courses.map(course => ({
                      value: course.id,
                      label: course.name
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/students">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting 
              ? 'Creating...' 
              : creationMode === 'student'
                ? 'Create Student'
                : 'Create Parent & Child'
            }
          </Button>
        </div>
      </form>
    </div>
  );
}