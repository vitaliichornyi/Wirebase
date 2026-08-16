'use client';

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

interface TextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  prefix,
  suffix,
}: TextFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error} className="gap-1.5">
          <FieldLabel htmlFor={name} className="label-medium">
            {label}
          </FieldLabel>
          <InputGroup className="h-10 overflow-hidden border-transparent bg-input-background has-[[data-slot=input-group-control]:focus-visible]:bg-background dark:bg-input-background/30">
            {prefix && (
              <InputGroupAddon align="inline-start" className="body-medium">
                {prefix}
              </InputGroupAddon>
            )}
            <InputGroupInput
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              aria-invalid={!!fieldState.error}
              className="h-full body-medium"
            />
            {suffix && (
              <InputGroupAddon align="inline-end" className="body-medium">
                {suffix}
              </InputGroupAddon>
            )}
          </InputGroup>
          <FieldError
            className="label-medium"
            errors={fieldState.error ? [fieldState.error] : undefined}
          />
        </Field>
      )}
    />
  );
}
