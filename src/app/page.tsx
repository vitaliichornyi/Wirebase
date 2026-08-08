'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginUser } from '@/actions/auth';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import { TextField } from '@/components/elements/fields/text-field';
import { Button } from '@/components/elements/buttons/button';
import { Alert } from '@/components/elements/feedback/alert';

export default function Home() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and password to access your account.
        </p>

        {serverError && (
          <div className="mt-4">
            <Alert message={serverError} />
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
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

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
