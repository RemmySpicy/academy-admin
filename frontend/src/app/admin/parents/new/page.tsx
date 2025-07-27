'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Users, Building2, AlertCircle, CheckCircle, Baby } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

// Import reusable components
import { PersonSearchAndSelect, OrganizationSelector, FormField } from '@/components/ui/forms';
import { useProgramContext } from '@/hooks/useProgramContext';

// Types
interface ParentData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
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
  organization_membership?: OrganizationMembership;
  create_children_accounts: boolean;
}

type OrganizationMode = 'individual' | 'organization';

export default function NewParentPage() {
  usePageTitle('Create Parent', 'Add a new parent to the program');
  
  const router = useRouter();
  const { currentProgram } = useProgramContext();
  
  // Toggle states
  const [organizationMode, setOrganizationMode] = useState<OrganizationMode>('individual');
  
  // Form data
  const [formData, setFormData] = useState<CreateParentFormData>({
    parent: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      occupation: '',
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

  const handleOrganizationSelect = useCallback((organization: any) => {
    setSelectedOrganization(organization);
    setFormData(prev => ({
      ...prev,
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
      return rest;
    });
  }, []);

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

    if (!formData.parent.password || formData.parent.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Organization validation (if organization mode)
    if (organizationMode === 'organization' && !selectedOrganization) {
      newErrors.organization_id = 'Please select an organization';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        creation_mode: formData.child_relationships.length > 0 ? 'parent_with_children' : 'independent_parent',
        organization_mode: organizationMode,
        profile_data: {
          parent: formData.parent,
          ...(formData.child_relationships.length > 0 && {
            child_relationships: formData.child_relationships.map(rel => ({
              child_id: rel.child_id,
              relationship_type: rel.relationship_type,
              is_primary_contact: rel.is_primary_contact,
              can_pickup: rel.can_pickup,
              emergency_contact: rel.emergency_contact
            }))
          }),
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
      
      // Redirect to students management page or parent detail
      router.push('/admin/students');
      
    } catch (error) {
      console.error('Creation error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create parent' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/students');
  };

  // Determine form state
  const isIndividual = organizationMode === 'individual';
  const isOrganizationMember = organizationMode === 'organization';
  const hasChildren = formData.child_relationships.length > 0;

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
            <h1 className="text-2xl font-bold text-gray-900">Create Parent</h1>
            <p className="text-gray-600">Add a new parent to the program</p>
          </div>
        </div>
      </div>

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
                  <label className="text-sm font-medium">Membership Type</label>
                  <Badge variant={isIndividual ? "outline" : "default"}>
                    {isIndividual ? "Individual" : "Organization Member"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isIndividual 
                    ? "Parent pays individually for their children" 
                    : "Parent is part of an organization with benefits"}
                </p>
              </div>
              <Switch
                checked={isOrganizationMember}
                onCheckedChange={(checked) => {
                  setOrganizationMode(checked ? 'organization' : 'individual');
                  if (!checked) {
                    handleOrganizationRemove();
                  }
                }}
              />
            </div>
            
            {isOrganizationMember && (
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Select an organization this parent will be a member of for group benefits and payment coordination.
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
                  {formData.child_relationships.length} child{formData.child_relationships.length !== 1 ? 'ren' : ''} will be linked to this parent
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

      {/* Children Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Baby className="h-5 w-5 mr-2" />
            Children Assignment
          </CardTitle>
          <CardDescription>
            Link existing children to this parent (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          {/* Relationship Details for Each Child */}
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
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              type="text"
              value={formData.parent.first_name}
              onChange={(value) => handleParentDataChange('first_name', value)}
              placeholder="Enter parent's first name"
              required
              error={errors.first_name}
            />
            
            <FormField
              label="Last Name"
              type="text"
              value={formData.parent.last_name}
              onChange={(value) => handleParentDataChange('last_name', value)}
              placeholder="Enter parent's last name"
              required
              error={errors.last_name}
            />
            
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
          
          <FormField
            label="Occupation"
            type="text"
            value={formData.parent.occupation || ''}
            onChange={(value) => handleParentDataChange('occupation', value)}
            placeholder="Parent's occupation"
          />
          
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
              Create Parent
            </>
          )}
        </Button>
      </div>
    </div>
  );
}