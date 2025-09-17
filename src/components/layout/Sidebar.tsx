'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge as cn } from 'tailwind-merge';

const items = [
  { href: '/', label: 'Dashboard' },
  { href: '/upload', label: 'Upload' },
  { href: '/review', label: 'Review' },
  { href: '/capa', label: 'CAPA' },
  { href: '/documents', label: 'Documents' },
  { href: '/export', label: 'Export' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 font-semibold">COMAR Compliance</div>
      <nav className="flex flex-col gap-1 p-2">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm hover:bg-muted',
                active && 'bg-muted font-medium'
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
