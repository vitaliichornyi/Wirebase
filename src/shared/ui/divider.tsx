import type { ComponentProps } from 'react';

import { Separator } from '@/shared/ui/primitives/separator';

export function Divider(props: ComponentProps<typeof Separator>) {
  return <Separator {...props} />;
}
