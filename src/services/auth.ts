import { log, warn, error } from '@/utils/log';
import { config } from '@/config/env';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  twofaEnabled: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private baseUrl = config.API_BASE_URL;

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      log('AuthService', 'Attempting login for', credentials.email);
      
      // TODO: Implementierung abhängig von Auth-Provider (Keycloak/Ory/Supabase)
      // Für jetzt Mock-Implementation
      if (config.NODE_ENV === 'development') {
        warn('AuthService', 'Using mock authentication in development');
        
        const mockUser: AuthUser = {
          id: 'mock-user-1',
          email: credentials.email,
          name: 'Test Imker',
          roles: ['admin'],
          twofaEnabled: false
        };
        
        // Simuliere API-Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        log('AuthService', 'Mock login successful', mockUser.id);
        return mockUser;
      }

      // Produktions-Implementation folgt nach Auth-Provider-Entscheidung
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const user = await response.json();
      log('AuthService', 'Login successful', user.id);
      return user;
      
    } catch (err) {
      error('AuthService', 'Login failed', err);
      throw new Error('Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Eingaben.');
    }
  }

  async logout(): Promise<void> {
    try {
      log('AuthService', 'Logging out user');
      
      if (config.NODE_ENV === 'development') {
        warn('AuthService', 'Mock logout in development');
        return;
      }

      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      log('AuthService', 'Logout successful');
    } catch (err) {
      error('AuthService', 'Logout failed', err);
      // Logout-Fehler nicht weiterwerfen, da lokale Session trotzdem gelöscht wird
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      log('AuthService', 'Fetching current user');
      
      if (config.NODE_ENV === 'development') {
        warn('AuthService', 'Mock user check in development');
        return null; // Kein persistenter Mock-User
      }

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          log('AuthService', 'User not authenticated');
          return null;
        }
        throw new Error(`Failed to get user: ${response.status}`);
      }

      const user = await response.json();
      log('AuthService', 'Current user fetched', user.id);
      return user;
      
    } catch (err) {
      error('AuthService', 'Failed to get current user', err);
      return null;
    }
  }

  async setupTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    try {
      log('AuthService', 'Setting up 2FA');
      
      const response = await fetch(`${this.baseUrl}/auth/2fa/setup`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`2FA setup failed: ${response.status}`);
      }

      const setup = await response.json();
      log('AuthService', '2FA setup initiated');
      return setup;
      
    } catch (err) {
      error('AuthService', '2FA setup failed', err);
      throw new Error('2FA-Einrichtung fehlgeschlagen');
    }
  }

  async verifyTwoFactor(code: string): Promise<boolean> {
    try {
      log('AuthService', 'Verifying 2FA code');
      
      const response = await fetch(`${this.baseUrl}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const result = response.ok;
      log('AuthService', '2FA verification result', result);
      return result;
      
    } catch (err) {
      error('AuthService', '2FA verification failed', err);
      return false;
    }
  }
}

export const authService = new AuthService();