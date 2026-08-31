'use client';

import { useState } from 'react';

import { CopyIcon } from '@/shared/ui/icons/copy-icon';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/primitives/input-group';
import { Tooltip } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';

const COPIED_TOOLTIP_DURATION_MS = 1500;

interface CopyFieldProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  prefix?: string;
  copyValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function CopyField({
  value,
  onChange,
  readOnly = false,
  prefix,
  copyValue,
  placeholder,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: CopyFieldProps) {
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyValue ?? `${prefix ?? ''}${value}`);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), COPIED_TOOLTIP_DURATION_MS);
  };

  return (
    <InputGroup className={cn('h-8 bg-input-background', className)}>
      {prefix && (
        <InputGroupAddon align="inline-start" className="body-medium pr-0">
          {prefix}
        </InputGroupAddon>
      )}
      <InputGroupInput
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly || !onChange}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="body-medium pl-0"
      />
      <InputGroupAddon align="inline-end">
        <Tooltip
          label={justCopied ? 'Copied!' : 'Copy'}
          open={justCopied ? true : undefined}
        >
          <button
            type="button"
            aria-label="Copy"
            disabled={disabled}
            onClick={handleCopy}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <CopyIcon />
          </button>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  );
}
