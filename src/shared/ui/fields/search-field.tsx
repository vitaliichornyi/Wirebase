'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/primitives/input-group';

import { SearchIcon } from '../icons/search-icon';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label': string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: SearchFieldProps) {
  return (
    <InputGroup className="h-8 w-56 border-transparent bg-input-background has-[[data-slot=input-group-control]:focus-visible]:bg-background dark:bg-input-background/30">
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </InputGroup>
  );
}
