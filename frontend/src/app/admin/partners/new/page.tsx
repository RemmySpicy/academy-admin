'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Building2, AlertCircle, CheckCircle, Users, CreditCard } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';

// Import reusable components
import { FormField } from '@/components/ui/forms';

// Types
interface NewPartnerFormData {
  basic_info: {
    name: string;
    organization_type: string;
    description: string;
    website?: string;
    registration_number?: string;
  };
  contact_info: {
    contact_email: string;
    contact_phone?: string;
    contact_person_name: string;
    contact_person_title?: string;
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  partnership_details: {
    is_partner: boolean;
    monthly_budget?: number;
    sponsorship_type: 'full' | 'partial' | 'mixed';
    max_students?: number;
    partnership_start_date?: string;
  };
  additional_info: {
    member_count?: number;
    additional_notes?: string;
  };
}

const ORGANIZATION_TYPES = [
  { value: 'school', label: 'School' },
  { value: 'company', label: 'Company' },
  { value: 'non_profit', label: 'Non-Profit Organization' },
  { value: 'government', label: 'Government Agency' },
  { value: 'religious', label: 'Religious Organization' },
  { value: 'sports_club', label: 'Sports Club' },
  { value: 'community', label: 'Community Organization' },
  { value: 'other', label: 'Other' }
];

const SPONSORSHIP_TYPES = [
  { value: 'full', label: 'Full Sponsorship', description: 'Cover all fees for sponsored students' },
  { value: 'partial', label: 'Partial Sponsorship', description: 'Cover a percentage of fees' },
  { value: 'mixed', label: 'Mixed Sponsorship', description: 'Different levels for different students' }
];

export default function NewPartnerPage() {
  usePageTitle('Add New Partner', 'Create a new partner organization');
  
  const router = useRouter();
  const { currentProgram } = useProgramContext();
  
  // Form data
  const [formData, setFormData] = useState<NewPartnerFormData>({
    basic_info: {
      name: '',
      organization_type: '',
      description: '',
      website: '',
      registration_number: ''
    },
    contact_info: {
      contact_email: '',
      contact_phone: '',
      contact_person_name: '',
      contact_person_title: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria'
    },
    partnership_details: {
      is_partner: true,
      monthly_budget: 0,
      sponsorship_type: 'full',
      max_students: 0,
      partnership_start_date: new Date().toISOString().split('T')[0]
    },
    additional_info: {
      member_count: 0,
      additional_notes: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handlers
  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      basic_info: {
        ...prev.basic_info,
        [field]: value
      }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePartnershipDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      partnership_details: {
        ...prev.partnership_details,
        [field]: value
      }
    }));
  };

