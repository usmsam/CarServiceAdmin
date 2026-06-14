import api from "./axios.instance"

export interface BackofficeDashboardSummary {
  totalRevenue: number
  closedRevenue: number
  totalOrders: number
  totalUsers: number
  totalStations: number
}

export interface BackofficeDashboardDailyStat {
  date: string
  ordersCount: number
  revenue: number
}

export interface BackofficeDashboardStationRanking {
  stationId: string | null
  name: string
  orderCount: number
  revenue: number
}

export interface BackofficeDashboardServiceRanking {
  title: string
  count: number
}

export interface BackofficeDashboardBrandRanking {
  brand: string
  count: number
}

export interface BackofficeDashboardRecentOrder {
  id: string
  createdAt: string
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "CLOSED"
  totalAmount: number
}

export interface BackofficeDashboardResponse {
  summary: BackofficeDashboardSummary
  charts: {
    dailyStats: BackofficeDashboardDailyStat[]
  }
  rankings: {
    stations: BackofficeDashboardStationRanking[]
    services: BackofficeDashboardServiceRanking[]
    brands: BackofficeDashboardBrandRanking[]
  }
  recentOrders: BackofficeDashboardRecentOrder[]
}

export const BackofficeService = {
  getDashboard: async (): Promise<BackofficeDashboardResponse> => {
    const { data } = await api.get("/backoffice/dashboard")
    return data
  },
}
