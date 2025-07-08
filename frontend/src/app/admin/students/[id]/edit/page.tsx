'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

// Mock data - this will be replaced with real API calls
const mockStudent = {
  id: '1',
  student_id: 'STU-2025-0001',
  salutation: 'Mr',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  date_of_birth: '2010-05-15',
  gender: 'male',
  status: 'active',
  enrollment_date: '2025-01-01',
  referral_source: 'Website',
  address: {
    line1: '123 Main St',
    line2: 'Apt 4B',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'US'
  },
  emergency_contact: {
    name: 'Jane Doe',
    phone: '555-987-6543',
    relationship: 'Mother'
  },
  medical_info: {
    conditions: 'None',
    medications: 'None',
    allergies: 'Peanuts'
  },
  notes: 'Great student with strong motivation'
};

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

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<StudentFormData>(mockStudent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Simulate loading student data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
      // Here you would call your API to update the student
      console.log('Updating student:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to student detail page
      router.push(`/admin/students/${params.id}`);
    } catch (error) {
      console.error('Error updating student:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading student...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/students/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Student: {formData.first_name} {formData.last_name}
            </h1>
            <p className="text-gray-600">Update student information</p>
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
            <Link href={`/admin/students/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}