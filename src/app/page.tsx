'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/services/session';
import { initDatabase } from '@/utils/dexie';
import { log, error } from '@/utils/log';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useSession();

  useEffect(() => {
    async function initialize() {
      try {
        log('App', 'Initializing application');
        
        // Dexie initialisieren
        await initDatabase();
        
        // Auth-Status prüfen
        await checkAuth();
        
        log('App', 'Application initialized successfully');
      } catch (err) {
        error('App', 'Failed to initialize application', err);
      }
    }

    initialize();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        log('App', 'User authenticated, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        log('App', 'User not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Imker-Webapp wird geladen...</p>
        </div>
      </div>
    );
  }

  return null;
}