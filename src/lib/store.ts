import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Workspace } from './schemas'

interface AuthState {
  user: User | null
  workspace: Workspace | null
  isAuthenticated: boolean
  login: (user: User, workspace: Workspace) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      workspace: null,
      isAuthenticated: false,
      login: (user, workspace) => {
        set({ user, workspace, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, workspace: null, isAuthenticated: false })
      },
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      }
    }),
    {
      name: 'imker-auth-storage'
    }
  )
)

interface AppState {
  isOffline: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
  lastSync: Date | null
  setOfflineStatus: (offline: boolean) => void
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void
  setLastSync: (date: Date) => void
}

export const useAppStore = create<AppState>((set) => ({
  isOffline: false,
  syncStatus: 'idle',
  lastSync: null,
  setOfflineStatus: (offline) => set({ isOffline: offline }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSync: (date) => set({ lastSync: date })
}))

interface ScanState {
  isScanning: boolean
  scanMode: 'qr' | 'nfc' | 'manual'
  setScanMode: (mode: 'qr' | 'nfc' | 'manual') => void
  setScanning: (scanning: boolean) => void
}

export const useScanStore = create<ScanState>((set) => ({
  isScanning: false,
  scanMode: 'qr',
  setScanMode: (mode) => set({ scanMode: mode }),
  setScanning: (scanning) => set({ isScanning: scanning })
}))