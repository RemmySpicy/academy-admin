'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, Building2, AlertCircle, CheckCircle, Baby, UserPlus } from 'lucide-react';

// Import reusable components
import { PersonSearchAndSelect, OrganizationSelector, SimpleFormField as FormField } from '@/components/ui/forms';
import { useProgramContext } from '@/hooks/useProgramContext';

// Types
interface ParentData {
  first_name: string;
  last_name: string;
  salutation?: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  referral_source?: string;
  password?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  additional_notes?: string;
}

interface ChildRelationship {
  child_id: string;
  child: any; // Child user object
  relationship_type: 'father' | 'mother' | 'guardian' | 'stepfather' | 'stepmother' | 'grandparent' | 'other';
  is_primary_contact: boolean;
  can_pickup: boolean;
  emergency_contact: boolean;
}

interface NewChildData {
  id: string; // Temporary ID for tracking
  first_name: string;
  last_name: string;
  salutation?: string;
  date_of_birth?: string;
  email?: string;
  password?: string;
  phone?: string;
  relationship_type: 'father' | 'mother' | 'guardian' | 'stepfather' | 'stepmother' | 'grandparent' | 'other';
  is_primary_contact: boolean;
  can_pickup: boolean;
  emergency_contact: boolean;
}

interface OrganizationMembership {
  organization_id: string;
  membership_type: 'parent_member' | 'organization_admin';
  payment_responsibility?: {
    covers_children?: boolean;
    payment_override?: any;
  };
}

interface CreateParentFormData {
  parent: ParentData;
  child_relationships: ChildRelationship[];
  new_children: NewChildData[];
  organization_membership?: OrganizationMembership;
  create_children_accounts: boolean;
}

type OrganizationMode = 'individual' | 'organization';

interface ParentCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ParentCreateForm({ onSuccess, onCancel }: ParentCreateFormProps) {
  const { currentProgram } = useProgramContext();
  
  // Toggle states
  const [organizationMode, setOrganizationMode] = useState<OrganizationMode>('individual');
  const [activeChildrenTab, setActiveChildrenTab] = useState<'existing' | 'new'>('existing');
  
