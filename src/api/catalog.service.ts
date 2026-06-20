import api from './axios.instance';

export interface CatalogCategoryRef {
  _id?: string;
  name?: string;
}

export interface CatalogItem {
  _id: string;
  categoryId: string | CatalogCategoryRef | null;
  title: string;
  titleRu?: string;
  titleUz?: string;
  price: number;
  isActive?: boolean;
  stationId?: string | { _id?: string; name?: string; address?: string } | null;
  templateItemId?: string | { _id?: string; title?: string; titleRu?: string };
  reminderRuleId?: string | null;
}

export const CatalogService = {
  getItems: async (stationId?: string): Promise<CatalogItem[]> => {
    const { data } = await api.get('/backoffice/catalog', {
      params: { stationId },
    });
    return data;
  },
  createItem: async (item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.post('/backoffice/catalog', item);
    return data;
  },
  updateItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    const { data } = await api.patch(`/backoffice/catalog/${id}`, item);
    return data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/backoffice/catalog/${id}`);
  }
};
