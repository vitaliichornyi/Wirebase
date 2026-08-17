import { UserMenu } from '@/features/auth';
import { AppShell } from '@/shared/ui/app-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell sidebarFooter={<UserMenu />}>{children}</AppShell>;
}
