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
  AlertCircle,
  Activity,
  Clock,
  BookOpen,
  Award,
  FileText
} from 'lucide-react';

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
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Program Enrollments</CardTitle>
              <CardDescription>Current and past program enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{enrollment.program}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Level:</strong> {enrollment.level}</p>
                        <p><strong>Instructor:</strong> {enrollment.instructor}</p>
                      </div>
                      <div>
                        <p><strong>Period:</strong> {new Date(enrollment.start_date).toLocaleDateString()} - {new Date(enrollment.end_date).toLocaleDateString()}</p>
                        <p><strong>Attendance:</strong> {enrollment.sessions_attended}/{enrollment.total_sessions} sessions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Student Notes</CardTitle>
              <CardDescription>Additional information and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">General Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {student.notes}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Record Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Created:</strong> {new Date(student.created_at).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(student.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}