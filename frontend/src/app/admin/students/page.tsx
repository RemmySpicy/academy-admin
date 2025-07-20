'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserX,
  Clock,
  Baby,
  Heart,
  Phone,
  Mail
} from 'lucide-react';
import { studentApi } from '@/features/students/api/studentApi';
import { parentApi, type EnhancedParent, type ParentStats } from '@/features/parents';
import { useParents, useParentStats } from '@/features/parents/hooks/useParents';
import { Student, StudentStats } from '@/features/students/types';
import { isApiSuccess, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/features/authentication/hooks';

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <UserCheck className="h-4 w-4" />;
    case 'inactive':
      return <UserX className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'suspended':
      return <UserX className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

export default function StudentsParentsPage() {
  const { user } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('students');
  
  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  
  // Parents state
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [parentStatusFilter, setParentStatusFilter] = useState('all');
  const [parentHasChildrenFilter, setParentHasChildrenFilter] = useState('all');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  
  const perPage = 20;
  
  // React Query hooks for parents
  const {
    data: parentsResponse,
    isLoading: parentLoading,
    error: parentQueryError,
    refetch: refetchParents
  } = useParents(
    {
      search: parentSearchTerm || undefined,
      is_active: parentStatusFilter === 'all' ? undefined : parentStatusFilter === 'active',
      has_children: parentHasChildrenFilter === 'all' ? undefined : parentHasChildrenFilter === 'with_children',
    },
    parentCurrentPage,
    perPage
  );
  
  const {
    data: parentStatsResponse,
    isLoading: parentStatsLoading
  } = useParentStats();
  
  const parents = parentsResponse?.data?.items || [];
  const parentStats = parentStatsResponse?.data;
  const totalParents = parentsResponse?.data?.total || 0;
  const parentTotalPages = parentsResponse?.data?.total_pages || 1;
  const parentError = parentQueryError ? 'Failed to load parents' : null;

  // Load students and stats
  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
      loadStudentStats();
    }
  }, [activeTab, studentCurrentPage, studentSearchTerm, studentStatusFilter]);

  const loadStudents = async () => {
    try {
      setStudentLoading(true);
      setStudentError(null);

      const searchParams = {
        search: studentSearchTerm || undefined,
        status: studentStatusFilter === 'all' ? undefined : studentStatusFilter,
      };

      const response = await studentApi.getAll(searchParams, studentCurrentPage, perPage);
      
      if (isApiSuccess(response)) {
        setStudents(response.data.items);
        setStudentTotalPages(response.data.total_pages);
        setTotalStudents(response.data.total);
      } else {
        setStudentError(getApiErrorMessage(response));
      }
    } catch (error) {
      setStudentError('Failed to load students. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  const loadStudentStats = async () => {
    try {
      const response = await studentApi.getStats();
      if (isApiSuccess(response)) {
        setStudentStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load student stats:', error);
    }
  };

  // Student handlers
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents(
      selectedStudents.length === students.length 
        ? [] 
        : students.map(student => student.id)
    );
  };
  
  // Parent handlers
  const handleSelectParent = (parentId: string) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleSelectAllParents = () => {
    setSelectedParents(
      selectedParents.length === parents.length 
        ? [] 
        : parents.map(parent => parent.id)
    );
  };

  const handleDelete = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        const response = await studentApi.delete(studentId);
        if (isApiSuccess(response)) {
          // Refresh the list
          loadStudents();
        } else {
          alert(getApiErrorMessage(response));
        }
      } catch (error) {
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedStudents.length === 0) return;
    
    try {
      const response = await studentApi.bulkUpdateStatus(selectedStudents, status);
      if (isApiSuccess(response)) {
        // Refresh the list and clear selection
        loadStudents();
        setSelectedStudents([]);
      } else {
        alert(getApiErrorMessage(response));
      }
    } catch (error) {
      alert('Failed to update student status. Please try again.');
    }
  };

  if (studentError && activeTab === 'students') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading students</div>
          <div className="text-gray-600 mb-4">{studentError}</div>
          <Button onClick={loadStudents}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (parentError && activeTab === 'parents') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading parents</div>
          <div className="text-gray-600 mb-4">{parentError}</div>
          <Button onClick={() => refetchParents()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students & Parents Management</h1>
          <p className="text-gray-600 mt-1">
            Manage student and parent profiles, relationships, and enrollment
          </p>
        </div>
        <Button asChild>
          <Link href={activeTab === 'students' ? '/admin/students/new' : '/admin/parents/new'}>
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'students' ? 'Student' : 'Parent'}
          </Link>
        </Button>
      </div>

      {/* Tabs for Students and Parents */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <Baby className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="parents" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Parents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          {/* Student Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentStats?.total_students || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{studentStats?.active_students || 0}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{studentStats?.pending_students || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <UserX className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{studentStats?.inactive_students || 0}</div>
                <p className="text-xs text-muted-foreground">Not enrolled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{studentStats?.suspended_students || 0}</div>
                <p className="text-xs text-muted-foreground">Action required</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Students</CardTitle>
              <CardDescription>
                Search and filter students by name, email, status, or program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedStudents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedStudents.length} student(s) selected
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkStatusUpdate('active')}
                      >
                        Mark Active
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkStatusUpdate('inactive')}
                      >
                        Mark Inactive
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkStatusUpdate('suspended')}
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onChange={handleSelectAllStudents}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-3 font-medium">Student ID</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Age</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Program</th>
                      <th className="text-left p-3 font-medium">Enrolled</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentLoading ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading students...</span>
                          </div>
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-500">
                          No students found
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <Link 
                            href={`/admin/students/${student.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {student.student_id}
                          </Link>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.first_name[0]}{student.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{student.first_name} {student.last_name}</div>
                              <div className="text-sm text-gray-500">{student.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{student.email}</td>
                        <td className="p-3">{student.age || calculateAge(student.date_of_birth)}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                            {getStatusIcon(student.status)}
                            <span className="ml-1 capitalize">{student.status}</span>
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{student.program_name || student.program || 'Not assigned'}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(student.enrollment_date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/admin/students/${student.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/admin/students/${student.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDelete(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {students.length} of {totalStudents} students
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={studentCurrentPage === 1}
                    onClick={() => setStudentCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page {studentCurrentPage} of {studentTotalPages}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={studentCurrentPage === studentTotalPages}
                    onClick={() => setStudentCurrentPage(prev => Math.min(studentTotalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents" className="space-y-6">
          {/* Parent Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parentStats?.total_parents || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{parentStats?.active_parents || 0}</div>
                <p className="text-xs text-muted-foreground">Currently engaged</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Children</CardTitle>
                <Baby className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{parentStats?.parents_with_children || 0}</div>
                <p className="text-xs text-muted-foreground">Connected families</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <UserX className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{parentStats?.inactive_parents || 0}</div>
                <p className="text-xs text-muted-foreground">Not engaged</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Children</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{parentStats?.average_children_per_parent?.toFixed(1) || '0.0'}</div>
                <p className="text-xs text-muted-foreground">Per parent</p>
              </CardContent>
            </Card>
          </div>

          {/* Parents Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parents</CardTitle>
              <CardDescription>
                Search and filter parents by name, email, status, or children connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search parents..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={parentSearchTerm}
                    onChange={(e) => setParentSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={parentStatusFilter}
                  onChange={(e) => setParentStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={parentHasChildrenFilter}
                  onChange={(e) => setParentHasChildrenFilter(e.target.value)}
                >
                  <option value="all">All Parents</option>
                  <option value="with_children">With Children</option>
                  <option value="without_children">Without Children</option>
                </select>
                
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Bulk Actions for Parents */}
              {selectedParents.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">
                      {selectedParents.length} parent(s) selected
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => console.log('Activate parents:', selectedParents)}
                      >
                        Mark Active
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => console.log('Deactivate parents:', selectedParents)}
                      >
                        Mark Inactive
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => console.log('Send communication to:', selectedParents)}
                      >
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Parents Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <input
                          type="checkbox"
                          checked={selectedParents.length === parents.length && parents.length > 0}
                          onChange={handleSelectAllParents}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Phone</th>
                      <th className="text-left p-3 font-medium">Children</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Last Contact</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parentLoading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <span className="ml-2">Loading parents...</span>
                          </div>
                        </td>
                      </tr>
                    ) : parents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">
                          No parents found
                        </td>
                      </tr>
                    ) : (
                      parents.map((parent) => (
                      <tr key={parent.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedParents.includes(parent.id)}
                            onChange={() => handleSelectParent(parent.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {parent.full_name ? parent.full_name.split(' ').map(n => n[0]).join('') : parent.username[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{parent.full_name || parent.username}</div>
                              <div className="text-sm text-gray-500">{parent.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{parent.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{parent.phone || 'Not provided'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Baby className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{parent.children_count || 0}</span>
                            <span className="text-sm text-gray-500">children</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            parent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {parent.is_active ? (
                              <><UserCheck className="h-3 w-3 mr-1" />Active</>
                            ) : (
                              <><UserX className="h-3 w-3 mr-1" />Inactive</>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {parent.last_login_at ? new Date(parent.last_login_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/admin/parents/${parent.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/admin/parents/${parent.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => console.log('Delete parent:', parent.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Parent Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {parents.length} of {totalParents} parents
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={parentCurrentPage === 1}
                    onClick={() => setParentCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page {parentCurrentPage} of {parentTotalPages}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={parentCurrentPage === parentTotalPages}
                    onClick={() => setParentCurrentPage(prev => Math.min(parentTotalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}