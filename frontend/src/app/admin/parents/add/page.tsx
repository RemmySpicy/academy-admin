'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Search, Plus, Users, UserCheck, 
  ChevronRight, BookOpen, Clock, Mail, Phone, Baby, Heart 
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProgramContext } from '@/hooks/useProgramContext';

// Types
interface SearchableParent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  children_count: number;
  current_programs?: string[];
  is_active: boolean;
  profile_type: 'full_user';
}

interface ChildOption {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  current_program?: string;
}

interface CourseOption {
  id: string;
  name: string;
  description?: string;
  level: string;
  duration?: string;
}

export default function AddParentPage() {
  const router = useRouter();
  const { currentProgram } = useProgramContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableParent[]>([]);
  const [selectedParent, setSelectedParent] = useState<SearchableParent | null>(null);
  const [parentChildren, setParentChildren] = useState<ChildOption[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [creditsAwarded, setCreditsAwarded] = useState<number>(0);

  usePageTitle('Add Existing Parent', 'Search for existing parents and assign their children to courses in this program');

  // Search for existing parents across all programs
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/v1/parents/search?q=${encodeURIComponent(searchTerm)}&exclude_program=${currentProgram?.id}`, {
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

  // Load parent's children and available courses when parent is selected
  const handleSelectParent = async (parent: SearchableParent) => {
    setSelectedParent(parent);
    
    try {
      // Load parent's children
      const childrenResponse = await fetch(`/api/v1/parents/${parent.id}/children`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (childrenResponse.ok) {
        const childrenResult = await childrenResponse.json();
        setParentChildren(childrenResult.data || []);
      }

      // Load available courses
      const coursesResponse = await fetch(`/api/v1/course-assignments/assignable-courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Program-Context': currentProgram?.id || '',
          'Content-Type': 'application/json'
        }
      });

      if (coursesResponse.ok) {
        const coursesResult = await coursesResponse.json();
        setAvailableCourses(coursesResult.data || []);
      }
    } catch (error) {
      console.error('Failed to load parent data:', error);
      setParentChildren([]);
      setAvailableCourses([]);
    }
  };

  // Handle course assignment for selected children
  const handleAssignCourses = async () => {
    if (!selectedParent || selectedChildren.length === 0 || selectedCourses.length === 0) return;

    setIsAssigning(true);
    try {
      const assignmentPromises = selectedChildren.flatMap(childId => 
        selectedCourses.map(courseId => 
          fetch('/api/v1/course-assignments/assign', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-Program-Context': currentProgram?.id || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: childId,
              course_id: courseId,
              assignment_type: 'parent_assigned',
              credits_awarded: creditsAwarded,
              assignment_notes: assignmentNotes
            })
          })
        )
      );

      const results = await Promise.all(assignmentPromises);
      const allSuccessful = results.every(r => r.ok);

      if (allSuccessful) {
        // Option to go back or continue to profile
        const continueToProfile = confirm(
          `Successfully assigned ${selectedChildren.length} child(ren) to ${selectedCourses.length} course(s)!\n\nWould you like to view ${selectedParent.first_name}'s profile? (Cancel to return to Parents list)`
        );
        
        if (continueToProfile) {
          router.push(`/admin/parents/${selectedParent.id}`);
        } else {
          router.push('/admin/students?tab=parents');
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

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
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
            <h1 className="text-2xl font-bold text-gray-900">Add Existing Parent</h1>
            <p className="text-gray-600">Search for existing parents and assign their children to courses in {currentProgram?.name}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search for Parents
          </CardTitle>
          <CardDescription>
            Search across all parents in the system to find those who aren't in this program yet
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
                {searchResults.map((parent) => (
                  <Card key={parent.id} className={`cursor-pointer transition-colors ${selectedParent?.id === parent.id ? 'ring-2 ring-purple-500' : 'hover:bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {parent.first_name[0]}{parent.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {parent.first_name} {parent.last_name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {parent.email}
                              </div>
                              {parent.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {parent.phone}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={parent.is_active ? 'default' : 'secondary'}>
                                {parent.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-blue-600">
                                <Baby className="h-3 w-3 mr-1" />
                                {parent.children_count} Child{parent.children_count !== 1 ? 'ren' : ''}
                              </Badge>
                              {parent.current_programs && parent.current_programs.length > 0 && (
                                <Badge variant="outline">
                                  {parent.current_programs.length} Program{parent.current_programs.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={selectedParent?.id === parent.id ? "default" : "outline"}
                          onClick={() => handleSelectParent(parent)}
                        >
                          {selectedParent?.id === parent.id ? 'Selected' : 'Select'}
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
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parents found</h3>
              <p className="text-gray-600 mb-4">
                No existing parents match your search criteria, or all matching parents are already in this program.
              </p>
              <Button variant="outline" onClick={() => router.push('/admin/parents/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Parent Instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Children and Course Assignment Section */}
      {selectedParent && parentChildren.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Baby className="h-5 w-5 mr-2" />
              Select Children for {selectedParent.first_name} {selectedParent.last_name}
            </CardTitle>
            <CardDescription>
              Choose which children to assign to courses in {currentProgram?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Children Selection */}
            <div>
              <h4 className="text-sm font-medium mb-3">Available Children ({parentChildren.length})</h4>
              <div className="grid gap-3">
                {parentChildren.map((child) => (
                  <Card key={child.id} className={`cursor-pointer transition-colors ${selectedChildren.includes(child.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{child.first_name} {child.last_name}</h5>
                          <div className="flex items-center space-x-4 mt-1">
                            {child.date_of_birth && (
                              <span className="text-sm text-gray-500">
                                Born: {new Date(child.date_of_birth).toLocaleDateString()}
                              </span>
                            )}
                            {child.current_program && (
                              <Badge variant="outline">
                                In: {child.current_program}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant={selectedChildren.includes(child.id) ? "default" : "outline"}
                          onClick={() => toggleChildSelection(child.id)}
                        >
                          {selectedChildren.includes(child.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Course Selection */}
            {selectedChildren.length > 0 && availableCourses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Select Courses to Assign</h4>
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
            )}

            {/* Assignment Details */}
            {selectedChildren.length > 0 && selectedCourses.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Assignment Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits to Award (per child)
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
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Any notes about this assignment..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Assignment Summary</h5>
                  <p className="text-sm text-blue-800">
                    You're about to assign <strong>{selectedChildren.length} child{selectedChildren.length !== 1 ? 'ren' : ''}</strong> to <strong>{selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''}</strong>, 
                    creating <strong>{selectedChildren.length * selectedCourses.length} total assignment{selectedChildren.length * selectedCourses.length !== 1 ? 's' : ''}</strong>.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setSelectedParent(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignCourses}
                    disabled={isAssigning}
                  >
                    {isAssigning ? 'Assigning...' : `Create ${selectedChildren.length * selectedCourses.length} Assignment${selectedChildren.length * selectedCourses.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Children Warning */}
      {selectedParent && parentChildren.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <Baby className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-900 mb-2">No Children Found</h3>
            <p className="text-yellow-800 mb-4">
              {selectedParent.first_name} {selectedParent.last_name} doesn't have any children registered in the system yet.
            </p>
            <Button variant="outline" onClick={() => router.push('/admin/students/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Child Profile First
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}