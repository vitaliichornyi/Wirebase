import type { ComponentProps } from 'react';

import { Badge as BadgePrimitive } from '@/shared/ui/primitives/badge';

export function Badge(props: ComponentProps<typeof BadgePrimitive>) {
  return <BadgePrimitive {...props} />;
}
