import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientOnly } from '@/components/client-only';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CCIP Widget Examples',
  description: 'View CCIP Widgets',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen`}>
        <nav className="flex flex-col border-r border-r-slate-300 p-6 space-y-4 bg-white text-center">
          <Link
            className="border border-slate-300 rounded-md p-2 hover:bg-slate-300 transition-colors"
            href="/"
          >
            Default
          </Link>
          <Link
            className="border border-slate-300 rounded-md p-2 hover:bg-slate-300 transition-colors"
            href="/drawer"
          >
            Drawer
          </Link>
          <Link
            className="border border-slate-300 rounded-md p-2 hover:bg-slate-300 transition-colors"
            href="/ccip-js"
          >
            CCIP-JS
          </Link>
        </nav>
        <main className="flex flex-col items-center justify-center bg-slate-100 grow">
          <ClientOnly>{children}</ClientOnly>
        </main>
      </body>
    </html>
  );
}
