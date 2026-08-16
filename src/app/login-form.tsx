'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginUser } from '@/actions/auth';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import { TextField } from '@/components/common/text-field';
import { Button } from '@/components/common/button';
import { Alert } from '@/components/common/alert';

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await loginUser(values);
    if (error) {
      setServerError(error);
      return;
    }
    router.push('/dashboard');
  });

  return (
    <>
      {serverError && (
        <div className="mt-4">
          <Alert message={serverError} />
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
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
          autoComplete="current-password"
        />
        <Button type="submit" isSubmitting={isSubmitting}>
          Sign in
        </Button>
      </form>
    </>
  );
}
