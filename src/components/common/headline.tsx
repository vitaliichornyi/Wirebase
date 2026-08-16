import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type HeadlineElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadlineVariant = 'large' | 'medium';

interface HeadlineProps extends ComponentProps<'h1'> {
  as?: HeadlineElement;
  variant?: HeadlineVariant;
}

const headlineVariantClasses: Record<HeadlineVariant, string> = {
  large: 'headline-large',
  medium: 'headline-medium',
};

export function Headline({
  as: Component = 'h1',
  variant = 'medium',
  className,
  ...props
}: HeadlineProps) {
  return (
    <Component
      className={cn(headlineVariantClasses[variant], className)}
      {...props}
    />
  );
}
