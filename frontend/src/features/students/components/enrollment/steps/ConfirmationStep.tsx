/**
 * Confirmation Step Component
 * Step 5: Show enrollment success and next steps
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  User, 
  BookOpen, 
  Building, 
  CreditCard,
  Calendar,
  MessageSquare,
  ArrowRight,
  Download,
  Mail,
  ExternalLink
} from 'lucide-react';
import { EnrollmentStepProps } from '../../../types/enrollment';
import { CURRENCY } from '@/lib/constants';

interface ConfirmationStepProps extends EnrollmentStepProps {
  onClose?: () => void;
}

export function ConfirmationStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onValidationChange,
  onClose,
  isLoading,
  error,
}: ConfirmationStepProps) {
  const assignment = data.enrollmentResult;

  if (!assignment) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Enrollment data is missing. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate sessions accessible based on payment
  const totalSessions = data.pricing?.sessions_per_payment || 0;
  const sessionsAccessible = assignment.sessions_accessible || 0;
  const canAttendSessions = assignment.can_attend_sessions;

  // Format payment status
  const getPaymentStatusBadge = () => {
    switch (assignment.payment_status) {
      case 'fully_paid':
        return <Badge className="bg-green-600 text-white">Fully Paid</Badge>;
      case 'partially_paid':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partially Paid</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{assignment.payment_status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-600">Enrollment Successful!</h3>
          <p className="text-muted-foreground mt-2">
            {data.selectedPerson?.full_name || data.newPersonData?.full_name} has been successfully enrolled in {data.selectedCourse?.name}.
          </p>
        </div>
      </div>

      {/* Enrollment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Information */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {data.selectedPerson?.full_name || data.newPersonData?.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.selectedPerson?.email || data.newPersonData?.email}
                {data.newPersonData && (
                  <Badge variant="secondary" className="ml-2 text-xs">New Account Created</Badge>
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Course Information */}
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{data.selectedCourse?.name}</p>
              <p className="text-sm text-muted-foreground">{data.selectedCourse?.code}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{data.selectedAgeGroup}</Badge>
                <Badge variant="outline">
                  {data.selectedSessionType?.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {data.selectedLocationType?.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Facility Information */}
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{data.selectedFacility?.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.selectedFacility?.location?.address}, {data.selectedFacility?.location?.city}
              </p>
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment Status:</span>
                {getPaymentStatusBadge()}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="ml-2">{CURRENCY.FORMAT(assignment.amount_paid)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Due:</span>
                  <span className="ml-2">{CURRENCY.FORMAT(assignment.total_amount_due)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sessions Accessible:</span>
                  <span className="ml-2">{sessionsAccessible} of {totalSessions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Can Attend:</span>
                  <span className={`ml-2 font-medium ${canAttendSessions ? 'text-green-600' : 'text-destructive'}`}>
                    {canAttendSessions ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {assignment.coupon_code && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Coupon Applied:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {assignment.coupon_code} (-{CURRENCY.FORMAT(assignment.coupon_discount_amount || 0)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Access Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canAttendSessions ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Ready to attend sessions!</strong> The student can now participate in {sessionsAccessible} session{sessionsAccessible !== 1 ? 's' : ''} 
                based on the current payment.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment required:</strong> Additional payment is needed before the student can attend sessions. 
                Minimum payment of {CURRENCY.FORMAT(data.pricing?.minimum_payment_amount || 0)} required.
              </AlertDescription>
            </Alert>
          )}

          {assignment.payment_status === 'partially_paid' && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Remaining Balance:</p>
              <p className="text-2xl font-bold text-primary">
                {CURRENCY.FORMAT(assignment.total_amount_due - assignment.amount_paid)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Additional payment can be made anytime before the session deadline.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.newPersonData && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Account Created:</strong> Login credentials have been sent to {data.newPersonData.email}. 
                  Please ask the student/parent to check their email and set up their account.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Schedule Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Contact the student/parent to schedule their sessions at {data.selectedFacility?.name}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Payment (if needed)</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.payment_status === 'unpaid' 
                      ? 'Collect payment before the first session.'
                      : assignment.payment_status === 'partially_paid'
                      ? 'Collect remaining balance for full course access.'
                      : 'Payment complete - ready to begin sessions.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Session Preparation</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure the facility is ready and any required equipment is available for the sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Enrollment
          </Button>
          
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => {
              // Reset wizard for new enrollment
              onUpdate({
                selectedPerson: null,
                personType: 'existing',
                newPersonData: undefined,
                selectedCourse: null,
                courseId: undefined,
                selectedFacility: null,
                facilityId: undefined,
                selectedAgeGroup: undefined,
                selectedSessionType: undefined,
                selectedLocationType: undefined,
                pricing: undefined,
                couponCode: undefined,
                couponDiscount: undefined,
                paymentStatus: 'unpaid',
                paymentAmount: undefined,
                enrollmentId: undefined,
                enrollmentResult: undefined,
              });
            }}
          >
            Enroll Another Person
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Enrollment ID */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Enrollment ID</p>
            <p className="font-mono text-lg font-semibold">{assignment.id}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Created on {new Date(assignment.created_at).toLocaleDateString()} at {new Date(assignment.created_at).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConfirmationStep;