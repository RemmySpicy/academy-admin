'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Users,
  AlertCircle,
  Activity,
  Clock,
  BookOpen,
  Award,
  FileText,
  Heart,
  Eye
} from 'lucide-react';
import { ParentChildManager } from '@/features/students/components';
import { 
  useUserRelationships, 
  useCreateRelationship, 
  useUpdateRelationship, 
  useDeleteRelationship,
  type CreateRelationshipData,
  type UpdateRelationshipData
} from '@/features/students/hooks/useUserRelationships';
import { StudentScheduleManager } from '@/features/scheduling/components/StudentScheduleManager';
import { StudentFinancialManager } from '@/features/payments/components/StudentFinancialManager';
import { StudentEnrollmentButton } from '@/features/students/components/EnrollmentButton';

// Mock data - this will be replaced with real API calls
const mockStudent = {
  id: '1',
  student_id: 'STU-2025-0001',
  salutation: 'Mr',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  date_of_birth: '2010-05-15',
  gender: 'male',
  status: 'active',
  enrollment_date: '2025-01-01',
  referral_source: 'Website',
  address: {
    line1: '123 Main St',
    line2: 'Apt 4B',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'US'
  },
  emergency_contact_name: 'Jane Doe',
  emergency_contact_phone: '555-987-6543',
  emergency_contact_relationship: 'Mother',
  medical_conditions: 'None',
  medications: 'None',
  allergies: 'Peanuts',
  notes: 'Great student with strong motivation',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-08T15:30:00Z'
};

const mockEnrollments = [
  {
    id: '1',
    program: 'Swimming Program',
    level: 'Level 2',
    instructor: 'Coach Smith',
    status: 'active',
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    sessions_attended: 12,
    total_sessions: 20
  },
  {
    id: '2',
    program: 'Water Safety',
    level: 'Beginner',
    instructor: 'Coach Johnson',
    status: 'completed',
    start_date: '2024-09-01',
    end_date: '2024-12-31',
    sessions_attended: 15,
    total_sessions: 15
  }
];

const mockAttendance = [
  { date: '2025-01-08', status: 'present', program: 'Swimming Program' },
  { date: '2025-01-06', status: 'present', program: 'Swimming Program' },
  { date: '2025-01-04', status: 'absent', program: 'Swimming Program' },
  { date: '2025-01-02', status: 'present', program: 'Swimming Program' },
  { date: '2024-12-30', status: 'present', program: 'Swimming Program' }
];