  const handleAdditionalInfoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      additional_info: {
        ...prev.additional_info,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic info validation
    if (!formData.basic_info.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.basic_info.organization_type) {
      newErrors.organization_type = 'Organization type is required';
    }

    if (!formData.basic_info.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Contact info validation
    if (!formData.contact_info.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_info.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.contact_info.contact_person_name.trim()) {
      newErrors.contact_person_name = 'Contact person name is required';
    }

    // Partnership details validation
    if (formData.partnership_details.is_partner) {
      if (!formData.partnership_details.monthly_budget || formData.partnership_details.monthly_budget <= 0) {
        newErrors.monthly_budget = 'Monthly budget is required for partners';
      }

      if (!formData.partnership_details.max_students || formData.partnership_details.max_students <= 0) {
        newErrors.max_students = 'Maximum students is required for partners';
      }
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
        program_id: currentProgram?.id
      };

      const response = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Program-Context': currentProgram?.id || ''
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create partner organization');
      }

      const result = await response.json();
      
      // Redirect to partner detail page
      router.push(`/admin/partners/${result.data.id}`);
      
    } catch (error) {
      console.error('Creation error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create partner organization' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/partners');
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Partner</h1>
            <p className="text-gray-600">Create a new partner organization for student sponsorships</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential details about the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Organization Name"
              type="text"
              value={formData.basic_info.name}
              onChange={(value) => handleBasicInfoChange('name', value)}
              placeholder="Enter organization name"
              required
              error={errors.name}
            />
            
            <FormField
              label="Organization Type"
              type="select"
              value={formData.basic_info.organization_type}
              onChange={(value) => handleBasicInfoChange('organization_type', value)}
              options={ORGANIZATION_TYPES}
              required
              error={errors.organization_type}
            />
            
            <FormField
              label="Website"
              type="url"
              value={formData.basic_info.website || ''}
              onChange={(value) => handleBasicInfoChange('website', value)}
              placeholder="https://example.com"
            />
            
            <FormField
              label="Registration Number"
              type="text"
              value={formData.basic_info.registration_number || ''}
              onChange={(value) => handleBasicInfoChange('registration_number', value)}
              placeholder="e.g., RC123456"
            />
          </div>
          
          <FormField
            label="Description"
            type="textarea"
            value={formData.basic_info.description}
            onChange={(value) => handleBasicInfoChange('description', value)}
            placeholder="Describe the organization and its mission..."
            rows={3}
            required
            error={errors.description}
          />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Primary contact details for the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Contact Person Name"
              type="text"
              value={formData.contact_info.contact_person_name}
              onChange={(value) => handleContactInfoChange('contact_person_name', value)}
              placeholder="Full name of contact person"
              required
              error={errors.contact_person_name}
            />
            
            <FormField
              label="Contact Person Title"
              type="text"
              value={formData.contact_info.contact_person_title || ''}
              onChange={(value) => handleContactInfoChange('contact_person_title', value)}
              placeholder="e.g., Director, Manager"
            />
            
            <FormField
              label="Contact Email"
              type="email"
              value={formData.contact_info.contact_email}
              onChange={(value) => handleContactInfoChange('contact_email', value)}
              placeholder="contact@organization.com"
              required
              error={errors.contact_email}
            />
            
            <FormField
              label="Contact Phone"
              type="tel"
              value={formData.contact_info.contact_phone || ''}
              onChange={(value) => handleContactInfoChange('contact_phone', value)}
              placeholder="+234 xxx xxx xxxx"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>
            Organization's physical address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                label="Street Address"
                type="text"
                value={formData.address.street || ''}
                onChange={(value) => handleAddressChange('street', value)}
                placeholder="Street address"
              />
            </div>
            
            <FormField
              label="City"
              type="text"
              value={formData.address.city || ''}
              onChange={(value) => handleAddressChange('city', value)}
              placeholder="City"
            />
            
            <FormField
              label="State"
              type="text"
              value={formData.address.state || ''}
              onChange={(value) => handleAddressChange('state', value)}
              placeholder="State"
            />
            
            <FormField
              label="Postal Code"
              type="text"
              value={formData.address.postal_code || ''}
              onChange={(value) => handleAddressChange('postal_code', value)}
              placeholder="Postal code"
            />
            
            <FormField
              label="Country"
              type="text"
              value={formData.address.country}
              onChange={(value) => handleAddressChange('country', value)}
              placeholder="Country"
            />
          </div>
        </CardContent>
      </Card>

      {/* Partnership Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Partnership Configuration
          </CardTitle>
          <CardDescription>
            Configure sponsorship and partnership details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Partner Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Enable Partnership</label>
              <p className="text-xs text-gray-500">
                Allow this organization to sponsor students
              </p>
            </div>
            <Switch
              checked={formData.partnership_details.is_partner}
              onCheckedChange={(checked) => handlePartnershipDetailsChange('is_partner', checked)}
            />
          </div>

          {formData.partnership_details.is_partner && (
            <>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Monthly Budget (NGN)"
                  type="number"
                  value={formData.partnership_details.monthly_budget?.toString() || ''}
                  onChange={(value) => handlePartnershipDetailsChange('monthly_budget', parseInt(value) || 0)}
                  placeholder="0"
                  required
                  error={errors.monthly_budget}
                  note="Total amount allocated per month for sponsorships"
                />
                
                <FormField
                  label="Maximum Students"
                  type="number"
                  value={formData.partnership_details.max_students?.toString() || ''}
                  onChange={(value) => handlePartnershipDetailsChange('max_students', parseInt(value) || 0)}
                  placeholder="0"
                  required
                  error={errors.max_students}
                  note="Maximum number of students to sponsor"
                />
                
                <FormField
                  label="Sponsorship Type"
                  type="select"
                  value={formData.partnership_details.sponsorship_type}
                  onChange={(value) => handlePartnershipDetailsChange('sponsorship_type', value)}
                  options={SPONSORSHIP_TYPES}
                  required
                />
                
                <FormField
                  label="Partnership Start Date"
                  type="date"
                  value={formData.partnership_details.partnership_start_date || ''}
                  onChange={(value) => handlePartnershipDetailsChange('partnership_start_date', value)}
                />
              </div>

              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Partnership settings can be modified later. You can start with basic configuration and refine as needed.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Optional details about the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Total Member Count"
              type="number"
              value={formData.additional_info.member_count?.toString() || ''}
              onChange={(value) => handleAdditionalInfoChange('member_count', parseInt(value) || 0)}
              placeholder="0"
              note="Total number of members in the organization"
            />
          </div>
          
          <FormField
            label="Additional Notes"
            type="textarea"
            value={formData.additional_info.additional_notes || ''}
            onChange={(value) => handleAdditionalInfoChange('additional_notes', value)}
            placeholder="Any additional information about the organization..."
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
              Create Partner
            </>
          )}
        </Button>
      </div>
    </div>
  );
}