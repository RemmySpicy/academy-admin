/**
 * Example Integration: Enhanced Student Management Page
 * Demonstrates how to integrate the new enrollment workflow with existing pages
 * 
 * This is an example/demo file showing integration patterns.
 * Use these patterns in your actual student management pages.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  BookOpen, 
  Plus, 
  CheckCircle, 
  CreditCard,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  EnrollmentButton, 
  StudentEnrollmentButton, 
  NewEnrollmentButton 
} from './EnrollmentButton';
import { CourseAssignment } from '../types/enrollment';
import { User as UserType } from '@/shared/types';
import { CURRENCY } from '@/lib/constants';

// Mock data for demonstration
const mockStudent: UserType = {
  id: '1',
  email: 'john.doe@example.com',
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  profile_type: 'student',
  is_active: true,
  date_of_birth: '2010-05-15',
  gender: 'male',
  phone: '+234 123 456 7890',
  address: {
    street: '123 Main St',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    postal_code: '100001',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockEnrollments: Partial<CourseAssignment>[] = [
  {
    id: 'enr_001',
    course_id: 'course_001',
    facility_id: 'facility_001',
    age_group: '8-12 years',
    session_type: 'group',
    location_type: 'our-facility',
    payment_status: 'fully_paid',
    amount_paid: 50000,
    total_amount_due: 50000,
    sessions_accessible: 8,
    can_attend_sessions: true,
    created_at: '2024-01-15T00:00:00Z',
    // Mock related data
    course: {
      id: 'course_001',
      name: 'Swimming Fundamentals',
      code: 'SWIM-001',
    } as any,
    facility: {
      id: 'facility_001',
      name: 'Main Pool Facility',
    } as any,
  },
];

/**
 * Example: Student Detail Page with Enhanced Enrollment
 */
export function StudentDetailPageExample() {
  const [enrollments, setEnrollments] = useState(mockEnrollments);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleEnrollmentComplete = (assignment: CourseAssignment) => {
    // Add new enrollment to the list
    setEnrollments(prev => [...prev, assignment]);
    
    // Show success message
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 5000);
    
    console.log('New enrollment created:', assignment);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mockStudent.full_name}</h1>
          <p className="text-muted-foreground">{mockStudent.email}</p>
        </div>
        
        {/* Primary Enrollment Button */}
        <StudentEnrollmentButton
          student={mockStudent}
          onEnrollmentComplete={handleEnrollmentComplete}
        />
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Enrollment Successful!</strong> The student has been enrolled in a new course.
          </AlertDescription>
        </Alert>
      )}

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Age:</span>
              <span className="ml-2">{new Date().getFullYear() - new Date(mockStudent.date_of_birth!).getFullYear()} years</span>
            </div>
            <div>
              <span className="font-medium">Gender:</span>
              <span className="ml-2 capitalize">{mockStudent.gender}</span>
            </div>
            <div>
              <span className="font-medium">Phone:</span>
              <span className="ml-2">{mockStudent.phone}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <Badge variant={mockStudent.is_active ? "default" : "destructive"} className="ml-2">
                {mockStudent.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Enrollments ({enrollments.length})
            </div>
            
            {/* Secondary Enrollment Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // This could open the enrollment wizard with a different flow
                console.log('Add another course enrollment');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{enrollment.course?.name}</h4>
                      <p className="text-sm text-muted-foreground">{enrollment.course?.code}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        enrollment.payment_status === 'fully_paid' ? 'default' :
                        enrollment.payment_status === 'partially_paid' ? 'secondary' :
                        'destructive'
                      }>
                        {enrollment.payment_status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Age Group:</span>
                      <p className="text-muted-foreground">{enrollment.age_group}</p>
                    </div>
                    <div>
                      <span className="font-medium">Session Type:</span>
                      <p className="text-muted-foreground capitalize">
                        {enrollment.session_type?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-muted-foreground capitalize">
                        {enrollment.location_type?.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Facility:</span>
                      <p className="text-muted-foreground">{enrollment.facility?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Paid: {CURRENCY.FORMAT(enrollment.amount_paid || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Sessions: {enrollment.sessions_accessible}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className={`h-4 w-4 ${enrollment.can_attend_sessions ? 'text-green-600' : 'text-destructive'}`} />
                        <span>{enrollment.can_attend_sessions ? 'Can Attend' : 'Payment Required'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Manage Payment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-semibold mb-2">No Course Enrollments</h4>
              <p className="mb-4">This student is not enrolled in any courses yet.</p>
              
              <StudentEnrollmentButton
                student={mockStudent}
                onEnrollmentComplete={handleEnrollmentComplete}
                variant="outline"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example: Students List Page with Bulk Enrollment
 */
export function StudentsListPageExample() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleEnrollmentComplete = (assignment: CourseAssignment) => {
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 5000);
    console.log('New enrollment created:', assignment);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students Management</h1>
          <p className="text-muted-foreground">Manage student profiles and enrollments</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          
          {/* New Enrollment Button */}
          <NewEnrollmentButton
            onEnrollmentComplete={handleEnrollmentComplete}
          />
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Enrollment Successful!</strong> A new course enrollment has been created.
          </AlertDescription>
        </Alert>
      )}

      {/* Students Table would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Students table would be displayed here...</p>
            <p className="text-sm mt-2">Each row would have individual enrollment buttons</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example: Dashboard Widget with Quick Enrollment
 */
export function DashboardEnrollmentWidget() {
  const [recentEnrollments, setRecentEnrollments] = useState<CourseAssignment[]>([]);

  const handleEnrollmentComplete = (assignment: CourseAssignment) => {
    setRecentEnrollments(prev => [assignment, ...prev.slice(0, 4)]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Enrollment
          </div>
          
          <NewEnrollmentButton
            onEnrollmentComplete={handleEnrollmentComplete}
            size="sm"
            variant="outline"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Quickly enroll students in courses with the enhanced enrollment workflow.
          </p>
          
          {recentEnrollments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Enrollments</h4>
              <div className="space-y-2">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{enrollment.user?.full_name}</p>
                      <p className="text-muted-foreground">{enrollment.course?.name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {enrollment.payment_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Export components for use in your actual pages
export {
  StudentDetailPageExample,
  StudentsListPageExample,
  DashboardEnrollmentWidget,
};