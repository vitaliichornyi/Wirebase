import { NavItem } from './nav-item';
import { NAV_ITEMS } from '@/shared/lib/constants';

interface SidebarNavProps {
  isCollapsed: boolean;
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-px">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
      ))}
    </nav>
  );
}
