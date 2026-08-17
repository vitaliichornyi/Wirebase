import { Logo } from '@/shared/ui/logo';
import { Headline } from '@/shared/ui/headline';
import { LoginForm } from './login-form';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6">
      <Logo variant="full" className="absolute top-6 left-6" />
      <div className="w-full max-w-sm mb-6">
        <Headline as="h1" variant="large" className="pb-2">
          Login to Wirebase
        </Headline>
        <p className="body-medium text-muted-foreground">
          Enter your email and password to access your account.
        </p>
        <LoginForm />
        <p className="mt-4 text-center body-medium text-muted-foreground">
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
