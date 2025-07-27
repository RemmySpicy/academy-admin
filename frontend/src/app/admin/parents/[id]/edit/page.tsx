'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Users, Building2, AlertCircle, CheckCircle, History, Settings, Baby } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';

// Import reusable components
import { PersonSearchAndSelect, OrganizationSelector, RelationshipManager, FormField } from '@/components/ui/forms';

// Hooks for data fetching
import { useParent } from '@/features/parents/hooks/useParents';

// Types
interface ParentEditFormData {
  basic_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    occupation?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    additional_notes?: string;
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  account_settings: {
    profile_type: 'full_user';
    password?: string;
    roles: string[];
  };
  relationships: any[];
  organization_memberships: any[];
}

export default function EditParentPage() {
  const params = useParams();
  const router = useRouter();
  const parentId = params.id as string;
  const { currentProgram } = useProgramContext();

  const { data: parentResponse, isLoading: parentLoading, error: parentError } = useParent(parentId);
  const parent = parentResponse?.data;
  
  // State
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ParentEditFormData>({
    basic_info: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      occupation: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      additional_notes: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria'
    },
    account_settings: {
      profile_type: 'full_user',
      roles: ['parent']
    },
    relationships: [],
    organization_memberships: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  usePageTitle(
    parent ? `Edit ${parent.first_name} ${parent.last_name}` : 'Edit Parent',
    'Update parent information and relationships'
  );

  // Initialize form data when parent loads
  React.useEffect(() => {
    if (parent) {
      setFormData({
        basic_info: {
          first_name: parent.first_name || '',
          last_name: parent.last_name || '',
          email: parent.email || '',
          phone: parent.phone || '',
          occupation: parent.occupation || '',
          emergency_contact_name: parent.emergency_contact_name || '',
          emergency_contact_phone: parent.emergency_contact_phone || '',
          additional_notes: parent.additional_notes || ''
        },
        address: {
          street: parent.address?.street || '',
          city: parent.address?.city || '',
          state: parent.address?.state || '',
          postal_code: parent.address?.postal_code || '',
          country: parent.address?.country || 'Nigeria'
        },
        account_settings: {
          profile_type: 'full_user',
          roles: parent.roles || ['parent']
        },
        relationships: parent.child_relationships || [],
        organization_memberships: parent.organization_memberships || []
      });
    }
  }, [parent]);

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

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleAccountSettingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      account_settings: {
        ...prev.account_settings,
        [field]: value
      }
    }));
  };

  const searchChildren = async (query: string) => {
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

  const handleRelationshipAdd = useCallback((relationship: any) => {
    setFormData(prev => ({
      ...prev,
      relationships: [...prev.relationships, relationship]
    }));
  }, []);

  const handleRelationshipUpdate = useCallback((relationshipId: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.map(rel =>
        rel.id === relationshipId ? { ...rel, ...updates } : rel
      )
    }));
  }, []);

  const handleRelationshipRemove = useCallback((relationshipId: string) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.filter(rel => rel.id !== relationshipId)
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic info validation
    if (!formData.basic_info.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.basic_info.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.basic_info.email.trim()) {
      newErrors.email = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const updateData = {
        basic_info: formData.basic_info,
        address: formData.address,
        account_settings: formData.account_settings,
        relationships: formData.relationships,
        organization_memberships: formData.organization_memberships
      };

      const response = await fetch(`/api/v1/parents/${parentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Program-Context': currentProgram?.id || ''
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update parent');
      }

      router.push(`/admin/parents/${parentId}`);
      
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update parent' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/parents/${parentId}`);
  };

  if (parentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading parent details...</span>
      </div>
    );
  }

  if (parentError || !parent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading parent</div>
          <div className="text-gray-600 mb-4">Failed to load parent details</div>
          <Button onClick={() => router.push('/admin/students')}>Back to Management</Button>
        </div>
      </div>
    );
  }

  const hasChildren = formData.relationships.length > 0;
  const hasOrganizations = formData.organization_memberships.length > 0;

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
              Edit {parent.first_name} {parent.last_name}
            </h1>
            <p className="text-gray-600">Update parent information and relationships</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="default">
            Full Account
          </Badge>
          {hasChildren && (
            <Badge variant="outline" className="text-green-700 border-green-200">
              {formData.relationships.length} Child{formData.relationships.length !== 1 ? 'ren' : ''}
            </Badge>
          )}
          {hasOrganizations && (
            <Badge variant="outline">
              Organization Member
            </Badge>
          )}
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="children" className="flex items-center">
            <Baby className="h-4 w-4 mr-2" />
            Children
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Parent's personal information and contact details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  type="text"
                  value={formData.basic_info.first_name}
                  onChange={(value) => handleBasicInfoChange('first_name', value)}
                  placeholder="Enter parent's first name"
                  required
                  error={errors.first_name}
                />
                
                <FormField
                  label="Last Name"
                  type="text"
                  value={formData.basic_info.last_name}
                  onChange={(value) => handleBasicInfoChange('last_name', value)}
                  placeholder="Enter parent's last name"
                  required
                  error={errors.last_name}
                />
                
                <FormField
                  label="Email"
                  type="email"
                  value={formData.basic_info.email}
                  onChange={(value) => handleBasicInfoChange('email', value)}
                  placeholder="parent@example.com"
                  required
                  error={errors.email}
                  note="Used for login and communications"
                />
                
                <FormField
                  label="Phone"
                  type="tel"
                  value={formData.basic_info.phone || ''}
                  onChange={(value) => handleBasicInfoChange('phone', value)}
                  placeholder="+234 xxx xxx xxxx"
                />
                
                <FormField
                  label="Occupation"
                  type="text"
                  value={formData.basic_info.occupation || ''}
                  onChange={(value) => handleBasicInfoChange('occupation', value)}
                  placeholder="Parent's occupation"
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Street Address"
                    type="text"
                    value={formData.address.street || ''}
                    onChange={(value) => handleAddressChange('street', value)}
                    placeholder="Street address"
                  />
                  
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
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Emergency Contact Name"
                    type="text"
                    value={formData.basic_info.emergency_contact_name || ''}
                    onChange={(value) => handleBasicInfoChange('emergency_contact_name', value)}
                    placeholder="Emergency contact person"
                  />
                  
                  <FormField
                    label="Emergency Contact Phone"
                    type="tel"
                    value={formData.basic_info.emergency_contact_phone || ''}
                    onChange={(value) => handleBasicInfoChange('emergency_contact_phone', value)}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
              </div>
              
              <FormField
                label="Additional Notes"
                type="textarea"
                value={formData.basic_info.additional_notes || ''}
                onChange={(value) => handleBasicInfoChange('additional_notes', value)}
                placeholder="Any other relevant information..."
                rows={3}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Children Tab */}
        <TabsContent value="children">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Baby className="h-5 w-5 mr-2" />
                    Parent-Child Relationships
                  </CardTitle>
                  <CardDescription>
                    Manage relationships with children
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RelationshipManager
                relationships={formData.relationships}
                onRelationshipAdd={handleRelationshipAdd}
                onRelationshipUpdate={handleRelationshipUpdate}
                onRelationshipRemove={handleRelationshipRemove}
                onSearchChildren={searchChildren}
                mode="parent-focused"
                title="My Children"
                description="Children who are under your care and responsibility"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Organization Memberships
                  </CardTitle>
                  <CardDescription>
                    Organizations you belong to for benefits and coordination
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formData.organization_memberships.length > 0 ? (
                <div className="space-y-4">
                  {formData.organization_memberships.map((membership, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{membership.organization?.name}</h4>
                            <p className="text-sm text-gray-600">{membership.organization?.organization_type}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {membership.membership_type}
                              </Badge>
                              {membership.payment_responsibility?.covers_children && (
                                <Badge variant="outline" className="text-green-700 border-green-200">
                                  Covers Children
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Memberships</h3>
                  <p className="text-gray-600 mb-4">
                    You are not currently a member of any organizations.
                  </p>
                  <Button variant="outline">
                    Join Organization
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Login credentials and account configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Type Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Account Type</label>
                    <p className="text-xs text-gray-500">
                      Parents always have full user accounts with login access
                    </p>
                  </div>
                  <Badge variant="default">
                    Full User Account
                  </Badge>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You can log in with your email and password to access the parent dashboard, 
                    manage your children's information, and communicate with the academy.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Login Credentials */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Login Credentials</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Login Email"
                    type="email"
                    value={formData.basic_info.email}
                    onChange={(value) => handleBasicInfoChange('email', value)}
                    placeholder="parent@example.com"
                    required
                    note="Used for login authentication"
                  />
                  
                  <FormField
                    label="New Password"
                    type="password"
                    value={formData.account_settings.password || ''}
                    onChange={(value) => handleAccountSettingChange('password', value)}
                    placeholder="Enter new password (optional)"
                    note="Leave blank to keep current password"
                  />
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Account Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    View Activity History
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Download Personal Data
                  </Button>
                </div>
              </div>

              {/* Children Management Summary */}
              {hasChildren && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Children Management</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      You currently manage {formData.relationships.length} child{formData.relationships.length !== 1 ? 'ren' : ''} in this program:
                    </p>
                    <div className="space-y-1">
                      {formData.relationships.map((rel, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{rel.child?.first_name} {rel.child?.last_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {rel.relationship_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
          onClick={handleSave}
          disabled={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}