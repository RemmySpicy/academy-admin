'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProtectedRoute } from '@/features/authentication/components/ProtectedRoute';
import { usePageHeader } from '@/contexts/PageHeaderContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({ children, title, description, headerActions }: DashboardLayoutProps) {
  const { title: contextTitle, description: contextDescription } = usePageHeader();
  
  // Use context values if available, otherwise fall back to props
  const displayTitle = contextTitle || title;
  const displayDescription = contextDescription || description;
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header title={displayTitle} description={displayDescription}>
            {headerActions}
          </Header>
          
          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}