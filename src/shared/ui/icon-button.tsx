'use client';

import type { ComponentProps } from 'react';

import { Button as ButtonPrimitive } from '@/shared/ui/primitives/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/primitives/tooltip';

interface IconButtonProps extends ComponentProps<typeof ButtonPrimitive> {
  label: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export function IconButton({
  label,
  tooltipSide = 'right',
  variant = 'ghost',
  size = 'icon',
  ...props
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ButtonPrimitive
            variant={variant}
            size={size}
            aria-label={label}
            {...props}
          />
        }
      />
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  );
}
