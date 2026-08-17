import { Logo } from '@/shared/ui/logo';
import { Headline } from '@/shared/ui/headline';
import Link from 'next/link';

export default async function RegisterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const maskedEmail = email || 'your email';

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6">
      <Logo variant="full" className="absolute top-6 left-6" />
      <div className="w-full max-w-sm mb-6 text-center">
        <Headline as="h1" variant="large" className="pb-2">
          Check your email
        </Headline>
        <p className="body-medium text-foreground mb-4">
          We sent a confirmation link to{' '}
          <span className="text-muted-foreground">{maskedEmail}</span>. Click
          the link in the email to activate your account.
        </p>
        <Link
          href="/"
          className="body-medium text-primary underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
