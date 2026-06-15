import api from './axios.instance';
import { Role } from '@/store/user.store';

type RefEntity =
  | {
      _id?: string;
      fullName?: string;
      phone?: string;
      username?: string;
      name?: string;
      address?: string;
    }
  | string
  | null;

export interface AdminUser {
  _id: string;
  telegramId?: string;
  username?: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: Role;
  stationId?: RefEntity;
  language?: string;
  status?: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  lastTelegramLoginAt?: string;
  isActive?: boolean;
  hasCredentials?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersSearchFilters {
  stationId?: string;
  id?: string;
  telegramId?: string;
  phone?: string;
}

export const UsersService = {
  getUsers: async (filters?: UsersSearchFilters): Promise<AdminUser[]> => {
    const { data } = await api.get('/backoffice/users', {
      params: filters,
    });
    return data;
  },
  getUserById: async (id: string): Promise<AdminUser> => {
    const { data } = await api.get(`/backoffice/users/${id}`);
    return data;
  },
  updateUserRole: async (id: string, role: Role): Promise<AdminUser> => {
    const { data } = await api.patch(`/backoffice/users/${id}`, { role });
    return data;
  }
};
