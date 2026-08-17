'use client';

import type { ComponentProps } from 'react';

import { Switch as SwitchPrimitive } from '@/shared/ui/primitives/switch';

export function Switch(props: ComponentProps<typeof SwitchPrimitive>) {
  return <SwitchPrimitive {...props} />;
}
