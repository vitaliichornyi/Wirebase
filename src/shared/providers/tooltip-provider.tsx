'use client';

import { TooltipProvider as TooltipProviderPrimitive } from '@/shared/ui/primitives/tooltip';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProviderPrimitive>{children}</TooltipProviderPrimitive>;
}
