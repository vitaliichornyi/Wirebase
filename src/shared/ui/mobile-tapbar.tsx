'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/shared/lib/constants';
import { FLOW_CANVAS_PATTERN } from '@/shared/lib/constants';

import Link from 'next/link';

export function MobileTapbar() {
  const pathname = usePathname();

  if (FLOW_CANVAS_PATTERN.test(pathname)) {
    return null;
  }

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-card/90 backdrop-blur-md z-20">
      <ul className="grid grid-cols-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <Link
              className={`flex flex-col items-center gap-1 px-6 py-3 text-xs  
                ${pathname === href ? 'font-semibold' : 'text-muted-foreground font-normal'}
                `}
              href={href}
            >
              <Icon />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
