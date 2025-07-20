'use client';

import { PaymentManagement } from '@/features/payments';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';

/**
 * Payments Management Page
 * 
 * Comprehensive payment management interface
 */
export default function PaymentsPage() {
  usePageTitle('Payments Management', 'Track payments, invoices, and financial reporting');
  
  return (
    <div className="space-y-6">
      {/* Main Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Receipt className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <PaymentManagement />
    </div>
  );
}