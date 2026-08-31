import { Logo } from '@/shared/ui/logo';
import { Headline } from '@/shared/ui/headline';
import { RegisterForm } from '@/features/auth';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6">
      <Logo variant="full" className="absolute top-6 left-6" />
      <div className="w-full max-w-sm mb-6">
        <Headline as="h1" variant="headline" size="large" className="pb-2">
          Create account
        </Headline>
        <p className="body-medium text-muted-foreground">
          Enter your email and password to start using the platform.
        </p>
        <RegisterForm />
        <p className="mt-4 text-center body-medium text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
