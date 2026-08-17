import { Sidebar } from '@/shared/ui/sidebar/sidebar';

interface AppShellProps {
  children: React.ReactNode;
  sidebarFooter: React.ReactNode;
}

export function AppShell({ children, sidebarFooter }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar footer={sidebarFooter} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
