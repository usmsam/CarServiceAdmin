import api from './axios.instance';

export interface TemplateCategory {
  _id: string;
  name: string;
  nameRu?: string;
  nameUz?: string;
  segment: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateItem {
  _id: string;
  templateCategoryId: string | TemplateCategory;
  title: string;
  titleRu?: string;
  titleUz?: string;
  aliasesRu?: string[];
  aliasesUz?: string[];
  defaultPrice: number;
  defaultReminderRuleId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const TemplatesService = {
  getCategories: async (segment?: string): Promise<TemplateCategory[]> => {
    const { data } = await api.get('/backoffice/templates/categories', {
      params: { segment },
    });
    return data;
  },

  createCategory: async (
    payload: Partial<TemplateCategory>,
  ): Promise<TemplateCategory> => {
    const { data } = await api.post('/backoffice/templates/categories', payload);
    return data;
  },

  updateCategory: async (
    id: string,
    payload: Partial<TemplateCategory>,
  ): Promise<TemplateCategory> => {
    const { data } = await api.patch(`/backoffice/templates/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/backoffice/templates/categories/${id}`);
  },

  getItems: async (categoryId: string): Promise<TemplateItem[]> => {
    const { data } = await api.get(`/backoffice/templates/items/${categoryId}`);
    return data;
  },

  createItem: async (
    payload: Partial<TemplateItem> & { templateCategoryId: string },
  ): Promise<TemplateItem> => {
    const { data } = await api.post('/backoffice/templates/items', payload);
    return data;
  },

  updateItem: async (
    id: string,
    payload: Partial<TemplateItem>,
  ): Promise<TemplateItem> => {
    const { data } = await api.patch(`/backoffice/templates/items/${id}`, payload);
    return data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/backoffice/templates/items/${id}`);
  },
};
