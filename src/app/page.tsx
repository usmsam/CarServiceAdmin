"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Car, CreditCard, ShoppingBag } from "lucide-react"
import { OrdersService, Order } from "@/api/orders.service"
import { VehiclesService } from "@/api/vehicles.service"
import { UsersService } from "@/api/users.service"
import { useUserStore } from "@/store/user.store"

export default function DashboardPage() {
  const { activeServiceId } = useUserStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [vehiclesCount, setVehiclesCount] = useState(0)
  const [mastersCount, setMastersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [ordersRes, vehiclesRes, usersRes] = await Promise.all([
          OrdersService.getOrders(),
          VehiclesService.getVehicles(),
          UsersService.getUsers(activeServiceId || undefined),
        ])

        setOrders(ordersRes)
        setVehiclesCount(vehiclesRes.length)
        setMastersCount(usersRes.filter(u => u.role === 'MASTER' || u.role === 'MECHANIC').length)
      } catch (error) {
        console.error("Не удалось загрузить данные для дашборда", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeServiceId])

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

  const formattedRevenue = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(totalRevenue)

  const stats = [
    {
      title: "Всего заказов",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      description: "Все оформленные заявки",
    },
    {
      title: "Общая выручка",
      value: formattedRevenue,
      icon: CreditCard,
      description: "Сумма по всем работам",
    },
    {
      title: "Автомобилей в базе",
      value: vehiclesCount.toString(),
      icon: Car,
      description: "Зарегистрированный автопарк",
    },
    {
      title: "Мастеров",
      value: mastersCount.toString(),
      icon: Activity,
      description: "Сотрудники в штате",
    },
  ]

  // Get 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Панель управления</h2>
      </div>
      
      {loading ? (
        <div className="text-neutral-400">Загрузка статистики...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i} className="bg-neutral-900 border-neutral-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-400">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            <Card className="col-span-7 bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Последние заказы</CardTitle>
              </CardHeader>
              <CardContent className="border-t border-neutral-800 p-0">
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500">Заказов пока нет</div>
                ) : (
                  <div className="divide-y divide-neutral-800">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                        <div>
                          <div className="font-medium text-white">Заказ #{order._id.slice(-6)}</div>
                          <div className="text-xs text-neutral-400 mt-1">
                            {new Date(order.createdAt || "").toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            {order.status}
                          </span>
                          <div className="text-sm font-bold text-white">
                            {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
