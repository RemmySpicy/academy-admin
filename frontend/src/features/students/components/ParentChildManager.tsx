'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  UserPlus,
  Baby,
  Heart,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  Users,
  Link as LinkIcon,
  Unlink,
  Eye,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { RELATIONSHIP_OPTIONS } from '@/features/students/types';

interface UserRelationship {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  relationship_type: string;
  is_active: boolean;
  is_primary: boolean;
  emergency_contact: boolean;
  can_pick_up: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  parent_user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
  };
  child_user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    date_of_birth?: string;
    phone?: string;
    is_active: boolean;
  };
}

interface ParentChildManagerProps {
  userId: string;
  userRole: 'parent' | 'student' | 'admin';
  relationships: UserRelationship[];
  onRelationshipCreate?: (data: any) => void;
  onRelationshipUpdate?: (id: string, data: any) => void;
  onRelationshipDelete?: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Parent-Child Relationship Management Component
 * 
 * Handles the creation, editing, and deletion of parent-child relationships
 * Can be used in student profiles, parent profiles, or admin interfaces
 */
export function ParentChildManager({
  userId,
  userRole,
  relationships,
  onRelationshipCreate,
  onRelationshipUpdate,
  onRelationshipDelete,
  isLoading = false
}: ParentChildManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<UserRelationship | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRelationship, setNewRelationship] = useState({
    other_user_id: '',
    relationship_type: '',
    is_primary: false,
    emergency_contact: true,
    can_pick_up: true,
    notes: ''
  });

  const isParentView = userRole === 'parent';
  const isStudentView = userRole === 'student';
  const isAdminView = userRole === 'admin';

  const getRelationshipDisplayData = (relationship: UserRelationship) => {
    if (isParentView) {
      // Parent viewing their children
      return {
        user: relationship.child_user,
        relationshipType: relationship.relationship_type,
        direction: 'child'
      };
    } else {
      // Student viewing their parents or admin view
      return {
        user: relationship.parent_user,
        relationshipType: relationship.relationship_type,
        direction: 'parent'
      };
    }
  };

