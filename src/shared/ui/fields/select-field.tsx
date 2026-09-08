'use client';

import { cn } from '@/shared/lib/utils';

import type { ReactNode } from 'react';

import {
  Select as SelectPrimitive,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';

export interface SelectFieldOption {
  value: string;
  label: ReactNode;
}

interface SelectFieldProps {
  options: SelectFieldOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label': string;
}

export function SelectField({
  options,
  value,
  onValueChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: SelectFieldProps) {
  return (
    <SelectPrimitive
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue);
      }}
    >
      <SelectTrigger
        className="min-w-20 max-w-80 border-transparent bg-input-background has-[[data-slot=input-group-control]:focus-visible]:bg-background dark:bg-input-background/30"
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn('w-full min-w-20 max-w-80', className)}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive>
  );
}
