import api from './axios.instance';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  vehicleId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
  serviceId: string;
}

export const OrdersService = {
  getOrders: async (serviceId?: string): Promise<Order[]> => {
    const { data } = await api.get('/orders', { params: { serviceId } });
    return data;
  },
  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return data;
  }
};
