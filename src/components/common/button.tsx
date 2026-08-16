import type { ComponentProps } from 'react';

import { Button as ButtonPrimitive } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type ButtonSize = 'default' | 'large';

interface ButtonProps
  extends Omit<ComponentProps<typeof ButtonPrimitive>, 'size'> {
  isSubmitting?: boolean;
  size?: ButtonSize;
}

const buttonSizeClasses: Record<ButtonSize, string> = {
  default: '',
  large: 'h-10 label-large',
};

export function Button({
  children,
  isSubmitting = false,
  disabled,
  className,
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      disabled={disabled || isSubmitting}
      className={cn(buttonSizeClasses[size], className)}
      {...props}
    >
      {isSubmitting && <Spinner />}
      {children}
    </ButtonPrimitive>
  );
}
