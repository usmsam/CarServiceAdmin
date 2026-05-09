import api from './axios.instance';

export interface CatalogItem {
  _id: string;
  categoryId: any;
  title: string;
  price: number;
  serviceId?: any;
}

export const CatalogService = {
  getItems: async (serviceId?: string): Promise<CatalogItem[]> => {
    const { data } = await api.get('/service-catalogs', { params: { serviceId } });
    return data;
  },
  createItem: async (item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.post('/service-catalogs', item);
    return data;
  },
  updateItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.patch(`/service-catalogs/${id}`, item);
    return data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/service-catalogs/${id}`);
  }
};
