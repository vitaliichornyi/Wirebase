import type { ComponentProps, ReactNode } from 'react';

import { Field, FieldLabel, FieldError } from '@/shared/ui/primitives/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/primitives/input-group';
import { CopyButton } from '@/shared/ui/copy-button';
import { cn } from '@/shared/lib/utils';

type TextFieldSize = 'small' | 'large';

const textFieldSizeClasses: Record<
  TextFieldSize,
  { gap: string; height: string }
> = {
  small: { gap: 'gap-1', height: 'h-8' },
  large: { gap: 'gap-1.5', height: 'h-10' },
};

interface TextFieldProps extends Omit<
  ComponentProps<'input'>,
  'prefix' | 'size'
> {
  id: string;
  label?: string;
  size?: TextFieldSize;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  copyable?: boolean;
}

export function TextField({
  id,
  label,
  size = 'small',
  error,
  prefix,
  suffix,
  copyable = false,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field data-invalid={!!error} className={textFieldSizeClasses[size].gap}>
      {label && (
        <FieldLabel htmlFor={id} className="label-medium">
          {label}
        </FieldLabel>
      )}
      <InputGroup
        className={cn(
          textFieldSizeClasses[size].height,
          'overflow-hidden border-transparent bg-input-background has-[[data-slot=input-group-control]:focus-visible]:bg-background dark:bg-input-background/30',
        )}
      >
        {prefix && (
          <InputGroupAddon align="inline-start" className="body-medium">
            {prefix}
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          aria-invalid={!!error}
          className={cn('h-full body-medium', className)}
          {...props}
        />
        {copyable ? (
          <InputGroupAddon align="inline-end">
            <CopyButton
              value={`${typeof prefix === 'string' ? prefix : ''}${props.value != null ? String(props.value) : ''}`}
              disabled={props.disabled}
            />
          </InputGroupAddon>
        ) : (
          suffix && (
            <InputGroupAddon align="inline-end" className="body-medium">
              {suffix}
            </InputGroupAddon>
          )
        )}
      </InputGroup>
      <FieldError
        className="label-medium"
        errors={error ? [{ message: error }] : undefined}
      />
    </Field>
  );
}
