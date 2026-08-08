import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl font-bold">Wirebase</h1>
      <Link
        href="/register"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Create account
      </Link>
    </main>
  );
}
