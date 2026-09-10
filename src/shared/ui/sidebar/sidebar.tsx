'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FLOW_CANVAS_PATTERN } from '@/shared/lib/constants';

import { SidebarHeader } from './sidebar-header';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
  footer: React.ReactNode;
}

export function Sidebar({ footer }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  if (FLOW_CANVAS_PATTERN.test(pathname)) {
    return null;
  }

  return (
    <aside
      className="hidden md:flex flex-col justify-between shrink-0 h-full w-12 data-[collapsed=false]:w-56 bg-sidebar text-sidebar-foreground transition-[width] duration-200"
      data-collapsed={isCollapsed}
    >
      <div className="flex flex-col gap-8 px-2 py-3">
        <SidebarHeader isCollapsed={isCollapsed} onClick={setIsCollapsed} />
        <SidebarNav isCollapsed={isCollapsed} />
      </div>
      {footer}
    </aside>
  );
}
