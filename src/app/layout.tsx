import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'COMAR Compliance Tool',
  description: 'Local-mode COMAR audit + CAPA assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <header className="flex items-center justify-between border-b px-6 py-3">
              <div className="text-base font-medium">COMAR Compliance Tool</div>
              <span className="rounded-full border px-2 py-1 text-xs">
                Local Mode (Browser Storage)
              </span>
            </header>
            <div className="p-6">{children}</div>
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
import Link from "next/link";

// Example sidebar link
<Link href="/review" className="hover:underline">
  Review
</Link>
