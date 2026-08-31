import type { ComponentProps } from 'react';

import { Button as ButtonPrimitive } from '@/shared/ui/primitives/button';
import { Spinner } from '@/shared/ui/primitives/spinner';
import { cn } from '@/shared/lib/utils';

type ButtonSize = 'default' | 'large';

interface ButtonProps extends Omit<
  ComponentProps<typeof ButtonPrimitive>,
  'size'
> {
  isSubmitting?: boolean;
  size?: ButtonSize;
}

const buttonSizeClasses: Record<ButtonSize, string> = {
  default: '',
  large: 'h-10 label-large',
};

export function Button({
  children,
  size = 'default',
  isSubmitting = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      disabled={disabled || isSubmitting}
      className={cn(buttonSizeClasses[size], className)}
      {...props}
    >
      {children}
      {isSubmitting && <Spinner />}
    </ButtonPrimitive>
  );
}
