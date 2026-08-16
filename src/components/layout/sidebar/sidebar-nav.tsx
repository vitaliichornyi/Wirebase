import { DashboardIcon } from '@/icons/dashboard-icon';
import { FlowsIcon } from '@/icons/flows-icon';
import { NavItem } from './nav-item';

interface SidebarNavProps {
  isCollapsed: boolean;
}

const NAV_ITEMS: { label: string; href: string; icon: React.ComponentType }[] =
  [
    { label: 'Dashboards', href: '/dashboard', icon: DashboardIcon },
    { label: 'Flows', href: '/dashboard/flows', icon: FlowsIcon },
  ];

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-px">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
      ))}
    </nav>
  );
}
