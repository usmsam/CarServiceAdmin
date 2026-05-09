import api from './axios.instance';

export interface Order {
  _id: string;
  serviceId: any;
  vehicleId: any;
  clientId: any;
  masterId: any;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED';
  checklist: any[];
  services: any[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
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
    const { data } = await api.patch(`/orders/${id}`, { status });
    return data;
  },
  createOrder: async (order: Partial<Order>): Promise<Order> => {
    const { data } = await api.post('/orders', order);
    return data;
  },
  updateOrder: async (id: string, order: Partial<Order>): Promise<Order> => {
    const { data } = await api.patch(`/orders/${id}`, order);
    return data;
  },
  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
  getStats: async (): Promise<any> => {
    const { data } = await api.get('/orders/stats/owner');
    return data;
  },
  getGlobalStats: async (): Promise<any> => {
    const { data } = await api.get('/orders/stats/admin');
    return data;
  }
};
