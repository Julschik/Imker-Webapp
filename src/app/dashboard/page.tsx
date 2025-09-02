'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/services/session';
import { log } from '@/utils/log';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useSession();

  useEffect(() => {
    if (!isAuthenticated) {
      log('Dashboard', 'User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      log('Dashboard', 'Logout error', err);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Imker-Webapp Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Willkommen, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard wird entwickelt
              </h2>
              <p className="text-gray-600 mb-6">
                Hier werden bald Aufgaben, Fristen und Schnellaktionen angezeigt.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✅ Projekt-Skeleton erstellt</p>
                <p>✅ Dexie-Datenbank initialisiert</p>
                <p>✅ Auth-Service (Mock) implementiert</p>
                <p>⏳ Nächster Schritt: Scan-Screen</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}