'use client';

import type { ComponentProps } from 'react';

import { Tooltip } from '@/shared/ui/tooltip';
import { Button as ButtonPrimitive } from '@/shared/ui/primitives/button';

type IconButtonSize = 'sm' | 'md';

interface IconButtonProps extends Omit<
  ComponentProps<typeof ButtonPrimitive>,
  'size'
> {
  label: string;
  size?: IconButtonSize;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

const ICON_BUTTON_SIZE_MAP: Record<IconButtonSize, 'icon-sm' | 'icon'> = {
  sm: 'icon-sm',
  md: 'icon',
};

export function IconButton({
  label,
  tooltipSide = 'right',
  variant = 'ghost',
  size = 'md',
  ...props
}: IconButtonProps) {
  return (
    <Tooltip label={label} side={tooltipSide}>
      <ButtonPrimitive
        className="cursor-pointer"
        variant={variant}
        size={ICON_BUTTON_SIZE_MAP[size]}
        aria-label={label}
        {...props}
      />
    </Tooltip>
  );
}
