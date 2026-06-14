import api from './axios.instance';

export interface ServiceStation {
  _id: string;
  name: string;
  address: string;
  ownerId?: string;
}

export interface StationOwner {
  _id: string
  fullName?: string
  phone?: string
  username?: string
  role?: string
  status?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  hasCredentials?: boolean
}

export interface StationCategoryService {
  _id: string
  title: string
  price?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface StationCategoryDetail {
  _id: string
  name: string
  order: number
  createdAt?: string
  updatedAt?: string
  services: StationCategoryService[]
}

export interface StationDetail extends ServiceStation {
  settings?: Record<string, string>
  latitude?: number
  longitude?: number
  workingHours?: string
  photoUrl?: string
  logoUrl?: string
  description?: string
  phone?: string
  status?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  owner?: StationOwner | null
}

export interface StationDetailResponse {
  station: StationDetail
  categories: StationCategoryDetail[]
}

export const StationsService = {
  getStations: async (): Promise<ServiceStation[]> => {
    const { data } = await api.get('/backoffice/stations');
    return data;
  },
  getStationById: async (id: string): Promise<StationDetailResponse> => {
    const { data } = await api.get(`/backoffice/stations/${id}`)
    return data
  },
  createStation: async (station: Partial<ServiceStation>): Promise<ServiceStation> => {
    const { data } = await api.post('/backoffice/stations', station);
    return data;
  },
  updateStation: async (id: string, station: Partial<ServiceStation>): Promise<ServiceStation> => {
    const { data } = await api.patch(`/backoffice/stations/${id}`, station);
    return data;
  },
  deleteStation: async (id: string): Promise<void> => {
    await api.delete(`/backoffice/stations/${id}`);
  }
};
