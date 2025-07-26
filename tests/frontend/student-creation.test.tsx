/**
 * Frontend Integration Tests for Student Creation Flows
 * 
 * Tests the complete frontend workflows for student creation and editing,
 * including form validation, API integration, and user interactions.
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'next/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import components to test
import NewStudentPage from '@/app/admin/students/new/page';
import EditStudentPage from '@/app/admin/students/[id]/edit/page';
import { PaymentOverrideCard } from '@/components/ui/forms/PaymentOverrideCard';

// Mock hooks and utilities
vi.mock('@/hooks/usePageTitle', () => ({
  usePageTitle: vi.fn()
}));

vi.mock('@/hooks/useProgramContext', () => ({
  useProgramContext: () => ({
    currentProgram: {
      id: 'test-program-id',
      name: 'Test Program'
    }
  })
}));

vi.mock('@/lib/httpClient', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Test data
const mockStudent = {
  id: 'test-student-id',
  user: {
    id: 'test-user-id',
    full_name: 'Test Student',
    email: 'test.student@example.com',
    phone: '+234 801 234 5678',
    date_of_birth: '2010-05-15',
    profile_type: 'full_user'
  },
  program_id: 'test-program-id',
  enrollment_date: '2024-01-15'
};

const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  organization_type: 'school',
  is_partner: true
};

const mockPaymentStatus = {
  student_id: 'test-student-id',
  student_name: 'Test Student',
  sponsoring_organizations: [
    {
      organization_id: 'test-org-id',
      organization_name: 'Test Organization',
      membership_type: 'sponsored_student',
      payment_responsibility: true
    }
  ],
  responsible_parents: [],
  has_payment_overrides: true,
  payment_responsibility_type: 'organization'
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Student Creation Flows', () => {
  let httpClient: any;

  beforeEach(() => {
    const { httpClient: mockHttpClient } = require('@/lib/httpClient');
    httpClient = mockHttpClient;
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Independent Student Creation', () => {
    it('should create an independent student successfully', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            student: mockStudent,
            user: mockStudent.user
          }
        }
      });

      render(
        <TestWrapper>
          <NewStudentPage />
        </TestWrapper>
      );

      // Verify page loaded
      expect(screen.getByText('Add New Student')).toBeInTheDocument();

      // Verify Independent toggle is selected by default
      const independentRadio = screen.getByLabelText('Independent Student');
      expect(independentRadio).toBeChecked();

      // Fill out basic information
      await user.type(screen.getByLabelText('Full Name'), 'John Independent');
      await user.type(screen.getByLabelText('Date of Birth'), '2010-05-15');
      await user.type(screen.getByLabelText('Email'), 'john.independent@test.com');
      await user.type(screen.getByLabelText('Phone'), '+234 801 234 5678');

      // Fill out address
      await user.type(screen.getByLabelText('Street Address'), '123 Independence Street');
      await user.type(screen.getByLabelText('City'), 'Lagos');
      await user.type(screen.getByLabelText('State'), 'Lagos State');

      // Fill out emergency contact
      await user.type(screen.getByLabelText('Emergency Contact Name'), 'Jane Doe');
      await user.type(screen.getByLabelText('Emergency Contact Phone'), '+234 802 345 6789');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create student/i });
      await user.click(submitButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          '/students/atomic/create-independent',
          expect.objectContaining({
            profile_type: 'independent',
            organization_type: 'individual',
            basic_info: expect.objectContaining({
              full_name: 'John Independent',
              date_of_birth: '2010-05-15',
              email: 'john.independent@test.com',
              phone: '+234 801 234 5678'
            })
          })
        );
      });
    });

    it('should show validation errors for missing required fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewStudentPage />
        </TestWrapper>
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create student/i });
      await user.click(submitButton);

      // Check for validation error messages
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      // Verify API was not called
      expect(httpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Student with Parent Creation', () => {
    it('should create a student with new parent', async () => {
      const user = userEvent.setup();

      // Mock successful API response
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            student: mockStudent,
            parent: { id: 'parent-id', full_name: 'Test Parent' },
            relationship: { id: 'rel-id', relationship_type: 'mother' }
          }
        }
      });

      render(
        <TestWrapper>
          <NewStudentPage />
        </TestWrapper>
      );

      // Switch to "With Parent" mode
      const withParentRadio = screen.getByLabelText('With Parent');
      await user.click(withParentRadio);

      // Verify parent section appears
      expect(screen.getByText('Parent Information')).toBeInTheDocument();

      // Fill student information
      await user.type(screen.getByLabelText('Full Name'), 'Child WithParent');
      await user.type(screen.getByLabelText('Date of Birth'), '2012-08-20');

      // Fill parent information
      await user.type(screen.getByLabelText('Parent Full Name'), 'Sarah Parent');
      await user.type(screen.getByLabelText('Parent Email'), 'sarah.parent@test.com');
      await user.type(screen.getByLabelText('Parent Phone'), '+234 803 456 7890');

      // Select relationship type
      const relationshipSelect = screen.getByLabelText('Relationship');
      await user.selectOptions(relationshipSelect, 'mother');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create student/i });
      await user.click(submitButton);

      // Verify API was called correctly
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          '/students/atomic/create-with-parent',
          expect.objectContaining({
            profile_type: 'with_parent',
            parent_info: expect.objectContaining({
              parent_type: 'new',
              parent_data: expect.objectContaining({
                full_name: 'Sarah Parent',
                email: 'sarah.parent@test.com',
                relationship_type: 'mother'
              })
            })
          })
        );
      });
    });
  });

  describe('Organization Sponsored Student Creation', () => {
    it('should create an organization-sponsored student', async () => {
      const user = userEvent.setup();

      // Mock organization search
      httpClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockOrganization]
        }
      });

      // Mock student creation
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            student: mockStudent,
            organization_membership: {
              id: 'membership-id',
              membership_type: 'sponsored_student'
            }
          }
        }
      });

      render(
        <TestWrapper>
          <NewStudentPage />
        </TestWrapper>
      );

      // Switch to organization mode
      const organizationRadio = screen.getByLabelText('Organization Member');
      await user.click(organizationRadio);

      // Verify organization section appears
      expect(screen.getByText('Organization Information')).toBeInTheDocument();

      // Fill student information
      await user.type(screen.getByLabelText('Full Name'), 'Tom Sponsored');
      await user.type(screen.getByLabelText('Date of Birth'), '2011-12-10');
      await user.type(screen.getByLabelText('Email'), 'tom.sponsored@test.com');

      // Search and select organization
      const orgSearch = screen.getByPlaceholderText('Search organizations...');
      await user.type(orgSearch, 'Test Organization');

      // Wait for search results and select organization
      await waitFor(() => {
        const orgOption = screen.getByText('Test Organization');
        user.click(orgOption);
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create student/i });
      await user.click(submitButton);

      // Verify API calls
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          '/students/atomic/create-sponsored',
          expect.objectContaining({
            profile_type: 'independent',
            organization_type: 'organization',
            organization_info: expect.objectContaining({
              organization_id: 'test-org-id',
              membership_type: 'sponsored_student'
            })
          })
        );
      });
    });
  });
});

describe('Student Edit Flows', () => {
  let httpClient: any;

  beforeEach(() => {
    const { httpClient: mockHttpClient } = require('@/lib/httpClient');
    httpClient = mockHttpClient;
    vi.clearAllMocks();
  });

  describe('Basic Information Editing', () => {
    it('should update student basic information', async () => {
      const user = userEvent.setup();

      // Mock initial data fetch
      httpClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockStudent
        }
      });

      // Mock update response
      httpClient.put.mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockStudent, user: { ...mockStudent.user, full_name: 'Updated Name' } }
        }
      });

      render(
        <TestWrapper>
          <EditStudentPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Student')).toBeInTheDocument();
      });

      // Update name
      const nameField = screen.getByDisplayValue('Test Student');
      await user.clear(nameField);
      await user.type(nameField, 'Updated Name');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Verify API call
      await waitFor(() => {
        expect(httpClient.put).toHaveBeenCalledWith(
          `/students/${mockStudent.id}/basic-info`,
          expect.objectContaining({
            full_name: 'Updated Name'
          })
        );
      });
    });
  });

  describe('Relationship Management', () => {
    it('should add a new parent relationship', async () => {
      const user = userEvent.setup();

      // Mock initial data
      httpClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockStudent, relationships: [] }
        }
      });

      // Mock parent search
      httpClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ id: 'parent-id', full_name: 'Test Parent', role: 'parent' }]
        }
      });

      // Mock relationship creation
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { id: 'rel-id', relationship_type: 'father' }
        }
      });

      render(
        <TestWrapper>
          <EditStudentPage />
        </TestWrapper>
      );

      // Switch to Relationships tab
      const relationshipsTab = screen.getByRole('tab', { name: /relationships/i });
      await user.click(relationshipsTab);

      // Add new relationship
      const addButton = screen.getByRole('button', { name: /add parent/i });
      await user.click(addButton);

      // Search for parent
      const parentSearch = screen.getByPlaceholderText('Search for parents...');
      await user.type(parentSearch, 'Test Parent');

      // Select parent from results
      await waitFor(() => {
        const parentOption = screen.getByText('Test Parent');
        user.click(parentOption);
      });

      // Set relationship type
      const relationshipSelect = screen.getByLabelText('Relationship Type');
      await user.selectOptions(relationshipSelect, 'father');

      // Save relationship
      const saveRelButton = screen.getByRole('button', { name: /add relationship/i });
      await user.click(saveRelButton);

      // Verify API call
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          `/students/${mockStudent.id}/relationships`,
          expect.objectContaining({
            parent_id: 'parent-id',
            relationship_type: 'father'
          })
        );
      });
    });
  });
});

describe('Payment Override Integration', () => {
  let httpClient: any;

  beforeEach(() => {
    const { httpClient: mockHttpClient } = require('@/lib/httpClient');
    httpClient = mockHttpClient;
    vi.clearAllMocks();
  });

  describe('PaymentOverrideCard Component', () => {
    it('should display payment override information', async () => {
      // Mock payment status API
      httpClient.get.mockResolvedValueOnce({
        data: mockPaymentStatus
      });

      render(
        <TestWrapper>
          <PaymentOverrideCard
            studentId="test-student-id"
            studentName="Test Student"
            courseId="test-course-id"
            baseAmount={10000}
            showCalculation={true}
          />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Payment Information')).toBeInTheDocument();
      });

      // Verify override badge is shown
      expect(screen.getByText('Override Active')).toBeInTheDocument();

      // Verify sponsoring organization is displayed
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
      expect(screen.getByText('sponsored_student')).toBeInTheDocument();

      // Verify payment type
      expect(screen.getByText('organization')).toBeInTheDocument();
    });

    it('should calculate payment breakdown when requested', async () => {
      const user = userEvent.setup();

      // Mock payment status
      httpClient.get.mockResolvedValueOnce({
        data: mockPaymentStatus
      });

      // Mock payment calculation
      httpClient.post.mockResolvedValueOnce({
        data: {
          payer_type: 'organization',
          primary_payer_id: 'test-org-id',
          payment_breakdown: [
            {
              payer_id: 'test-org-id',
              payer_type: 'organization',
              payer_name: 'Test Organization',
              amount: 10000,
              percentage: 100,
              reason: 'Full sponsorship coverage'
            }
          ],
          total_amount: 10000,
          override_reason: 'Organization covers 100% of fees'
        }
      });

      render(
        <TestWrapper>
          <PaymentOverrideCard
            studentId="test-student-id"
            courseId="test-course-id"
            baseAmount={10000}
            showCalculation={true}
          />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Payment Information')).toBeInTheDocument();
      });

      // Click calculate payment button
      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      // Verify calculation API was called
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          '/organizations/payment-overrides/calculate-payment',
          {
            student_id: 'test-student-id',
            course_id: 'test-course-id',
            base_amount: 10000
          }
        );
      });

      // Verify payment breakdown is displayed
      await waitFor(() => {
        expect(screen.getByText('Payment Breakdown')).toBeInTheDocument();
        expect(screen.getByText('₦10,000')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });
  });
});

describe('Form Validation', () => {
  it('should validate email format', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <NewStudentPage />
      </TestWrapper>
    );

    // Enter invalid email
    const emailField = screen.getByLabelText('Email');
    await user.type(emailField, 'invalid-email');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /create student/i });
    await user.click(submitButton);

    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should validate phone number format', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <NewStudentPage />
      </TestWrapper>
    );

    // Enter invalid phone
    const phoneField = screen.getByLabelText('Phone');
    await user.type(phoneField, '123');

    // Blur field to trigger validation
    await user.tab();

    // Check for phone validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <NewStudentPage />
      </TestWrapper>
    );

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /create student/i });
    await user.click(submitButton);

    // Check for required field errors
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    });
  });
});

describe('Error Handling', () => {
  let httpClient: any;

  beforeEach(() => {
    const { httpClient: mockHttpClient } = require('@/lib/httpClient');
    httpClient = mockHttpClient;
    vi.clearAllMocks();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    httpClient.post.mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestWrapper>
        <NewStudentPage />
      </TestWrapper>
    );

    // Fill required fields
    await user.type(screen.getByLabelText('Full Name'), 'Test Student');
    await user.type(screen.getByLabelText('Date of Birth'), '2010-05-15');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create student/i });
    await user.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create student/i)).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();

    // Mock network error
    httpClient.post.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <TestWrapper>
        <NewStudentPage />
      </TestWrapper>
    );

    // Fill and submit form
    await user.type(screen.getByLabelText('Full Name'), 'Test Student');
    await user.type(screen.getByLabelText('Date of Birth'), '2010-05-15');

    const submitButton = screen.getByRole('button', { name: /create student/i });
    await user.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});