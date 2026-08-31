import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

type HeadlineElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadlineVariant = 'display' | 'headline' | 'title';
type HeadlineSize = 'large' | 'medium' | 'small';

interface HeadlineProps extends ComponentProps<'h1'> {
  as?: HeadlineElement;
  variant?: HeadlineVariant;
  size?: HeadlineSize;
}

export function Headline({
  as: Component = 'h1',
  variant = 'headline',
  size = 'medium',
  className,
  ...props
}: HeadlineProps) {
  return (
    <Component className={cn(`${variant}-${size}`, className)} {...props} />
  );
}
