'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/shared/lib/constants';
import { FLOW_CANVAS_PATTERN } from '@/shared/lib/constants';

export function MobileTapbar() {
  const pathname = usePathname();

  if (FLOW_CANVAS_PATTERN.test(pathname)) {
    return null;
  }

  return (
    <div className="fixed md:hidden bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-100">
      <nav className="px-1 py-1 rounded-full bg-card/90 backdrop-blur-md shadow-md">
        <ul className="grid grid-cols-2 gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <Link
                className={`flex flex-col items-center gap-1 px-4 py-2 label-small hover:bg-muted rounded-full
                ${pathname === href ? 'bg-muted' : ''}
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
    </div>
  );
}
