import api from './axios.instance';
import { User } from '@/store/user.store';

export const UsersService = {
  getUsers: async (stationId?: string): Promise<User[]> => {
    const { data } = await api.get('/users', { params: { stationId } });
    return data;
  },
  updateUserRole: async (id: string, role: string): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, { role });
    return data;
  }
};
