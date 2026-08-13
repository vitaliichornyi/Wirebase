import type { ComponentProps } from 'react';

import { Badge as BadgePrimitive } from '@/components/ui/badge';

export function Badge(props: ComponentProps<typeof BadgePrimitive>) {
  return <BadgePrimitive {...props} />;
}
