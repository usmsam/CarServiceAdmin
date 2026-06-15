import api from './axios.instance';
import { User } from '@/store/user.store';

export const AuthService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/backoffice/auth/me');
    return data;
  },
  // In a real app, login via bot might just send token via URL,
  // but if we need a login endpoint:
  login: async (credentials: { username: string; password: string }) => {
    const { data } = await api.post('/backoffice/auth/login', credentials);
    return data;
  }
};
