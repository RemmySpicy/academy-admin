'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Search, Plus, Users, UserCheck, 
  ChevronRight, BookOpen, Clock, Mail, Phone 
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';

// Types
interface SearchableUser {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  current_programs?: string[];
  enrollment_status?: string;
  profile_type: 'full_user' | 'profile_only';
}

interface CourseOption {
  id: string;
  name: string;
  description?: string;
  level: string;
  duration?: string;
}

export default function AddStudentPage() {
  const router = useRouter();
  const { currentProgram } = useProgramContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchableUser | null>(null);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [creditsAwarded, setCreditsAwarded] = useState<number>(0);

  usePageTitle('Add Existing Student', 'Search for existing users and assign them to courses in this program');

  // Search for existing users across all programs
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/v1/users/search?q=${encodeURIComponent(searchTerm)}&role=student&exclude_program=${currentProgram?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.data || []);
      } else {
        console.error('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Load available courses when user is selected
  const handleSelectUser = async (user: SearchableUser) => {
    setSelectedUser(user);
    
    try {
      const response = await fetch(`/api/v1/course-assignments/assignable-courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Program-Context': currentProgram?.id || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableCourses(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setAvailableCourses([]);
    }
  };

  // Handle course assignment
  const handleAssignCourses = async () => {
    if (!selectedUser || selectedCourses.length === 0) return;

    setIsAssigning(true);
    try {
      const assignmentPromises = selectedCourses.map(courseId => 
        fetch('/api/v1/course-assignments/assign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Program-Context': currentProgram?.id || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: selectedUser.id,
            course_id: courseId,
            assignment_type: 'direct',
            credits_awarded: creditsAwarded,
            assignment_notes: assignmentNotes
          })
        })
      );

      const results = await Promise.all(assignmentPromises);
      const allSuccessful = results.every(r => r.ok);

      if (allSuccessful) {
        // Option to go back or continue to enrollment
        const continueToProfile = confirm(
          `Successfully assigned ${selectedUser.first_name} ${selectedUser.last_name} to ${selectedCourses.length} course(s)!\n\nWould you like to view their profile? (Cancel to return to Students list)`
        );
        
        if (continueToProfile) {
          router.push(`/admin/students/${selectedUser.id}`);
        } else {
          router.push('/admin/students');
        }
      } else {
        alert('Some course assignments failed. Please try again.');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Failed to assign courses. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Existing Student</h1>
            <p className="text-gray-600">Search for existing users and assign them to courses in {currentProgram?.name}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search for Students
          </CardTitle>
          <CardDescription>
            Search across all users in the system to find existing students who aren't in this program yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Search Results ({searchResults.length})</h3>
              <div className="grid gap-4">
                {searchResults.map((user) => (
                  <Card key={user.id} className={`cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {user.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={user.profile_type === 'full_user' ? 'default' : 'secondary'}>
                                {user.profile_type === 'full_user' ? 'Full Account' : 'Profile Only'}
                              </Badge>
                              {user.current_programs && user.current_programs.length > 0 && (
                                <Badge variant="outline">
                                  {user.current_programs.length} Program{user.current_programs.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={selectedUser?.id === user.id ? "default" : "outline"}
                          onClick={() => handleSelectUser(user)}
                        >
                          {selectedUser?.id === user.id ? 'Selected' : 'Select'}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchTerm && searchResults.length === 0 && !isSearching && (
            <div className="mt-6 text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600 mb-4">
                No existing users match your search criteria, or all matching users are already in this program.
              </p>
              <Button variant="outline" onClick={() => router.push('/admin/students/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Student Instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Assignment Section */}
      {selectedUser && availableCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Assign Courses to {selectedUser.first_name} {selectedUser.last_name}
            </CardTitle>
            <CardDescription>
              Select courses to assign to this student in {currentProgram?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Available Courses */}
            <div>
              <h4 className="text-sm font-medium mb-3">Available Courses</h4>
              <div className="grid gap-3">
                {availableCourses.map((course) => (
                  <Card key={course.id} className={`cursor-pointer transition-colors ${selectedCourses.includes(course.id) ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{course.name}</h5>
                          {course.description && (
                            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">{course.level}</Badge>
                            {course.duration && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {course.duration}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant={selectedCourses.includes(course.id) ? "default" : "outline"}
                          onClick={() => toggleCourseSelection(course.id)}
                        >
                          {selectedCourses.includes(course.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Assignment Details */}
            {selectedCourses.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Assignment Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits to Award
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={creditsAwarded}
                      onChange={(e) => setCreditsAwarded(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Notes (Optional)
                  </label>
                  <Textarea
                    rows={3}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Any notes about this assignment..."
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignCourses}
                    disabled={isAssigning || selectedCourses.length === 0}
                  >
                    {isAssigning ? 'Assigning...' : `Assign ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}