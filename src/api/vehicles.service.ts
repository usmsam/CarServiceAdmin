import api from './axios.instance';

export interface Vehicle {
  _id: string;
  ownerId: string;
  brand: string;
  model: string;
  licensePlate: string;
  vin?: string;
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
