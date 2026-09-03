'use client';

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
  contentClassName?: string;
  'aria-label': string;
}

export function SelectField({
  options,
  value,
  onValueChange,
  placeholder,
  contentClassName,
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
        className="border-transparent bg-input-background has-[[data-slot=input-group-control]:focus-visible]:bg-background dark:bg-input-background/30"
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive>
  );
}
