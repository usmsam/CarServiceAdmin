import api from './axios.instance';
import { User } from '@/store/user.store';

export const UsersService = {
  getUsers: async (serviceId?: string): Promise<User[]> => {
    const { data } = await api.get('/users', { params: { serviceId } });
    return data;
  },
  updateUserRole: async (id: string, role: string): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, { role });
    return data;
  }
};
