'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { cn } from '@/shared/lib/utils';

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ComponentType;
  isCollapsed: boolean;
}

export function NavItem({
  label,
  href,
  icon: Icon,
  isCollapsed,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const activeClassName = isActive
    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
    : '';
  const hoverClassName =
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';
  const render = (
    <Link href={href} aria-current={isActive ? 'page' : undefined} />
  );

  return isCollapsed ? (
    <IconButton
      label={label}
      className={cn(hoverClassName, activeClassName)}
      nativeButton={false}
      render={render}
    >
      <Icon />
    </IconButton>
  ) : (
    <Button
      variant="ghost"
      className={cn(
        'label-medium justify-start gap-2 px-1.5',
        hoverClassName,
        activeClassName,
      )}
      nativeButton={false}
      render={render}
    >
      <Icon />
      {label}
    </Button>
  );
}
