'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/common/button';
import { IconButton } from '@/components/common/icon-button';
import { DashboardIcon } from '@/icons/dashboard-icon';
import { FlowsIcon } from '@/icons/flows-icon';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  isCollapsed: boolean;
}

const NAV_ITEMS: { label: string; href: string; icon: React.ComponentType }[] =
  [
    { label: 'Dashboards', href: '/dashboard', icon: DashboardIcon },
    { label: 'Flows', href: '/dashboard/flows', icon: FlowsIcon },
  ];

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-px">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        const activeClassName = isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '';
        const hoverClassName =
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

        return isCollapsed ? (
          <IconButton
            key={href}
            label={label}
            className={cn(hoverClassName, activeClassName)}
            nativeButton={false}
            render={
              <Link href={href} aria-current={isActive ? 'page' : undefined} />
            }
          >
            <Icon />
          </IconButton>
        ) : (
          <Button
            key={href}
            variant="ghost"
            className={cn(
              'label-medium justify-start gap-2 px-1.5',
              hoverClassName,
              activeClassName,
            )}
            nativeButton={false}
            render={
              <Link href={href} aria-current={isActive ? 'page' : undefined} />
            }
          >
            <Icon />
            {label}
          </Button>
        );
      })}
    </nav>
  );
}
