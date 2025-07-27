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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2, Plus, X, Globe, AlertCircle } from 'lucide-react';
import { User } from '@/lib/api/types';

// Mock program data - replace with actual API call
interface Program {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

interface UserProgramAssignment {
  program_id: string;
  program_name: string;
  program_code: string;
  role?: string;
  is_active: boolean;
  assigned_at: string;
}

interface ProgramAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function ProgramAssignmentDialog({ 
  open, 
  onOpenChange, 
  user, 
  onSuccess 
}: ProgramAssignmentDialogProps) {
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [userAssignments, setUserAssignments] = useState<UserProgramAssignment[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('program_coordinator');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (user && open) {
      loadData();
    }
  }, [user, open]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Mock available programs
      const mockPrograms: Program[] = [
        { id: 'prog1', name: 'Robotics Program', code: 'ROB', description: 'Advanced robotics and automation', is_active: true },
        { id: 'prog2', name: 'AI/ML Program', code: 'AI', description: 'Artificial intelligence and machine learning', is_active: true },
        { id: 'prog3', name: 'Web Development', code: 'WEB', description: 'Full-stack web development', is_active: true },
        { id: 'prog4', name: 'Sports Program', code: 'SPT', description: 'Athletic development and training', is_active: true },
        { id: 'prog5', name: 'Arts Program', code: 'ART', description: 'Creative arts and design', is_active: true },
      ];

      // Mock user assignments (from user.program_assignments)
      const mockAssignments: UserProgramAssignment[] = user?.program_assignments?.map(assignment => ({
        program_id: assignment.program_id || 'prog1',
        program_name: assignment.program_name,
        program_code: assignment.program_code || 'UNK',
        role: assignment.role || user.role,
        is_active: assignment.is_active !== undefined ? assignment.is_active : true,
        assigned_at: assignment.assigned_at || new Date().toISOString(),
      })) || [];

      setAvailablePrograms(mockPrograms);
      setUserAssignments(mockAssignments);
    } catch (error) {
      console.error('Failed to load program data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!selectedProgramId || !user) return;

    setIsSubmitting(true);
    try {
      const selectedProgram = availablePrograms.find(p => p.id === selectedProgramId);
      if (!selectedProgram) return;

      // Check if already assigned
      const existingAssignment = userAssignments.find(a => a.program_id === selectedProgramId);
      if (existingAssignment) {
        alert('User is already assigned to this program');
        return;
      }

      // Create new assignment
      const newAssignment: UserProgramAssignment = {
        program_id: selectedProgramId,
        program_name: selectedProgram.name,
        program_code: selectedProgram.code,
        role: selectedRole,
        is_active: true,
        assigned_at: new Date().toISOString(),
      };

      // TODO: Replace with actual API call
      // await assignUserToProgram(user.id, selectedProgramId, selectedRole);

      setUserAssignments(prev => [...prev, newAssignment]);
      setSelectedProgramId('');
      setSelectedRole('program_coordinator');
    } catch (error) {
      console.error('Failed to add program assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (programId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to remove this program assignment?')) {
      try {
        // TODO: Replace with actual API call
        // await removeUserFromProgram(user.id, programId);

        setUserAssignments(prev => prev.filter(a => a.program_id !== programId));
      } catch (error) {
        console.error('Failed to remove program assignment:', error);
      }
    }
  };

  const handleToggleActive = async (programId: string, isActive: boolean) => {
    if (!user) return;

    try {
      // TODO: Replace with actual API call
      // await updateUserProgramAssignment(user.id, programId, { is_active: isActive });

      setUserAssignments(prev => 
        prev.map(a => 
          a.program_id === programId 
            ? { ...a, is_active: isActive }
            : a
        )
      );
    } catch (error) {
      console.error('Failed to update program assignment:', error);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // All changes are already applied individually
      // This could be used for a batch save if needed
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnassignedPrograms = () => {
    const assignedProgramIds = userAssignments.map(a => a.program_id);
    return availablePrograms.filter(p => !assignedProgramIds.includes(p.id) && p.is_active);
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'program_admin', label: 'Program Admin' },
    { value: 'program_coordinator', label: 'Program Coordinator' },
    { value: 'instructor', label: 'Instructor' },
  ];

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Manage Program Assignments</span>
          </DialogTitle>
          <DialogDescription>
            Manage program assignments for {user.first_name} {user.last_name} (@{user.username})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading program data...</span>
            </div>
          ) : (
            <>
              {/* Add New Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Program Assignment</CardTitle>
                  <CardDescription>
                    Assign this user to a new program with a specific role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Program</label>
                      <Select 
                        value={selectedProgramId} 
                        onValueChange={setSelectedProgramId}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {getUnassignedPrograms().map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              <div>
                                <div className="font-medium">{program.name}</div>
                                <div className="text-sm text-gray-500">{program.code} - {program.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role in Program</label>
                      <Select 
                        value={selectedRole} 
                        onValueChange={setSelectedRole}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">&nbsp;</label>
                      <Button
                        onClick={handleAddAssignment}
                        disabled={!selectedProgramId || isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Assignment
                      </Button>
                    </div>
                  </div>

                  {getUnassignedPrograms().length === 0 && (
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      All available programs are already assigned to this user
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Program Assignments</CardTitle>
                  <CardDescription>
                    Programs this user is currently assigned to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userAssignments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <div>No program assignments</div>
                      <div className="text-sm">Add an assignment above to get started</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userAssignments.map((assignment) => (
                        <div 
                          key={assignment.program_id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="font-medium">{assignment.program_name}</div>
                              <div className="text-sm text-gray-500">
                                {assignment.program_code} • Role: {roleOptions.find(r => r.value === assignment.role)?.label || assignment.role}
                              </div>
                              <div className="text-xs text-gray-400">
                                Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`active-${assignment.program_id}`}
                                checked={assignment.is_active}
                                onCheckedChange={(checked) => 
                                  handleToggleActive(assignment.program_id, !!checked)
                                }
                              />
                              <label 
                                htmlFor={`active-${assignment.program_id}`}
                                className="text-sm font-medium"
                              >
                                Active
                              </label>
                            </div>

                            <Badge variant={assignment.is_active ? "default" : "secondary"}>
                              {assignment.is_active ? 'Active' : 'Inactive'}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAssignment(assignment.program_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}