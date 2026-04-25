import api from './axios.instance';

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  serviceId: string;
}

export const CatalogService = {
  getItems: async (serviceId: string): Promise<CatalogItem[]> => {
    const { data } = await api.get('/catalog', { params: { serviceId } });
    return data;
  },
  createItem: async (item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.post('/catalog', item);
    return data;
  },
  updateItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.patch(`/catalog/${id}`, item);
    return data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/catalog/${id}`);
  }
};
