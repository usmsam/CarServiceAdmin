import api from './axios.instance';

export interface Vehicle {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  licensePlate: string;
  year?: number;
}

export const VehiclesService = {
  getVehicles: async (clientId?: string): Promise<Vehicle[]> => {
    const { data } = await api.get('/vehicles', { params: { clientId } });
    return data;
  },
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data;
  }
};
