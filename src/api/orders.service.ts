import api from './axios.instance';

type RefEntity = { _id?: string; name?: string; address?: string; fullName?: string; phone?: string; brand?: string; model?: string; licensePlate?: string; vin?: string } | string | null;

export interface OrderServiceAttribute {
  key: string;
  label: string;
  value: string;
  valueType?: 'text' | 'number' | 'date';
  source?: 'TEMPLATE' | 'CUSTOM';
}

export interface OrderServiceItem {
  catalogId?: RefEntity;
  serviceType?: string;
  title: string;
  price: number;
  qty: number;
  attributes?: OrderServiceAttribute[];
}

export interface OrderAuditEntry {
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'MEDIA_ADDED' | 'ARCHIVED';
  at: string;
  actorId?: RefEntity;
  details?: Record<string, unknown>;
}

export interface OrderMediaItem {
  _id: string;
  orderId: RefEntity;
  uploadedBy?: RefEntity;
  fileId: string;
  type: 'PHOTO' | 'VIDEO';
  comment?: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  bookingId?: RefEntity;
  stationId: RefEntity;
  vehicleId: RefEntity;
  clientId: RefEntity;
  masterId: RefEntity;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED';
  createdBy?: RefEntity;
  updatedBy?: RefEntity;
  archivedAt?: string | null;
  archivedBy?: RefEntity;
  auditTrail?: OrderAuditEntry[];
  services: OrderServiceItem[];
  mileage?: number;
  totalAmount: number;
  note?: string;
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

export interface OrderStatsRow {
  _id: string;
  count?: number;
  revenue?: number;
  name?: string;
}

export interface OrderStatsResponse {
  dailyStats?: OrderStatsRow[];
  servicesStats?: OrderStatsRow[];
  stationsStats?: OrderStatsRow[];
  mastersStats?: OrderStatsRow[];
  brandsStats?: OrderStatsRow[];
  [key: string]: unknown;
}

export const OrdersService = {
  getOrders: async (params?: Record<string, string | number | boolean | undefined>): Promise<Order[]> => {
    const { data } = await api.get('/backoffice/orders', { params });
    const result = data as { items?: Order[] } | Order[];
    return Array.isArray(result) ? result : result.items ?? [];
  },
  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/backoffice/orders/${id}`);
    return data;
  },
  getOrderMedia: async (id: string): Promise<OrderMediaItem[]> => {
    const { data } = await api.get(`/backoffice/orders/${id}/media`);
    return Array.isArray(data) ? data : [];
  },
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const { data } = await api.patch(`/backoffice/orders/${id}`, { status });
    return data;
  },
  updateOrder: async (id: string, order: Partial<Order>): Promise<Order> => {
    const { data } = await api.patch(`/backoffice/orders/${id}`, order);
    return data;
  },
  archiveOrder: async (id: string): Promise<Order> => {
    const { data } = await api.patch(`/backoffice/orders/${id}/archive`);
    return data;
  },
  getStats: async (): Promise<OrderStatsResponse> => {
    const { data } = await api.get('/backoffice/orders/stats');
    return data;
  },
  getGlobalStats: async (): Promise<OrderStatsResponse> => {
    const { data } = await api.get('/backoffice/orders/stats');
    return data;
  }
};
