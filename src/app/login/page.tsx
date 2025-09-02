'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/services/session';
import { log, error } from '@/utils/log';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    totpCode: '',
  });
  const [showTotp, setShowTotp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      log('LoginPage', 'Submitting login form');
      await login(formData.email, formData.password, formData.totpCode || undefined);
      
      log('LoginPage', 'Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err) {
      error('LoginPage', 'Login failed', err);
      setErrorMessage(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
      
      // Bei 2FA-Anforderung TOTP-Feld anzeigen
      if (err instanceof Error && err.message.includes('2FA')) {
        setShowTotp(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Imker-Webapp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Anmeldung zur Betriebsführung
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail-Adresse"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  showTotp ? '' : 'rounded-b-md'
                } focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm`}
                placeholder="Passwort"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            {showTotp && (
              <div>
                <label htmlFor="totpCode" className="sr-only">
                  2FA-Code
                </label>
                <input
                  id="totpCode"
                  name="totpCode"
                  type="text"
                  autoComplete="one-time-code"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="2FA-Code (6 Ziffern)"
                  value={formData.totpCode}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Anmeldung läuft...
                </div>
              ) : (
                'Anmelden'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}