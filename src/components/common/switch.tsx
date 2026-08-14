'use client';

import type { ComponentProps } from 'react';

import { Switch as SwitchPrimitive } from '@/components/ui/switch';

export function Switch(props: ComponentProps<typeof SwitchPrimitive>) {
  return <SwitchPrimitive {...props} />;
}
