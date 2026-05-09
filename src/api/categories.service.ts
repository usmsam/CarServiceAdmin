import api from './axios.instance';

export interface ServiceCategory {
  _id: string;
  name: string;
  order: number;
  serviceId?: any;
}

export const ServiceCategoriesService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    const { data } = await api.get('/service-categories');
    return data;
  },
  getCategoryById: async (id: string): Promise<ServiceCategory> => {
    const { data } = await api.get(`/service-categories/${id}`);
    return data;
  },
  createCategory: async (category: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const { data } = await api.post('/service-categories', category);
    return data;
  },
  updateCategory: async (id: string, category: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const { data } = await api.patch(`/service-categories/${id}`, category);
    return data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/service-categories/${id}`);
  }
};
