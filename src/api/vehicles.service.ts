import api from './axios.instance';

type RefEntity = {
  _id?: string;
  fullName?: string;
  phone?: string;
  name?: string;
} | string | null;

export interface Vehicle {
  _id: string;
  ownerId: RefEntity;
  brand: string;
  model: string;
  licensePlate: string;
  vin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const VehiclesService = {
  getVehicles: async (clientId?: string): Promise<Vehicle[]> => {
    const { data } = await api.get('/backoffice/vehicles', {
      params: { clientId },
    });
    return data;
  },
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/backoffice/vehicles/${id}`);
    return data;
  }
};
