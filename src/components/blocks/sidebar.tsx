'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cable,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { logoutUser } from '@/actions/auth';
import { Button } from '@/components/elements/button';
import { IconButton } from '@/components/elements/icon-button';
import { UserAvatar } from '@/components/elements/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Dashboards', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Flows', href: '/dashboard/flows', icon: Cable },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleToggleCollapsed = () => setIsCollapsed((previous) => !previous);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutUser();
    router.push('/');
  };

  const ArrowIcon = isCollapsed ? ChevronRight : ChevronLeft;

  return (
    <aside
      data-collapsed={isCollapsed}
      className="flex h-screen w-14 shrink-0 flex-col justify-between border-r border-border bg-background transition-[width] duration-200 data-[collapsed=false]:w-56"
    >
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={handleToggleCollapsed}
          className="group/logo relative mx-2 mt-2 size-10 shrink-0"
        >
          <Zap className="size-5 transition-opacity group-hover/logo:opacity-0" />
          <ArrowIcon className="absolute size-5 opacity-0 transition-opacity group-hover/logo:opacity-100" />
        </Button>

        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            const activeClassName = isActive ? 'bg-muted text-foreground' : '';

            return isCollapsed ? (
              <IconButton
                key={href}
                label={label}
                className={activeClassName}
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
                className={cn('justify-start gap-2', activeClassName)}
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
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open user menu"
          className="mx-2 mb-2 flex size-10 items-center justify-center rounded-lg outline-none hover:bg-muted focus-visible:bg-muted"
        >
          <UserAvatar />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end">
          <DropdownMenuItem disabled>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
