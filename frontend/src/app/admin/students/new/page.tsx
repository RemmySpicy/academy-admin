'use client';

import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

interface StudentFormData {
  salutation: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  referral_source: string;
  enrollment_date: string;
  status: string;
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

const initialFormData: StudentFormData = {
  salutation: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  referral_source: '',
  enrollment_date: new Date().toISOString().split('T')[0],
  status: 'active',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
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

export default function NewStudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof StudentFormData],
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
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
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    if (!formData.enrollment_date) {
      newErrors.enrollment_date = 'Enrollment date is required';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would call your API to create the student
      console.log('Creating student:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to student detail page or list
      router.push('/admin/students');
    } catch (error) {
      console.error('Error creating student:', error);
      // Handle error - show toast or error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ 
    label, 
    field, 
    type = 'text', 
    required = false, 
    section = null 
  }: {
    label: string;
    field: string;
    type?: string;
    required?: boolean;
    section?: string | null;
  }) => {
    const value = section 
      ? (formData[section as keyof StudentFormData] as any)[field]
      : formData[field as keyof StudentFormData];
    
    const error = errors[section ? `${section}.${field}` : field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => 
            section 
              ? handleNestedInputChange(section, field, e.target.value)
              : handleInputChange(field, e.target.value)
          }
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
    section = null 
  }: {
    label: string;
    field: string;
    options: { value: string; label: string }[];
    required?: boolean;
    section?: string | null;
  }) => {
    const value = section 
      ? (formData[section as keyof StudentFormData] as any)[field]
      : formData[field as keyof StudentFormData];
    
    const error = errors[section ? `${section}.${field}` : field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => 
            section 
              ? handleNestedInputChange(section, field, e.target.value)
              : handleInputChange(field, e.target.value)
          }
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
    section = null 
  }: {
    label: string;
    field: string;
    required?: boolean;
    section?: string | null;
  }) => {
    const value = section 
      ? (formData[section as keyof StudentFormData] as any)[field]
      : formData[field as keyof StudentFormData];
    
    const error = errors[section ? `${section}.${field}` : field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => 
            section 
              ? handleNestedInputChange(section, field, e.target.value)
              : handleInputChange(field, e.target.value)
          }
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
            <p className="text-gray-600">Create a new student profile</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Address</TabsTrigger>
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
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic personal details and enrollment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField
                    label="Salutation"
                    field="salutation"
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
                    field="first_name"
                    required
                  />
                  <InputField
                    label="Last Name"
                    field="last_name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Date of Birth"
                    field="date_of_birth"
                    type="date"
                    required
                  />
                  <SelectField
                    label="Gender"
                    field="gender"
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                    ]}
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

          {/* Contact & Address Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact & Address Information
                </CardTitle>
                <CardDescription>
                  Contact details and address information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    field="email"
                    type="email"
                    required
                  />
                  <InputField
                    label="Phone"
                    field="phone"
                    type="tel"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
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
                  <SelectField
                    label="Country"
                    field="country"
                    section="address"
                    options={[
                      { value: 'US', label: 'United States' },
                      { value: 'CA', label: 'Canada' },
                      { value: 'UK', label: 'United Kingdom' },
                      { value: 'AU', label: 'Australia' }
                    ]}
                  />
                </div>
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
                  options={[
                    { value: 'Mother', label: 'Mother' },
                    { value: 'Father', label: 'Father' },
                    { value: 'Guardian', label: 'Guardian' },
                    { value: 'Sibling', label: 'Sibling' },
                    { value: 'Grandparent', label: 'Grandparent' },
                    { value: 'Other', label: 'Other' }
                  ]}
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

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/students">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}