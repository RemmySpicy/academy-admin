'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2 } from 'lucide-react';
import { useUpdateAcademyUser } from '../../hooks/useAcademyUsers';
import { User } from '@/lib/api/types';

export interface UserUpdateData {
  username?: string;
  email?: string;
  full_name?: string;
  role?: 'super_admin' | 'program_admin' | 'program_coordinator' | 'instructor' | 'student' | 'parent';
  is_active?: boolean;
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function UserEditDialog({ open, onOpenChange, user, onSuccess }: UserEditDialogProps) {
  const [formData, setFormData] = useState<UserUpdateData>({});
  const [errors, setErrors] = useState<Partial<UserUpdateData>>({});

  const updateUserMutation = useUpdateAcademyUser();

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserUpdateData> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm()) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: formData,
      });
      
      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleInputChange = (field: keyof UserUpdateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!updateUserMutation.isPending) {
      setFormData({});
      setErrors({});
      onOpenChange(false);
    }
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full access to all academy features' },
    { value: 'program_admin', label: 'Program Admin', description: 'Manage assigned programs and teams' },
    { value: 'program_coordinator', label: 'Program Coordinator', description: 'Coordinate program activities and students' },
    { value: 'instructor', label: 'Instructor', description: 'Provide instruction and student interaction' },
    { value: 'student', label: 'Student', description: 'Student access to courses and activities' },
    { value: 'parent', label: 'Parent', description: 'Parent access to children\'s information' },
  ];

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information for {user.full_name} (@{user.username})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error display */}
          {updateUserMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-600 text-sm">
                {updateUserMutation.error.message || 'Failed to update user. Please try again.'}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter full name"
                className={errors.full_name ? 'border-red-500' : ''}
                disabled={updateUserMutation.isPending}
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className={errors.username ? 'border-red-500' : ''}
                disabled={updateUserMutation.isPending}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
                disabled={updateUserMutation.isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={updateUserMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active || false}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              disabled={updateUserMutation.isPending}
            />
            <Label htmlFor="is_active" className="text-sm font-medium">
              Account is active
            </Label>
          </div>

          {/* User Metadata */}
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>User ID:</strong> {user.id}</div>
              <div><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
              {user.last_login && (
                <div><strong>Last Login:</strong> {new Date(user.last_login).toLocaleDateString()}</div>
              )}
              {user.program_assignments && user.program_assignments.length > 0 && (
                <div>
                  <strong>Program Assignments:</strong> {user.program_assignments.length} program(s)
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="flex items-center space-x-2"
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{updateUserMutation.isPending ? 'Updating...' : 'Update User'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}