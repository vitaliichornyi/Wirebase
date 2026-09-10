import { Logo } from './logo';

export function MobileHeader() {
  return (
    <header className="flex md:hidden items-center w-full h-16 px-6 border-b border-border">
      <Logo variant="full" />
    </header>
  );
}
