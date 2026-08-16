import { Headline } from '@/components/common/headline';
import Link from 'next/link';

export default async function RegisterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const maskedEmail = email || 'your email';

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm">
        <Headline as="h1" variant="large">
          Check your email
        </Headline>
        <p className="body-medium text-muted-foreground">
          We sent a confirmation link to {maskedEmail}.
        </p>
        <Link
          href="/"
          className="mt-4 body-medium text-primary underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
