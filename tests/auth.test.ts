import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/auth';

// Mock fetch
global.fetch = vi.fn();

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV für Tests
    process.env.NODE_ENV = 'test';
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['editor'],
        twofaEnabled: false,
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should throw error on failed login', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Anmeldung fehlgeschlagen');
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['editor'],
        twofaEnabled: true,
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await authService.getCurrentUser();
      expect(result).toEqual(mockUser);
    });
  });
});