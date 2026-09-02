'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';

import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import { buttonVariants } from '@/shared/ui/primitives/button';

export interface DropdownMenuAction {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  href?: string;
  onClick?: () => void;
}

interface DropdownMenuProps {
  actions: DropdownMenuAction[];
  triggerLabel?: string;
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenu({
  actions,
  triggerLabel = 'More options',
  align = 'end',
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive>
      <DropdownMenuTrigger
        aria-label={triggerLabel}
        className={buttonVariants({ variant: 'ghost', size: 'icon' })}
      >
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {actions.map((action) =>
          action.href ? (
            <DropdownMenuItem
              key={action.key}
              disabled={action.disabled}
              variant={action.variant}
              nativeButton={false}
              render={<Link href={action.href} />}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={action.key}
              disabled={action.disabled}
              variant={action.variant}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}
