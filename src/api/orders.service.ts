import api from './axios.instance';

export interface Order {
  _id: string;
  stationId: any;
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

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const OrdersService = {
  getOrders: async (stationId?: string): Promise<Order[]> => {
    const { data } = await api.get('/orders', { params: { stationId } });
    return (data as any).items ?? data;
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
