'use client';

import React, { useState } from 'react';
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
import { useCreateAcademyUser } from '../../hooks/useAcademyUsers';

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'program_admin' | 'program_coordinator' | 'instructor' | 'student' | 'parent';
  is_active: boolean;
}

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserCreateDialog({ open, onOpenChange, onSuccess }: UserCreateDialogProps) {
  const [formData, setFormData] = useState<UserCreateData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'program_admin',
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<UserCreateData>>({});

  const createUserMutation = useCreateAcademyUser();

  const validateForm = (): boolean => {
    const newErrors: Partial<UserCreateData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createUserMutation.mutateAsync(formData);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'program_admin',
        is_active: true,
      });
      setErrors({});
      
      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleInputChange = (field: keyof UserCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!createUserMutation.isPending) {
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'program_admin',
        is_active: true,
      });
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the academy system. They will be able to sign in immediately after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error display */}
          {createUserMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-600 text-sm">
                {createUserMutation.error.message || 'Failed to create user. Please try again.'}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                className={errors.first_name ? 'border-red-500' : ''}
                disabled={createUserMutation.isPending}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                className={errors.last_name ? 'border-red-500' : ''}
                disabled={createUserMutation.isPending}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className={errors.username ? 'border-red-500' : ''}
                disabled={createUserMutation.isPending}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
                disabled={createUserMutation.isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password (min 8 characters)"
                className={errors.password ? 'border-red-500' : ''}
                disabled={createUserMutation.isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={createUserMutation.isPending}
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
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              disabled={createUserMutation.isPending}
            />
            <Label htmlFor="is_active" className="text-sm font-medium">
              Account is active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex items-center space-x-2"
            >
              {createUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{createUserMutation.isPending ? 'Creating...' : 'Create User'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}