import Link from 'next/link';
import { Logo } from './logo';

export function MobileHeader() {
  return (
    <header className="flex md:hidden items-center w-full h-16 px-6 border-b border-border">
      <Link href="/">
        <Logo variant="full" />
      </Link>
    </header>
  );
}
