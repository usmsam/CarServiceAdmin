import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'SUPERADMIN' | 'OWNER' | 'MANAGER' | 'MASTER' | 'CLIENT' | 'GUEST' | 'MECHANIC';

export interface User {
  _id: string;
  telegramId: number;
  username?: string;
  fullName: string;
  role: Role;
  serviceId?: string; // the service this user belongs to, if any
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  activeServiceId: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setActiveService: (serviceId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      activeServiceId: null,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, isAuthenticated: true, activeServiceId: user.serviceId || null });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, activeServiceId: null });
      },
      setActiveService: (serviceId) => set({ activeServiceId: serviceId }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
