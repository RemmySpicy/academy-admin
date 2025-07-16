/**
 * Payments Feature Types
 */

// Payment types
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  description: string;
  dueDate: string;
  paidDate?: string;
  invoiceId?: string;
  programId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCreate {
  studentId: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: string;
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  programId: string;
}

export interface PaymentUpdate {
  amount?: number;
  status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  description?: string;
  dueDate?: string;
  paidDate?: string;
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  programId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceCreate {
  studentId: string;
  items: Omit<InvoiceItem, 'id'>[];
  dueDate: string;
  programId: string;
}

// Payment method types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  name: string;
  isEnabled: boolean;
  processingFee?: number;
  description?: string;
}

// Payment statistics
export interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  pendingAmount: number;
  monthlyRevenue: number;
  paymentRate: number;
  revenueGrowth: number;
  paymentsByMethod: Record<string, number>;
  recentPayments: Payment[];
}

// Transaction types
export interface Transaction {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  reference?: string;
  processedAt?: string;
  createdAt: string;
}