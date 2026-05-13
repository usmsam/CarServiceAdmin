import api from './axios.instance';

export interface ServiceStation {
  _id: string;
  name: string;
  address: string;
  ownerId?: string;
}

export const StationsService = {
  getStations: async (): Promise<ServiceStation[]> => {
    const { data } = await api.get('/stations');
    return data;
  },
  createStation: async (station: Partial<ServiceStation>): Promise<ServiceStation> => {
    const { data } = await api.post('/stations', station);
    return data;
  },
  updateStation: async (id: string, station: Partial<ServiceStation>): Promise<ServiceStation> => {
    const { data } = await api.patch(`/stations/${id}`, station);
    return data;
  },
  deleteStation: async (id: string): Promise<void> => {
    await api.delete(`/stations/${id}`);
  }
};
