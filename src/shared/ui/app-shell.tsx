import { Sidebar } from '@/shared/ui/sidebar/sidebar';
import { MobileHeader } from './mobile-header';
import { MobileTapbar } from './mobile-tapbar';

interface AppShellProps {
  children: React.ReactNode;
  sidebarFooter: React.ReactNode;
}

export function AppShell({ children, sidebarFooter }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MobileHeader />
      <div className="flex flex-row flex-1 min-h-0">
        <Sidebar footer={sidebarFooter} />
        <main className="flex-1 overflow-y-auto overflow-x-scroll pb-24 md:pb-0">
          {children}
        </main>
      </div>
      <MobileTapbar />
    </div>
  );
}
