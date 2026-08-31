'use client';

import type { ReactElement, ReactNode } from 'react';

import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/primitives/tooltip';

interface TooltipProps {
  label: ReactNode;
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  label,
  children,
  side = 'top',
  open,
  onOpenChange,
}: TooltipProps) {
  return (
    <TooltipPrimitive open={open} onOpenChange={onOpenChange} disableHoverablePopup>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>{label}</TooltipContent>
    </TooltipPrimitive>
  );
}
