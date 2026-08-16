import type { ComponentProps } from 'react';

import { Button as ButtonPrimitive } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface ButtonProps extends ComponentProps<typeof ButtonPrimitive> {
  isSubmitting?: boolean;
}

export function Button({
  children,
  isSubmitting = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      disabled={disabled || isSubmitting}
      className={cn('h-10 label-large', className)}
      {...props}
    >
      {isSubmitting && <Spinner />}
      {children}
    </ButtonPrimitive>
  );
}
