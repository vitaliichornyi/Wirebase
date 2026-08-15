'use client';

import { useState } from 'react';
import { SidebarHeader } from './sidebar-header';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className="flex flex-col justify-between shrink-0 h-screen w-12 data-[collapsed=false]:w-56 bg-sidebar text-sidebar-foreground transition-[width] duration-200"
      data-collapsed={isCollapsed}
    >
      <div className="flex flex-col gap-8 px-2 py-3">
        <SidebarHeader isCollapsed={isCollapsed} onClick={setIsCollapsed} />
        <SidebarNav isCollapsed={isCollapsed} />
      </div>
      <UserMenu />
    </aside>
  );
}
