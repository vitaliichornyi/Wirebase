import Link from 'next/link';

import { LoginForm } from './login-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and password to access your account.
        </p>

        <LoginForm />

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
