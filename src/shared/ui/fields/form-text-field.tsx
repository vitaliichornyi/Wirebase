'use client';

import type { ComponentProps } from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { TextField } from '@/shared/ui/fields/text-field';

interface FormTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  size?: ComponentProps<typeof TextField>['size'];
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function FormTextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  size = 'large',
  type = 'text',
  placeholder,
  autoComplete,
  prefix,
  suffix,
}: FormTextFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          id={name}
          label={label}
          size={size}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          prefix={prefix}
          suffix={suffix}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