  // Form data
  const [formData, setFormData] = useState<CreateParentFormData>({
    parent: {
      first_name: '',
      last_name: '',
      salutation: '',
      email: '',
      phone: '',
      date_of_birth: '',
      referral_source: '',
      password: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Nigeria'
      },
      additional_notes: ''
    },
    child_relationships: [],
    new_children: [],
    create_children_accounts: false
  });
  
  // UI state
  const [selectedChildren, setSelectedChildren] = useState<any[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handlers
  const handleParentDataChange = (field: string, value: string) => {
    if (field.includes('.')) {
      // Handle nested fields like address.street
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        parent: {
          ...prev.parent,
          [parent]: {
            ...((prev.parent as any)[parent] || {}),
            [child]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        parent: {
          ...prev.parent,
          [field]: value
        }
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleChildSelect = useCallback((child: any) => {
    if (selectedChildren.find(c => c.id === child.id)) {
      return; // Already selected
    }

    const newChild = {
      child_id: child.id,
      child: child,
      relationship_type: 'father' as const, // Default, user can change
      is_primary_contact: selectedChildren.length === 0, // First child becomes primary
      can_pickup: true,
      emergency_contact: selectedChildren.length === 0
    };

    setSelectedChildren(prev => [...prev, child]);
    setFormData(prev => ({
      ...prev,
      child_relationships: [...prev.child_relationships, newChild]
    }));
  }, [selectedChildren]);

  const handleChildRemove = useCallback((childId: string) => {
    setSelectedChildren(prev => prev.filter(c => c.id !== childId));
    setFormData(prev => ({
      ...prev,
      child_relationships: prev.child_relationships.filter(r => r.child_id !== childId)
    }));
  }, []);

  const handleRelationshipUpdate = (childId: string, field: keyof ChildRelationship, value: any) => {
    setFormData(prev => ({
      ...prev,
      child_relationships: prev.child_relationships.map(rel =>
        rel.child_id === childId ? { ...rel, [field]: value } : rel
      )
    }));
  };

  // New children handlers
  const addNewChild = () => {
    const newChild: NewChildData = {
      id: `new_${Date.now()}`, // Temporary ID
      first_name: '',
      last_name: '',
      salutation: '',
      date_of_birth: '',
      email: '',
      password: '',
      phone: '',
      relationship_type: 'father',
      is_primary_contact: formData.new_children.length === 0 && formData.child_relationships.length === 0, // First child becomes primary
      can_pickup: true,
      emergency_contact: formData.new_children.length === 0 && formData.child_relationships.length === 0
    };

    setFormData(prev => ({
      ...prev,
      new_children: [...prev.new_children, newChild]
    }));
  };

  const removeNewChild = (childId: string) => {
    setFormData(prev => ({
      ...prev,
      new_children: prev.new_children.filter(child => child.id !== childId)
    }));
  };

  const updateNewChild = (childId: string, field: keyof NewChildData, value: any) => {
    setFormData(prev => ({
      ...prev,
      new_children: prev.new_children.map(child =>
        child.id === childId ? { ...child, [field]: value } : child
      )
    }));

    // Auto-fill referral source for new children
    if (field === 'first_name' || field === 'last_name') {
      const child = formData.new_children.find(c => c.id === childId);
      if (child) {
        const referralSource = selectedOrganization?.name || 
                             `${formData.parent.first_name} ${formData.parent.last_name}`.trim() ||
                             'Parent referral';
        // This will be set when the child is actually created
      }
    }
  };

  const handleOrganizationSelect = useCallback((organization: any) => {
    setSelectedOrganization(organization);
    setFormData(prev => ({
      ...prev,
      // Auto-fill referral source with organization name
      parent: {
        ...prev.parent,
        referral_source: prev.parent.referral_source || organization.name
      },
      organization_membership: {
        organization_id: organization.id,
        membership_type: 'parent_member',
        payment_responsibility: {
          covers_children: true // Default to covering children
        }
      }
    }));
    setErrors(prev => ({ ...prev, organization_id: '' }));
  }, []);

  const handleOrganizationRemove = useCallback(() => {
    setSelectedOrganization(null);
    setFormData(prev => {
      const { organization_membership, ...rest } = prev;
      return {
        ...rest,
        // Clear referral source if it was auto-filled with organization name
        parent: {
          ...rest.parent,
          referral_source: prev.parent.referral_source === selectedOrganization?.name ? '' : prev.parent.referral_source
        }
      };
    });
  }, [selectedOrganization]);

  const searchChildren = async (query: string) => {
    // Search for existing student profiles that could be children
    try {
      const response = await fetch(`/api/v1/students/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}&without_parents=true`, {
        headers: {
          'X-Program-Context': currentProgram?.id || ''
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Children search error:', error);
      return [];
    }
  };

  const searchOrganizations = async (query: string) => {
    try {
      const response = await fetch(`/api/v1/organizations/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}`, {
        headers: {
          'X-Program-Context': currentProgram?.id || ''
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Organization search error:', error);
      return [];
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Parent validation
    if (!formData.parent.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.parent.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.parent.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.parent.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.parent.date_of_birth || !formData.parent.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    if (!formData.parent.password || formData.parent.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Organization validation (if organization mode)
    if (organizationMode === 'organization' && !selectedOrganization) {
      newErrors.organization_id = 'Please select an organization';
    }

    // New children validation
    formData.new_children.forEach((child, index) => {
      if (!child.first_name.trim()) {
        newErrors[`new_child_${index}_first_name`] = `Child ${index + 1} first name is required`;
      }
      if (!child.last_name.trim()) {
        newErrors[`new_child_${index}_last_name`] = `Child ${index + 1} last name is required`;
      }
      if (!child.date_of_birth || !child.date_of_birth.trim()) {
        newErrors[`new_child_${index}_date_of_birth`] = `Child ${index + 1} date of birth is required`;
      }
      // Email validation (optional for children)
      if (child.email && child.email.trim() && !/\S+@\S+\.\S+/.test(child.email)) {
        newErrors[`new_child_${index}_email`] = `Child ${index + 1} email format is invalid`;
      }
      
      // Password validation (optional, but if provided should meet minimum requirements)
      if (child.password && child.password.length < 6) {
        newErrors[`new_child_${index}_password`] = `Child ${index + 1} password must be at least 6 characters`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const hasChildren = formData.child_relationships.length > 0 || formData.new_children.length > 0;
      const submissionData = {
        creation_mode: hasChildren ? 'parent_with_children' : 'independent_parent',
        organization_mode: organizationMode,
        profile_data: {
          parent: formData.parent,
          // Existing child relationships
          ...(formData.child_relationships.length > 0 && {
            child_relationships: formData.child_relationships.map(rel => ({
              child_id: rel.child_id,
              relationship_type: rel.relationship_type,
              is_primary_contact: rel.is_primary_contact,
              can_pickup: rel.can_pickup,
              emergency_contact: rel.emergency_contact
            }))
          }),
          // New children to create
          ...(formData.new_children.length > 0 && {
            new_children: formData.new_children.map(child => ({
              student: {
                first_name: child.first_name,
                last_name: child.last_name,
                salutation: child.salutation,
                date_of_birth: child.date_of_birth,
                email: child.email,
                phone: child.phone,
                // Auto-fill referral source
                referral_source: selectedOrganization?.name || 
                               `${formData.parent.first_name} ${formData.parent.last_name}`.trim() ||
                               'Parent referral',
                // Auto-fill emergency contact from parent
                emergency_contact_name: `${formData.parent.first_name} ${formData.parent.last_name}`.trim(),
                emergency_contact_phone: formData.parent.phone
              },
              relationship: {
                relationship_type: child.relationship_type,
                is_primary_contact: child.is_primary_contact,
                can_pickup: child.can_pickup,
                emergency_contact: child.emergency_contact
              },
              create_login_credentials: !!(child.email && child.password),
              // Inherit organization membership if parent has one
              ...(organizationMode === 'organization' && formData.organization_membership && {
                organization_membership: {
                  organization_id: formData.organization_membership.organization_id,
                  payment_override: {
                    full_sponsorship: true // Default for organization children
                  }
                }
              })
            }))
          }),
          // Parent organization membership
          ...(organizationMode === 'organization' && formData.organization_membership && {
            organization_id: formData.organization_membership.organization_id,
            membership_type: formData.organization_membership.membership_type,
            payment_responsibility: formData.organization_membership.payment_responsibility
          })
        },
        program_id: currentProgram?.id
      };

      const response = await fetch('/api/v1/profiles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Program-Context': currentProgram?.id || ''
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create parent');
      }

      const result = await response.json();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Creation error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create parent' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine form state
  const isIndividual = organizationMode === 'individual';
  const isOrganizationMember = organizationMode === 'organization';
  const hasChildren = formData.child_relationships.length > 0 || formData.new_children.length > 0;
  const totalChildren = formData.child_relationships.length + formData.new_children.length;

  return (
    <div className="space-y-6">
      {/* Creation Mode Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Parent Creation Options
          </CardTitle>
          <CardDescription>
            Configure how you want to create this parent profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Individual vs Organization Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Organization Membership</label>
                  <Badge variant={isIndividual ? "outline" : "default"}>
                    {isIndividual ? "Individual Parent" : "Organization Member"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isIndividual 
                    ? "Regular parent registration with standard payment options" 
                    : "Parent associated with a partner organization (configurations, sponsorship, etc.)"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${isIndividual ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Individual
                </span>
                <Switch
                  checked={isOrganizationMember}
                  onCheckedChange={(checked) => {
                    setOrganizationMode(checked ? 'organization' : 'individual');
                    if (!checked) {
                      handleOrganizationRemove();
                    }
                  }}
                />
                <span className={`text-sm ${isOrganizationMember ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Organization
                </span>
              </div>
            </div>
            
            {isOrganizationMember && (
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Organization members inherit settings from their partner organization and may receive sponsorship benefits.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {hasChildren && (
            <>
              <Separator />
              <div className="flex items-center space-x-2">
                <Baby className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {totalChildren} child{totalChildren !== 1 ? 'ren' : ''} will be linked to this parent
                  {formData.child_relationships.length > 0 && formData.new_children.length > 0 && (
                    <span className="text-gray-500 ml-1">
                      ({formData.child_relationships.length} existing, {formData.new_children.length} new)
                    </span>
                  )}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Organization Selection (conditional) */}
      {isOrganizationMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organization Membership
            </CardTitle>
            <CardDescription>
              Select the organization this parent will belong to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationSelector
              searchLabel="Select Organization"
              placeholder="Search for organizations..."
              selectedOrganization={selectedOrganization}
              onOrganizationSelect={handleOrganizationSelect}
              onOrganizationRemove={handleOrganizationRemove}
              onSearchFunction={searchOrganizations}
              required
              error={errors.organization_id}
            />
            
            {selectedOrganization && formData.organization_membership && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium">Membership Details</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.organization_membership.payment_responsibility?.covers_children || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        organization_membership: prev.organization_membership ? {
                          ...prev.organization_membership,
                          payment_responsibility: {
                            ...prev.organization_membership.payment_responsibility,
                            covers_children: e.target.checked
                          }
                        } : undefined
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span>Organization covers children's fees</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parent Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Parent Information
          </CardTitle>
          <CardDescription>
            Basic information and login credentials for the parent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Salutation"
              type="select"
              value={formData.parent.salutation || ''}
              onChange={(value) => handleParentDataChange('salutation', value)}
              placeholder="Select salutation"
              options={[
                { value: 'Mr.', label: 'Mr.' },
                { value: 'Mrs.', label: 'Mrs.' },
                { value: 'Ms.', label: 'Ms.' },
                { value: 'Dr.', label: 'Dr.' },
                { value: 'Prof.', label: 'Prof.' },
                { value: 'Chief', label: 'Chief' },
                { value: 'Hon.', label: 'Hon.' }
              ]}
              note="Helps us know how to address the parent properly"
            />
            
            <FormField
              label="First Name"
              type="text"
              value={formData.parent.first_name}
              onChange={(value) => handleParentDataChange('first_name', value)}
              placeholder="Enter first name"
              required
              error={errors.first_name}
            />
            
            <FormField
              label="Last Name"
              type="text"
              value={formData.parent.last_name}
              onChange={(value) => handleParentDataChange('last_name', value)}
              placeholder="Enter last name"
              required
              error={errors.last_name}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Email"
              type="email"
              value={formData.parent.email}
              onChange={(value) => handleParentDataChange('email', value)}
              placeholder="parent@example.com"
              required
              error={errors.email}
              note="Used for login and communications"
            />
            
            <FormField
              label="Phone"
              type="tel"
              value={formData.parent.phone || ''}
              onChange={(value) => handleParentDataChange('phone', value)}
              placeholder="+234 xxx xxx xxxx"
            />
            
            <FormField
              label="Date of Birth"
              type="date"
              value={formData.parent.date_of_birth || ''}
              onChange={(value) => handleParentDataChange('date_of_birth', value)}
              placeholder="Select date of birth"
              required
              error={errors.date_of_birth}
            />
            
            <FormField
              label="Referral (Friend, Social Media, Website, Organization)"
              type="text"
              value={formData.parent.referral_source || ''}
              onChange={(value) => handleParentDataChange('referral_source', value)}
              placeholder={selectedOrganization ? selectedOrganization.name : "e.g., Friend referral, Social media, Website"}
              note={selectedOrganization ? `Auto-filled: ${selectedOrganization.name}` : "How did you hear about us?"}
            />
            
            <FormField
              label="Password"
              type="password"
              value={formData.parent.password || ''}
              onChange={(value) => handleParentDataChange('password', value)}
              placeholder="Enter secure password"
              required
              error={errors.password}
              note="Minimum 6 characters"
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Street Address"
                type="text"
                value={formData.parent.address?.street || ''}
                onChange={(value) => handleParentDataChange('address.street', value)}
                placeholder="Street address"
              />
              
              <FormField
                label="City"
                type="text"
                value={formData.parent.address?.city || ''}
                onChange={(value) => handleParentDataChange('address.city', value)}
                placeholder="City"
              />
              
              <FormField
                label="State"
                type="text"
                value={formData.parent.address?.state || ''}
                onChange={(value) => handleParentDataChange('address.state', value)}
                placeholder="State"
              />
              
              <FormField
                label="Postal Code"
                type="text"
                value={formData.parent.address?.postal_code || ''}
                onChange={(value) => handleParentDataChange('address.postal_code', value)}
                placeholder="Postal code"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Emergency Contact Name"
                type="text"
                value={formData.parent.emergency_contact_name || ''}
                onChange={(value) => handleParentDataChange('emergency_contact_name', value)}
                placeholder="Emergency contact person"
              />
              
              <FormField
                label="Emergency Contact Phone"
                type="tel"
                value={formData.parent.emergency_contact_phone || ''}
                onChange={(value) => handleParentDataChange('emergency_contact_phone', value)}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>
          
          <FormField
            label="Additional Notes"
            type="textarea"
            value={formData.parent.additional_notes || ''}
            onChange={(value) => handleParentDataChange('additional_notes', value)}
            placeholder="Any other relevant information..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Children Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Baby className="h-5 w-5 mr-2" />
            Children Management
          </CardTitle>
          <CardDescription>
            Link existing children or create new children for this parent (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeChildrenTab} onValueChange={(value: any) => setActiveChildrenTab(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Link Existing Students</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create New Children</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              <PersonSearchAndSelect
                searchLabel="Add Children"
                placeholder="Search for children by name, email, or phone..."
                selectedPersons={selectedChildren}
                onPersonSelect={handleChildSelect}
                onPersonRemove={handleChildRemove}
                onSearchFunction={searchChildren}
                allowMultiple={true}
                filterRoles={['student']}
              />
              
              {/* Relationship Details for Each Existing Child */}
              {formData.child_relationships.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium">Relationship Details</h4>
                  {formData.child_relationships.map((relationship, index) => (
                    <Card key={relationship.child_id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">{relationship.child.first_name} {relationship.child.last_name}</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChildRemove(relationship.child_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Relationship Type"
                            type="select"
                            value={relationship.relationship_type}
                            onChange={(value) => handleRelationshipUpdate(relationship.child_id, 'relationship_type', value)}
                            options={[
                              { value: 'father', label: 'Father' },
                              { value: 'mother', label: 'Mother' },
                              { value: 'guardian', label: 'Guardian' },
                              { value: 'stepfather', label: 'Stepfather' },
                              { value: 'stepmother', label: 'Stepmother' },
                              { value: 'grandparent', label: 'Grandparent' },
                              { value: 'other', label: 'Other' }
                            ]}
                            required
                          />
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <label className="text-sm font-medium">Permissions</label>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={relationship.is_primary_contact}
                                onChange={(e) => handleRelationshipUpdate(relationship.child_id, 'is_primary_contact', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span>Primary Contact</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={relationship.can_pickup}
                                onChange={(e) => handleRelationshipUpdate(relationship.child_id, 'can_pickup', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span>Can Pick Up Child</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={relationship.emergency_contact}
                                onChange={(e) => handleRelationshipUpdate(relationship.child_id, 'emergency_contact', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span>Emergency Contact</span>
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Create New Children</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Add new children that will be automatically linked to this parent
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addNewChild}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Child</span>
                </Button>
              </div>

              {formData.new_children.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Baby className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No new children added yet</p>
                  <p className="text-xs">Click "Add Child" to create a new child profile</p>
                </div>
              )}

              {/* New Children Forms */}
              {formData.new_children.map((child, index) => (
                <Card key={child.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">
                        New Child {index + 1}
                        {child.first_name && child.last_name && (
                          <span className="text-gray-500 font-normal ml-2">
                            ({child.first_name} {child.last_name})
                          </span>
                        )}
                      </h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewChild(child.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          label="Salutation"
                          type="select"
                          value={child.salutation || ''}
                          onChange={(value) => updateNewChild(child.id, 'salutation', value)}
                          placeholder="Select salutation"
                          options={[
                            { value: 'Master', label: 'Master' },
                            { value: 'Miss', label: 'Miss' }
                          ]}
                        />
                        
                        <FormField
                          label="First Name"
                          type="text"
                          value={child.first_name}
                          onChange={(value) => updateNewChild(child.id, 'first_name', value)}
                          placeholder="Enter first name"
                          required
                          error={errors[`new_child_${index}_first_name`]}
                        />
                        
                        <FormField
                          label="Last Name"
                          type="text"
                          value={child.last_name}
                          onChange={(value) => updateNewChild(child.id, 'last_name', value)}
                          placeholder="Enter last name"
                          required
                          error={errors[`new_child_${index}_last_name`]}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Date of Birth"
                          type="date"
                          value={child.date_of_birth || ''}
                          onChange={(value) => updateNewChild(child.id, 'date_of_birth', value)}
                          required
                          error={errors[`new_child_${index}_date_of_birth`]}
                        />

                        <FormField
                          label="Relationship Type"
                          type="select"
                          value={child.relationship_type}
                          onChange={(value) => updateNewChild(child.id, 'relationship_type', value)}
                          options={[
                            { value: 'father', label: 'Father' },
                            { value: 'mother', label: 'Mother' },
                            { value: 'guardian', label: 'Guardian' },
                            { value: 'stepfather', label: 'Stepfather' },
                            { value: 'stepmother', label: 'Stepmother' },
                            { value: 'grandparent', label: 'Grandparent' },
                            { value: 'other', label: 'Other' }
                          ]}
                          required
                        />
                      </div>

                      {/* Optional Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Email (Optional)"
                          type="email"
                          value={child.email || ''}
                          onChange={(value) => updateNewChild(child.id, 'email', value)}
                          placeholder="child@example.com"
                          note="Optional - provide if child needs account access"
                          error={errors[`new_child_${index}_email`]}
                        />
                        
                        <FormField
                          label="Password (Optional)"
                          type="password"
                          value={child.password || ''}
                          onChange={(value) => updateNewChild(child.id, 'password', value)}
                          placeholder="Enter password"
                          note="Optional - required only if email is provided (min 6 characters)"
                          error={errors[`new_child_${index}_password`]}
                        />
                        
                        <FormField
                          label="Phone (Optional)"
                          type="tel"
                          value={child.phone || ''}
                          onChange={(value) => updateNewChild(child.id, 'phone', value)}
                          placeholder="+234 xxx xxx xxxx"
                        />
                      </div>

                      {/* Permissions */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Parent Permissions & Settings</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={child.is_primary_contact}
                                onChange={(e) => updateNewChild(child.id, 'is_primary_contact', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span>Primary Contact</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={child.can_pickup}
                                onChange={(e) => updateNewChild(child.id, 'can_pickup', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span>Can Pick Up Child</span>
                            </label>
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={child.emergency_contact}
                                onChange={(e) => updateNewChild(child.id, 'emergency_contact', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span>Emergency Contact</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Auto-fill Notice */}
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Auto-filled:</strong> Emergency contact, referral source 
                          {selectedOrganization && ` (${selectedOrganization.name})`}
                          {organizationMode === 'organization' && ', organization membership'}
                          {' '}will be inherited from parent information.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
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
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
              Create Parent
            </>
          )}
        </Button>
      </div>
    </div>
  );
}