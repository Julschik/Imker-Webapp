import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OfflineBanner } from '@/components/ui/offline-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Imker-Webapp',
  description: 'Offline-first Betriebsführung für Imker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <h1 className="text-xl font-semibold text-gray-900">
                Imker-Webapp
              </h1>
              <OfflineBanner />
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}