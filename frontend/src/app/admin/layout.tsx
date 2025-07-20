import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RouteGuard } from '@/features/authentication/components/RouteGuard';
import { PageHeaderProvider } from '@/contexts/PageHeaderContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <PageHeaderProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </PageHeaderProvider>
    </RouteGuard>
  );
}