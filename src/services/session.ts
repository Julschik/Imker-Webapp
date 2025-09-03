import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, authService } from './auth';
import { log, error } from '@/utils/log';

interface SessionState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, totpCode?: string) => {
        try {
          set({ isLoading: true });
          log('Session', 'Login attempt for', email);
          
          const user = await authService.login({ email, password, totpCode });
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          log('Session', 'Login successful, user set in session');
        } catch (err) {
          error('Session', 'Login failed', err);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        try {
          log('Session', 'Logout initiated');
          await authService.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          log('Session', 'Logout completed, session cleared');
        } catch (err) {
          error('Session', 'Logout error', err);
          // Session trotzdem lokal löschen
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          log('Session', 'Checking authentication status');
          
          const user = await authService.getCurrentUser();
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            log('Session', 'User authenticated', user.id);
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            log('Session', 'User not authenticated');
          }
        } catch (err) {
          error('Session', 'Auth check failed', err);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'imker-session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);