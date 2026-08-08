import type { ComponentProps } from 'react';

import { Button as ButtonPrimitive } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ButtonProps extends ComponentProps<typeof ButtonPrimitive> {
  isSubmitting?: boolean;
}

export function Button({
  children,
  isSubmitting = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive disabled={disabled || isSubmitting} {...props}>
      {isSubmitting && <Spinner />}
      {children}
    </ButtonPrimitive>
  );
}
