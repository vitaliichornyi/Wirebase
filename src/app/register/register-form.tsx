'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  registerUser,
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth';
import { TextField } from '@/shared/ui/text-field';
import { Button } from '@/shared/ui/button';
import { Alert } from '@/shared/ui/alert';
import { maskEmail } from '@/shared/lib/email';

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await registerUser(values);
    if (error) {
      setServerError(error);
      return;
    }
    router.push(
      `/register/confirm?email=${encodeURIComponent(maskEmail(values.email))}`,
    );
  });

  return (
    <>
      {serverError && (
        <div className="mt-4">
          <Alert message={serverError} />
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-3">
          <TextField
            control={control}
            name="email"
            label="Email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
          />
          <TextField
            control={control}
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" isSubmitting={isSubmitting} size="large">
          Create account
        </Button>
      </form>
    </>
  );
}
