import api from './axios.instance';

export interface CatalogItem {
  _id: string;
  categoryId: any;
  title: string;
  price: number;
  stationId?: any;
}

export const CatalogService = {
  getItems: async (stationId?: string): Promise<CatalogItem[]> => {
    const { data } = await api.get('/catalogs', { params: { stationId } });
    return data;
  },
  createItem: async (item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.post('/catalogs', item);
    return data;
  },
  updateItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.patch(`/catalogs/${id}`, item);
    return data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/catalogs/${id}`);
  }
};
