'use client';

/**
 * Unified Parent Form Component
 * Handles both create and edit modes with comprehensive tabbed interface
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, Phone, MessageSquare, CreditCard, Settings, Plus } from 'lucide-react';
import Link from 'next/link';

// Import shared form components
import { FormField, AddressForm, EmergencyContactForm, TabContainer, TabPanel } from '@/components/ui/forms';
import type { AddressData, EmergencyContactData } from '@/components/ui/forms';

// Import parent types and hooks
import {
  Parent,
  ParentFormData,
  COMMUNICATION_TIME_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  RELATIONSHIP_OPTIONS
} from '../types';
import { useCreateParent, useUpdateParent } from '../hooks/useParents';

interface ParentFormProps {
  mode: 'create' | 'edit';
  parent?: Parent;
  onSuccess?: (parent: Parent) => void;
  onCancel?: () => void;
}

// Initial form data
const getInitialFormData = (parent?: Parent): ParentFormData => ({
  username: parent?.username || '',
  email: parent?.email || '',
  password: '', // Only used in create mode
  first_name: parent?.full_name?.split(' ')[0] || '',
  last_name: parent?.full_name?.split(' ').slice(1).join(' ') || '',
  full_name: parent?.full_name || '',
  phone: parent?.phone || '',
  date_of_birth: parent?.date_of_birth ? parent.date_of_birth.split('T')[0] : '',
  profile_photo_url: parent?.profile_photo_url || '',
  
  emergency_contact: {
    name: '',
    phone: '',
    relationship: '',
    email: '',
  },
  
  communication_preferences: {
    email: true,
    sms: true,
    phone: true,
    preferred_time: 'any',
    newsletter: true,
    progress_reports: true,
    event_notifications: true,
  },
  
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'NG',
  },
  
  financial_info: {
    billing_contact_same: true,
    billing_address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'NG',
    },
    payment_method_type: '',
    auto_pay_enabled: false,
  },
  
  preferences: {
    pickup_authorized: true,
    photo_consent: true,
    marketing_consent: false,
    data_sharing_consent: false,
  },
  
  notes: '',
});

export function ParentForm({ mode, parent, onSuccess, onCancel }: ParentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ParentFormData>(() => getInitialFormData(parent));
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const createParentMutation = useCreateParent();
  const updateParentMutation = useUpdateParent();

  // Compute full name when first/last names change
  useEffect(() => {
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();
    if (fullName !== formData.full_name) {
      setFormData(prev => ({ ...prev, full_name: fullName }));
    }
  }, [formData.first_name, formData.last_name]);

  // Copy address to billing address when checkbox is checked
  useEffect(() => {
    if (formData.financial_info.billing_contact_same) {
      setFormData(prev => ({
        ...prev,
        financial_info: {
          ...prev.financial_info,
          billing_address: { ...prev.address }
        }
      }));
    }
  }, [formData.address, formData.financial_info.billing_contact_same]);

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

  const handleNestedFieldChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ParentFormData] as any,
        [field]: value
      }
    }));
  };

  const handleAddressChange = (address: AddressData) => {
    setFormData(prev => ({ ...prev, address }));
  };

  const handleBillingAddressChange = (billing_address: AddressData) => {
    setFormData(prev => ({
      ...prev,
      financial_info: {
        ...prev.financial_info,
        billing_address
      }
    }));
  };

  const handleEmergencyContactChange = (emergency_contact: EmergencyContactData) => {
    setFormData(prev => ({ ...prev, emergency_contact }));
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
        const createData = {
          username: formData.username,
          email: formData.email,
          password: formData.password!,
          full_name: formData.full_name!,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          roles: ['parent'],
          profile_photo_url: formData.profile_photo_url,
          emergency_contact_name: formData.emergency_contact.name,
          emergency_contact_phone: formData.emergency_contact.phone,
          communication_preferences: formData.communication_preferences,
          address: formData.address,
        };

        const result = await createParentMutation.mutateAsync(createData);
        if (onSuccess && result?.data) {
          onSuccess(result.data);
        } else {
          router.push('/admin/students'); // Navigate back to unified page
        }
      } else {
        const updateData = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name!,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          is_active: true, // We'll get this from the parent object
        };

        const result = await updateParentMutation.mutateAsync({
          parentId: parent!.id,
          data: updateData
        });
        
        if (onSuccess && result) {
          onSuccess(result);
        } else {
          router.push(`/admin/parents/${parent!.id}`);
        }
      }
    } catch (error: any) {
      setErrors({ submit: error.message || `Failed to ${mode} parent` });
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
      completed: !!(formData.first_name && formData.last_name && formData.email)
    },
    {
      id: 'contact',
      label: 'Contact & Address',
      icon: <Phone className="h-4 w-4" />,
      completed: !!(formData.phone || formData.address.line1)
    },
    {
      id: 'children',
      label: 'Children & Relationships',
      icon: <User className="h-4 w-4" />,
      completed: false // This will be managed separately
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: <MessageSquare className="h-4 w-4" />,
      completed: true // Default preferences are already set
    },
    {
      id: 'financial',
      label: 'Financial Info',
      icon: <CreditCard className="h-4 w-4" />,
      completed: !!(formData.financial_info.payment_method_type)
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: <Settings className="h-4 w-4" />,
      completed: true // Default preferences are already set
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
              {mode === 'create' ? 'Add New Parent' : 'Edit Parent'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Create a new parent profile and account' 
                : 'Update parent information and preferences'
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
            description="Basic parent details and account information"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Phone Number"
                  field="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleFieldChange}
                  error={errors.phone}
                  placeholder="Enter phone number"
                />
                <FormField
                  label="Date of Birth"
                  field="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={handleFieldChange}
                  error={errors.date_of_birth}
                />
              </div>
            </div>
          </TabPanel>

          {/* Contact & Address Tab */}
          <TabPanel
            value="contact"
            title="Contact & Address"
            description="Parent address and emergency contact information"
            icon={<Phone className="h-5 w-5" />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Residential Address</h4>
                <AddressForm
                  address={formData.address}
                  onChange={handleAddressChange}
                  errors={errors}
                />
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
                <EmergencyContactForm
                  contact={formData.emergency_contact}
                  onChange={handleEmergencyContactChange}
                  errors={errors}
                />
              </div>
            </div>
          </TabPanel>

          {/* Children & Relationships Tab */}
          <TabPanel
            value="children"
            title="Children & Relationships"
            description="Manage child connections and family relationships"
            icon={<User className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Child Relationships</p>
                <p className="text-sm">
                  {mode === 'create' 
                    ? 'Child relationships can be added after creating the parent profile.'
                    : 'Child relationships will be managed here in a future update.'
                  }
                </p>
              </div>
            </div>
          </TabPanel>

          {/* Communication Tab */}
          <TabPanel
            value="communication"
            title="Communication Preferences"
            description="How this parent prefers to be contacted"
            icon={<MessageSquare className="h-5 w-5" />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Email Notifications"
                    field="email"
                    type="checkbox"
                    value={formData.communication_preferences.email}
                    onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                  />
                  <FormField
                    label="SMS Notifications"
                    field="sms"
                    type="checkbox"
                    value={formData.communication_preferences.sms}
                    onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                  />
                  <FormField
                    label="Phone Calls"
                    field="phone"
                    type="checkbox"
                    value={formData.communication_preferences.phone}
                    onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Newsletter"
                    field="newsletter"
                    type="checkbox"
                    value={formData.communication_preferences.newsletter}
                    onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                  />
                  <FormField
                    label="Progress Reports"
                    field="progress_reports"
                    type="checkbox"
                    value={formData.communication_preferences.progress_reports}
                    onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                  />
                  <FormField
                    label="Event Notifications"
                    field="event_notifications"
                    type="checkbox"
                    value={formData.communication_preferences.event_notifications}
                    onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                  />
                </div>
              </div>

              <FormField
                label="Preferred Contact Time"
                field="preferred_time"
                type="select"
                value={formData.communication_preferences.preferred_time}
                onChange={(field, value) => handleNestedFieldChange('communication_preferences', field, value)}
                options={COMMUNICATION_TIME_OPTIONS}
              />
            </div>
          </TabPanel>

          {/* Financial Information Tab */}
          <TabPanel
            value="financial"
            title="Financial Information"
            description="Billing and payment preferences"
            icon={<CreditCard className="h-5 w-5" />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h4>
                <FormField
                  label="Same as residential address"
                  field="billing_contact_same"
                  type="checkbox"
                  value={formData.financial_info.billing_contact_same}
                  onChange={(field, value) => handleNestedFieldChange('financial_info', field, value)}
                />

                {!formData.financial_info.billing_contact_same && (
                  <div className="mt-4">
                    <AddressForm
                      address={formData.financial_info.billing_address}
                      onChange={handleBillingAddressChange}
                      errors={errors}
                      fieldPrefix="billing_address"
                    />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Preferred Payment Method"
                    field="payment_method_type"
                    type="select"
                    value={formData.financial_info.payment_method_type}
                    onChange={(field, value) => handleNestedFieldChange('financial_info', field, value)}
                    options={PAYMENT_METHOD_OPTIONS}
                  />
                  <FormField
                    label="Enable Auto-Pay"
                    field="auto_pay_enabled"
                    type="checkbox"
                    value={formData.financial_info.auto_pay_enabled}
                    onChange={(field, value) => handleNestedFieldChange('financial_info', field, value)}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel
            value="preferences"
            title="Additional Preferences"
            description="Permissions and consent preferences"
            icon={<Settings className="h-5 w-5" />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
                <div className="space-y-4">
                  <FormField
                    label="Authorized for child pickup"
                    field="pickup_authorized"
                    type="checkbox"
                    value={formData.preferences.pickup_authorized}
                    onChange={(field, value) => handleNestedFieldChange('preferences', field, value)}
                  />
                  <FormField
                    label="Photo and video consent"
                    field="photo_consent"
                    type="checkbox"
                    value={formData.preferences.photo_consent}
                    onChange={(field, value) => handleNestedFieldChange('preferences', field, value)}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Privacy</h4>
                <div className="space-y-4">
                  <FormField
                    label="Marketing communications consent"
                    field="marketing_consent"
                    type="checkbox"
                    value={formData.preferences.marketing_consent}
                    onChange={(field, value) => handleNestedFieldChange('preferences', field, value)}
                  />
                  <FormField
                    label="Data sharing consent"
                    field="data_sharing_consent"
                    type="checkbox"
                    value={formData.preferences.data_sharing_consent}
                    onChange={(field, value) => handleNestedFieldChange('preferences', field, value)}
                  />
                </div>
              </div>

              <FormField
                label="Additional Notes"
                field="notes"
                type="textarea"
                value={formData.notes}
                onChange={handleFieldChange}
                error={errors.notes}
                placeholder="Any additional notes or special requirements"
                rows={4}
              />
            </div>
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
              : `${mode === 'create' ? 'Create Parent' : 'Save Changes'}`
            }
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ParentForm;