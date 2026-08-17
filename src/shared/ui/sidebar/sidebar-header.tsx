import { Logo } from '@/shared/ui/logo';
import { SidebarIcon } from '@/shared/ui/icons/sidebar-icon';
import { SidebarCollapseIcon } from '@/shared/ui/icons/sidebar-collapse-icon';
import { SidebarExpandIcon } from '@/shared/ui/icons/sidebar-expand-icon';
import { IconButton } from '@/shared/ui/icon-button';
import Link from 'next/link';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onClick: (value: boolean) => void;
}

export function SidebarHeader({ isCollapsed, onClick }: SidebarHeaderProps) {
  return (
    <div className="flex justify-between">
      {isCollapsed ? (
        <IconButton
          className="relative group/logo hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          label="Open sidebar"
          onClick={() => onClick(false)}
        >
          <div className="transition-opacity group-hover/logo:opacity-0">
            <Logo />
          </div>
          <div className="absolute size-6 inset-0 m-auto opacity-0 transition-opacity group-hover/logo:opacity-100">
            <SidebarExpandIcon />
          </div>
        </IconButton>
      ) : (
        <>
          <Link className="p-0.75" href="/">
            <Logo variant="full" />
          </Link>
          <IconButton
            className="relative group/logo"
            label="Close sidebar"
            onClick={() => onClick(true)}
          >
            <div className="transition-opacity group-hover/logo:opacity-0">
              <SidebarIcon />
            </div>
            <div className="absolute size-6 inset-0 m-auto opacity-0 transition-opacity group-hover/logo:opacity-100">
              <SidebarCollapseIcon />
            </div>
          </IconButton>
        </>
      )}
    </div>
  );
}