  const getRelationshipIcon = (relationshipType: string, direction: 'parent' | 'child') => {
    if (direction === 'child') {
      return <Baby className="h-4 w-4 text-pink-600" />;
    }
    
    switch (relationshipType.toLowerCase()) {
      case 'mother':
        return <Heart className="h-4 w-4 text-pink-600" />;
      case 'father':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'guardian':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'grandparent':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCreateRelationship = async () => {
    if (!newRelationship.other_user_id || !newRelationship.relationship_type) {
      return;
    }

    const relationshipData = {
      ...newRelationship,
      [isParentView ? 'child_user_id' : 'parent_user_id']: newRelationship.other_user_id,
      [isParentView ? 'parent_user_id' : 'child_user_id']: userId,
    };

    await onRelationshipCreate?.(relationshipData);
    setIsCreateDialogOpen(false);
    setNewRelationship({
      other_user_id: '',
      relationship_type: '',
      is_primary: false,
      emergency_contact: true,
      can_pick_up: true,
      notes: ''
    });
  };

  const handleEditRelationship = async () => {
    if (!selectedRelationship) return;

    await onRelationshipUpdate?.(selectedRelationship.id, {
      relationship_type: newRelationship.relationship_type,
      is_primary: newRelationship.is_primary,
      emergency_contact: newRelationship.emergency_contact,
      can_pick_up: newRelationship.can_pick_up,
      notes: newRelationship.notes
    });

    setIsEditDialogOpen(false);
    setSelectedRelationship(null);
  };

  const openEditDialog = (relationship: UserRelationship) => {
    setSelectedRelationship(relationship);
    setNewRelationship({
      other_user_id: '',
      relationship_type: relationship.relationship_type,
      is_primary: relationship.is_primary,
      emergency_contact: relationship.emergency_contact,
      can_pick_up: relationship.can_pick_up,
      notes: relationship.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    await onRelationshipDelete?.(relationshipId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {isParentView ? 'Children Profiles' : isStudentView ? 'Parent Contacts' : 'Family Relationships'}
              </CardTitle>
              <CardDescription>
                {isParentView 
                  ? 'Manage your children and their enrollments'
                  : isStudentView 
                  ? 'View parent and guardian contact information'
                  : 'Manage family relationships and emergency contacts'
                }
              </CardDescription>
            </div>
            {(isParentView || isAdminView) && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isParentView ? 'Add Child' : 'Add Relationship'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {isParentView ? 'Add Child Profile' : 'Add Family Relationship'}
                    </DialogTitle>
                    <DialogDescription>
                      {isParentView 
                        ? 'Link an existing student account or create a new child profile'
                        : 'Create a new family relationship between users'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    {/* User Search/Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="user-search" className="text-right">
                        {isParentView ? 'Child' : 'User'}
                      </label>
                      <div className="col-span-3">
                        <input
                          id="user-search"
                          placeholder={isParentView ? 'Search for student...' : 'Search for user...'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Relationship Type */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="relationship-type" className="text-right">
                        Relationship
                      </label>
                      <div className="col-span-3">
                        <Select 
                          value={newRelationship.relationship_type} 
                          onValueChange={(value) => setNewRelationship(prev => ({ ...prev, relationship_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Relationship Options */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">Options</label>
                      <div className="col-span-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is-primary"
                            checked={newRelationship.is_primary}
                            onChange={(e) => setNewRelationship(prev => ({ ...prev, is_primary: e.target.checked }))}
                          />
                          <label htmlFor="is-primary" className="text-sm">Primary contact</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="emergency-contact"
                            checked={newRelationship.emergency_contact}
                            onChange={(e) => setNewRelationship(prev => ({ ...prev, emergency_contact: e.target.checked }))}
                          />
                          <label htmlFor="emergency-contact" className="text-sm">Emergency contact</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="can-pick-up"
                            checked={newRelationship.can_pick_up}
                            onChange={(e) => setNewRelationship(prev => ({ ...prev, can_pick_up: e.target.checked }))}
                          />
                          <label htmlFor="can-pick-up" className="text-sm">Authorized for pickup</label>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="notes" className="text-right">
                        Notes
                      </label>
                      <div className="col-span-3">
                        <textarea
                          id="notes"
                          placeholder="Additional notes..."
                          value={newRelationship.notes}
                          onChange={(e) => setNewRelationship(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleCreateRelationship}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Create Relationship
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading relationships...</span>
            </div>
          ) : relationships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No {isParentView ? 'children' : 'family relationships'} found</p>
              <p className="text-sm">
                {isParentView ? 'Add a child profile to get started' : 'Add family relationships to manage contacts'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {relationships.map((relationship) => {
                const { user, relationshipType, direction } = getRelationshipDisplayData(relationship);
                
                return (
                  <Card key={relationship.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {getRelationshipIcon(relationshipType, direction)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{user?.full_name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
                              </Badge>
                              {relationship.is_primary && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user?.email}
                              </span>
                              {user?.phone && (
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {user?.phone}
                                </span>
                              )}
                              {user?.date_of_birth && direction === 'child' && (
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Age {calculateAge(user.date_of_birth)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              {relationship.emergency_contact && (
                                <div className="flex items-center text-green-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Emergency Contact</span>
                                </div>
                              )}
                              {relationship.can_pick_up && (
                                <div className="flex items-center text-blue-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Pickup Authorized</span>
                                </div>
                              )}
                              {!user?.is_active && (
                                <Badge variant="destructive" className="text-xs">
                                  Inactive User
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* View Profile Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            title={`View ${direction === 'child' ? 'student' : 'parent'} profile`}
                          >
                            <Link href={direction === 'child' ? `/admin/students/${user?.id}` : `/admin/parents/${user?.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {/* Quick Contact Button */}
                          {user?.email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                              title="Send email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Phone Button */}
                          {user?.phone && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`tel:${user.phone}`, '_blank')}
                              title="Call phone"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Management Actions (only for admin/parent views) */}
                          {(isParentView || isAdminView) && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(relationship)}
                                title="Edit relationship"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    title="Remove relationship"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Relationship</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this family relationship? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRelationship(relationship.id)}>
                                      <Unlink className="h-4 w-4 mr-2" />
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {relationship.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{relationship.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Relationship Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Relationship</DialogTitle>
            <DialogDescription>
              Update the relationship details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Relationship Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-relationship-type" className="text-right">
                Relationship
              </label>
              <div className="col-span-3">
                <Select 
                  value={newRelationship.relationship_type} 
                  onValueChange={(value) => setNewRelationship(prev => ({ ...prev, relationship_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Relationship Options */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Options</label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is-primary"
                    checked={newRelationship.is_primary}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, is_primary: e.target.checked }))}
                  />
                  <label htmlFor="edit-is-primary" className="text-sm">Primary contact</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-emergency-contact"
                    checked={newRelationship.emergency_contact}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, emergency_contact: e.target.checked }))}
                  />
                  <label htmlFor="edit-emergency-contact" className="text-sm">Emergency contact</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-can-pick-up"
                    checked={newRelationship.can_pick_up}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, can_pick_up: e.target.checked }))}
                  />
                  <label htmlFor="edit-can-pick-up" className="text-sm">Authorized for pickup</label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-notes" className="text-right">
                Notes
              </label>
              <div className="col-span-3">
                <textarea
                  id="edit-notes"
                  placeholder="Additional notes..."
                  value={newRelationship.notes}
                  onChange={(e) => setNewRelationship(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditRelationship}>
              <Edit className="h-4 w-4 mr-2" />
              Update Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}