const mockProgress = [
  {
    id: '1',
    program: 'Swimming Program',
    skill: 'Freestyle Stroke',
    current_level: 'Intermediate',
    target_level: 'Advanced',
    progress_percentage: 75,
    last_assessment: '2025-01-05',
    instructor_notes: 'Excellent progress on technique'
  },
  {
    id: '2',
    program: 'Swimming Program',
    skill: 'Backstroke',
    current_level: 'Beginner',
    target_level: 'Intermediate',
    progress_percentage: 60,
    last_assessment: '2025-01-05',
    instructor_notes: 'Needs work on body position'
  }
];

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
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student] = useState(mockStudent);
  const [enrollments] = useState(mockEnrollments);
  const [attendance] = useState(mockAttendance);
  const [progress] = useState(mockProgress);

  const age = calculateAge(student.date_of_birth);

  // User relationships hooks
  const { data: relationships = [], isLoading: relationshipsLoading } = useUserRelationships(student.id);
  const createRelationshipMutation = useCreateRelationship();
  const updateRelationshipMutation = useUpdateRelationship();
  const deleteRelationshipMutation = useDeleteRelationship();

  const handleCreateRelationship = async (data: CreateRelationshipData) => {
    await createRelationshipMutation.mutateAsync(data);
  };

  const handleUpdateRelationship = async (id: string, data: UpdateRelationshipData) => {
    await updateRelationshipMutation.mutateAsync({ id, data });
  };

  const handleDeleteRelationship = async (id: string) => {
    await deleteRelationshipMutation.mutateAsync(id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      // Handle delete logic here
      console.log('Delete student:', student.id);
      router.push('/admin/students');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.salutation} {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-600">
              {student.student_id} • Age {age} • Enrolled {new Date(student.enrollment_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={`/admin/students/${student.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Student
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Student Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {student.first_name[0]}{student.last_name[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {student.first_name} {student.last_name}
                </h2>
                <p className="text-gray-600">{student.student_id}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.status)}`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-sm text-gray-900">
                    {student.salutation} {student.first_name} {student.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {new Date(student.date_of_birth).toLocaleDateString()} (Age {age})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-sm text-gray-900 capitalize">{student.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Referral Source</label>
                  <p className="text-sm text-gray-900">{student.referral_source}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm text-gray-900">{student.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-sm text-gray-900">
                    {student.address.line1}
                    {student.address.line2 && <><br />{student.address.line2}</>}
                    <br />
                    {student.address.city}, {student.address.state} {student.address.postal_code}
                    <br />
                    {student.address.country}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-sm text-gray-900">{student.emergency_contact_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm text-gray-900">{student.emergency_contact_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Relationship</label>
                  <p className="text-sm text-gray-900">{student.emergency_contact_relationship}</p>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                  <p className="text-sm text-gray-900">{student.medical_conditions}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Medications</label>
                  <p className="text-sm text-gray-900">{student.medications}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Allergies</label>
                  <p className="text-sm text-gray-900">{student.allergies}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Course Enrollments</h2>
              <p className="text-gray-600">Manage student course assignments and enrollment status</p>
            </div>
            <StudentEnrollmentButton
              student={{
                id: student.id,
                full_name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                roles: ['student']
              }}
              onEnrollmentComplete={(assignment) => {
                console.log('Enrollment completed:', assignment);
                // Refresh enrollments data here
              }}
            />
          </div>

          {/* Current Enrollments */}
          <div className="grid gap-4">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{enrollment.program}</h3>
                        <p className="text-gray-600">{enrollment.level} • Instructor: {enrollment.instructor}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(enrollment.start_date).toLocaleDateString()} - {new Date(enrollment.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                      <div className="text-sm text-gray-600">
                        {enrollment.sessions_attended}/{enrollment.total_sessions} sessions
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{Math.round((enrollment.sessions_attended / enrollment.total_sessions) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(enrollment.sessions_attended / enrollment.total_sessions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {enrollments.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Course Enrollments</h3>
                    <p className="text-gray-600 mb-4">This student is not currently enrolled in any courses.</p>
                    <StudentEnrollmentButton
                      student={{
                        id: student.id,
                        full_name: `${student.first_name} ${student.last_name}`,
                        email: student.email,
                        roles: ['student']
                      }}
                      variant="default"
                      onEnrollmentComplete={(assignment) => {
                        console.log('Enrollment completed:', assignment);
                        // Refresh enrollments data here
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Children Tab (for parents) */}
        <TabsContent value="children">
          <ParentChildManager
            userId={student.id}
            userRole="student"
            relationships={relationships}
            onRelationshipCreate={handleCreateRelationship}
            onRelationshipUpdate={handleUpdateRelationship}
            onRelationshipDelete={handleDeleteRelationship}
            isLoading={relationshipsLoading}
          />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <StudentFinancialManager
            studentId={student.id}
            enrollments={enrollments}
          />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <StudentScheduleManager
            studentId={student.id}
            enrollments={enrollments}
          />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendance.map((record, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600">{record.program}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
              <CardDescription>Skill development and learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progress.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{item.skill}</h3>
                      <span className="text-sm text-gray-600">{item.program}</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{item.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Current Level:</strong> {item.current_level}</p>
                        <p><strong>Target Level:</strong> {item.target_level}</p>
                      </div>
                      <div>
                        <p><strong>Last Assessment:</strong> {new Date(item.last_assessment).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm"><strong>Instructor Notes:</strong> {item.instructor_notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Quick Navigation Panel for Parents */}
      {relationships && relationships.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Heart className="h-5 w-5 mr-2" />
              Quick Access to Parents
            </CardTitle>
            <CardDescription className="text-purple-600">
              Navigate directly to parent profiles and emergency contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relationships
                .filter(rel => rel.parent_user) // Only show relationships where we have parent data
                .map((relationship) => (
                <Card key={relationship.id} className="bg-white border-purple-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        {relationship.relationship_type.toLowerCase() === 'mother' ? (
                          <Heart className="h-5 w-5 text-pink-600" />
                        ) : relationship.relationship_type.toLowerCase() === 'father' ? (
                          <User className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Users className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {relationship.parent_user?.full_name || relationship.parent_user?.username}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">{relationship.relationship_type}</p>
                        {relationship.is_primary && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Primary Contact
                          </span>
                        )}
                        {relationship.emergency_contact && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1 ml-1">
                            Emergency
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link href={`/admin/parents/${relationship.parent_user?.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                      {relationship.parent_user?.email && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`mailto:${relationship.parent_user.email}`, '_blank')}
                          title="Send email"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                      {relationship.parent_user?.phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${relationship.parent_user.phone}`, '_blank')}
                          title="Call phone"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}