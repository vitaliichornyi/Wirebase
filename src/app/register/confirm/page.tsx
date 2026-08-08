import Link from 'next/link';

import { maskEmail } from '@/lib/email';

interface RegisterConfirmPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function RegisterConfirmPage({
  searchParams,
}: RegisterConfirmPageProps) {
  const { email } = await searchParams;
  const maskedEmail = email ? maskEmail(email) : 'your email';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a confirmation link to {maskedEmail}.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
