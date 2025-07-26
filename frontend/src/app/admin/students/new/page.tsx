'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Users, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

// Import reusable components
import { PersonSearchAndSelect, OrganizationSelector, FormField } from '@/components/ui/forms';
import { useProgramContext } from '@/hooks/useProgramContext';

// Types
interface StudentData {
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  additional_notes?: string;
}

interface ParentRelationship {
  parent_id: string;
  relationship_type: 'father' | 'mother' | 'guardian' | 'stepfather' | 'stepmother' | 'grandparent' | 'other';
  is_primary_contact: boolean;
  can_pickup: boolean;
  emergency_contact: boolean;
}

interface OrganizationSponsorship {
  organization_id: string;
  payment_override?: {
    full_sponsorship?: boolean;
    partial_sponsorship?: number;
    discount_percentage?: number;
  };
}

interface CreateStudentFormData {
  student: StudentData;
  parent_relationship?: ParentRelationship;
  organization_sponsorship?: OrganizationSponsorship;
  create_login_credentials: boolean;
}

type CreationMode = 'independent' | 'with_parent';
type OrganizationMode = 'individual' | 'organization';

export default function NewStudentPage() {
  usePageTitle('Create Student', 'Add a new student to the program');
  
  const router = useRouter();
  const { currentProgram } = useProgramContext();
  
  // Toggle states
  const [creationMode, setCreationMode] = useState<CreationMode>('independent');
  const [organizationMode, setOrganizationMode] = useState<OrganizationMode>('individual');
  
  // Form data
  const [formData, setFormData] = useState<CreateStudentFormData>({
    student: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_notes: '',
      additional_notes: ''
    },
    create_login_credentials: false
  });
  
  // UI state
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handlers
  const handleStudentDataChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleParentSelect = useCallback((parent: any) => {
    setSelectedParent(parent);
    setFormData(prev => ({
      ...prev,
      parent_relationship: {
        parent_id: parent.id,
        relationship_type: 'father', // Default, user can change
        is_primary_contact: true,
        can_pickup: true,
        emergency_contact: true
      }
    }));
    setErrors(prev => ({ ...prev, parent_id: '' }));
  }, []);

  const handleParentRemove = useCallback(() => {
    setSelectedParent(null);
    setFormData(prev => {
      const { parent_relationship, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleOrganizationSelect = useCallback((organization: any) => {
    setSelectedOrganization(organization);
    setFormData(prev => ({
      ...prev,
      organization_sponsorship: {
        organization_id: organization.id,
        payment_override: {
          full_sponsorship: true // Default to full sponsorship
        }
      }
    }));
    setErrors(prev => ({ ...prev, organization_id: '' }));
  }, []);

  const handleOrganizationRemove = useCallback(() => {
    setSelectedOrganization(null);
    setFormData(prev => {
      const { organization_sponsorship, ...rest } = prev;
      return rest;
    });
  }, []);

  const searchParents = async (query: string) => {
    // Implement API call to search parents
    // This would use the existing parent search endpoint
    try {
      const response = await fetch(`/api/v1/parents/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}`, {
        headers: {
          'X-Program-Context': currentProgram?.id || ''
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Parent search error:', error);
      return [];
    }
  };

  const searchOrganizations = async (query: string) => {
    // Implement API call to search partner organizations
    try {
      const response = await fetch(`/api/v1/organizations/search?q=${encodeURIComponent(query)}&program_id=${currentProgram?.id}&partners_only=true`, {
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

    // Student validation
    if (!formData.student.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    // Parent validation (if with parent mode)
    if (creationMode === 'with_parent' && !selectedParent) {
      newErrors.parent_id = 'Please select a parent';
    }

    // Organization validation (if organization mode)
    if (organizationMode === 'organization' && !selectedOrganization) {
      newErrors.organization_id = 'Please select an organization';
    }

    // Login credentials validation
    if (formData.create_login_credentials && !formData.student.email) {
      newErrors.email = 'Email is required for login credentials';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare submission data based on toggles
      const submissionData = {
        creation_mode: creationMode === 'independent' ? 'independent_student' : 'student_with_parent',
        organization_mode: organizationMode,
        profile_data: {
          student: formData.student,
          create_login_credentials: formData.create_login_credentials,
          ...(creationMode === 'with_parent' && formData.parent_relationship && {
            parent_id: formData.parent_relationship.parent_id,
            relationship: {
              relationship_type: formData.parent_relationship.relationship_type,
              is_primary_contact: formData.parent_relationship.is_primary_contact,
              can_pickup: formData.parent_relationship.can_pickup,
              emergency_contact: formData.parent_relationship.emergency_contact
            }
          }),
          ...(organizationMode === 'organization' && formData.organization_sponsorship && {
            organization_id: formData.organization_sponsorship.organization_id,
            payment_override: formData.organization_sponsorship.payment_override
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
        throw new Error(error.message || 'Failed to create student');
      }

      const result = await response.json();
      
      // Redirect to student detail page
      router.push(`/admin/students/${result.data.student.id}`);
      
    } catch (error) {
      console.error('Creation error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/students');
  };

  // Determine form state for display
  const isIndependent = creationMode === 'independent';
  const isWithParent = creationMode === 'with_parent';
  const isIndividual = organizationMode === 'individual';
  const isOrganizationSponsored = organizationMode === 'organization';

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
            <h1 className="text-2xl font-bold text-gray-900">Create Student</h1>
            <p className="text-gray-600">Add a new student to the program</p>
          </div>
        </div>
      </div>

      {/* Creation Mode Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Creation Options
          </CardTitle>
          <CardDescription>
            Configure how you want to create this student profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Independent vs With Parent Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Student Type</label>
                  <Badge variant={isIndependent ? "default" : "secondary"}>
                    {isIndependent ? "Independent" : "With Parent"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isIndependent 
                    ? "Create a standalone student profile" 
                    : "Link student to an existing parent"}
                </p>
              </div>
              <Switch
                checked={isWithParent}
                onCheckedChange={(checked) => {
                  setCreationMode(checked ? 'with_parent' : 'independent');
                  if (!checked) {
                    handleParentRemove();
                  }
                }}
              />
            </div>
            
            {isWithParent && (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  You'll need to select an existing parent to link this student to.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Individual vs Organization Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Payment & Sponsorship</label>
                  <Badge variant={isIndividual ? "outline" : "default"}>
                    {isIndividual ? "Individual" : "Organization Sponsored"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isIndividual 
                    ? "Student pays individually or through parent" 
                    : "Student is sponsored by a partner organization"}
                </p>
              </div>
              <Switch
                checked={isOrganizationSponsored}
                onCheckedChange={(checked) => {
                  setOrganizationMode(checked ? 'organization' : 'individual');
                  if (!checked) {
                    handleOrganizationRemove();
                  }
                }}
              />
            </div>
            
            {isOrganizationSponsored && (
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Select a partner organization that will sponsor this student's tuition and fees.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parent Selection (conditional) */}
      {isWithParent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Parent Selection
            </CardTitle>
            <CardDescription>
              Select the parent this student will be linked to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonSearchAndSelect
              searchLabel="Select Parent"
              placeholder="Search for parent by name, email, or phone..."
              selectedPersons={selectedParent ? [selectedParent] : []}
              onPersonSelect={handleParentSelect}
              onPersonRemove={handleParentRemove}
              onSearchFunction={searchParents}
              allowMultiple={false}
              filterRoles={['parent']}
              required
              error={errors.parent_id}
            />
            
            {selectedParent && formData.parent_relationship && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium">Relationship Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Relationship Type"
                    type="select"
                    value={formData.parent_relationship.relationship_type}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      parent_relationship: prev.parent_relationship ? {
                        ...prev.parent_relationship,
                        relationship_type: value as any
                      } : undefined
                    }))}
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.parent_relationship.is_primary_contact}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parent_relationship: prev.parent_relationship ? {
                            ...prev.parent_relationship,
                            is_primary_contact: e.target.checked
                          } : undefined
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span>Primary Contact</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.parent_relationship.can_pickup}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parent_relationship: prev.parent_relationship ? {
                            ...prev.parent_relationship,
                            can_pickup: e.target.checked
                          } : undefined
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span>Can Pick Up Student</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.parent_relationship.emergency_contact}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parent_relationship: prev.parent_relationship ? {
                            ...prev.parent_relationship,
                            emergency_contact: e.target.checked
                          } : undefined
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span>Emergency Contact</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organization Selection (conditional) */}
      {isOrganizationSponsored && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organization Sponsorship
            </CardTitle>
            <CardDescription>
              Select the partner organization that will sponsor this student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationSelector
              searchLabel="Select Sponsoring Organization"
              placeholder="Search for partner organizations..."
              selectedOrganization={selectedOrganization}
              onOrganizationSelect={handleOrganizationSelect}
              onOrganizationRemove={handleOrganizationRemove}
              onSearchFunction={searchOrganizations}
              partnersOnly={true}
              required
              error={errors.organization_id}
            />
            
            {selectedOrganization && formData.organization_sponsorship && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium">Sponsorship Details</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.organization_sponsorship.payment_override?.full_sponsorship || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        organization_sponsorship: prev.organization_sponsorship ? {
                          ...prev.organization_sponsorship,
                          payment_override: {
                            ...prev.organization_sponsorship.payment_override,
                            full_sponsorship: e.target.checked,
                            ...(e.target.checked && { partial_sponsorship: undefined, discount_percentage: undefined })
                          }
                        } : undefined
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span>Full Sponsorship (Organization pays all fees)</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Information
          </CardTitle>
          <CardDescription>
            Basic information about the student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              type="text"
              value={formData.student.full_name}
              onChange={(value) => handleStudentDataChange('full_name', value)}
              placeholder="Enter student's full name"
              required
              error={errors.full_name}
            />
            
            <FormField
              label="Date of Birth"
              type="date"
              value={formData.student.date_of_birth || ''}
              onChange={(value) => handleStudentDataChange('date_of_birth', value)}
            />
            
            <FormField
              label="Email"
              type="email"
              value={formData.student.email || ''}
              onChange={(value) => handleStudentDataChange('email', value)}
              placeholder="student@example.com"
              error={errors.email}
              note={formData.create_login_credentials ? "Required for login access" : "Optional"}
            />
            
            <FormField
              label="Phone"
              type="tel"
              value={formData.student.phone || ''}
              onChange={(value) => handleStudentDataChange('phone', value)}
              placeholder="+234 xxx xxx xxxx"
            />
          </div>
          
          {/* Login Credentials Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Create Login Credentials</label>
              <p className="text-xs text-gray-500">
                Allow student to access their own dashboard
              </p>
            </div>
            <Switch
              checked={formData.create_login_credentials}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                create_login_credentials: checked
              }))}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Emergency Contact Name"
                type="text"
                value={formData.student.emergency_contact_name || ''}
                onChange={(value) => handleStudentDataChange('emergency_contact_name', value)}
                placeholder="Contact person name"
              />
              
              <FormField
                label="Emergency Contact Phone"
                type="tel"
                value={formData.student.emergency_contact_phone || ''}
                onChange={(value) => handleStudentDataChange('emergency_contact_phone', value)}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <FormField
              label="Medical Notes"
              type="textarea"
              value={formData.student.medical_notes || ''}
              onChange={(value) => handleStudentDataChange('medical_notes', value)}
              placeholder="Any medical conditions, allergies, or special requirements..."
              rows={3}
            />
            
            <FormField
              label="Additional Notes"
              type="textarea"
              value={formData.student.additional_notes || ''}
              onChange={(value) => handleStudentDataChange('additional_notes', value)}
              placeholder="Any other relevant information..."
              rows={2}
            />
          </div>
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
              Create Student
            </>
          )}
        </Button>
      </div>
    </div>
  );
}