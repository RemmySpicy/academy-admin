import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RouteGuard } from '@/features/authentication/components/RouteGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </RouteGuard>
  );
}