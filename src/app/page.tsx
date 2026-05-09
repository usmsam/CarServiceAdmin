"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Car, CreditCard, ShoppingBag, TrendingUp } from "lucide-react"
import { OrdersService, Order } from "@/api/orders.service"
import { VehiclesService } from "@/api/vehicles.service"
import { UsersService } from "@/api/users.service"
import { motion } from "framer-motion"
import { useUserStore } from "@/store/user.store"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { user } = useUserStore()
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
          UsersService.getUsers(undefined), // No activeServiceId filter for superadmin
        ])

        setOrders(ordersRes)
        setVehiclesCount(vehiclesRes.length)
        setMastersCount(usersRes.filter(u => u.role === 'MECHANIC' || u.role === 'OWNER').length)
      } catch (error) {
        console.error("Не удалось загрузить данные для дашборда", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Общая выручка",
      value: formattedRevenue,
      icon: CreditCard,
      description: "Сумма по всем работам",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Автомобилей в базе",
      value: vehiclesCount.toString(),
      icon: Car,
      description: "Зарегистрированный автопарк",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "Мастеров",
      value: mastersCount.toString(),
      icon: Activity,
      description: "Сотрудники в штате",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ].filter(stat => {
    if (stat.title === "Автомобилей в базе") {
      return user?.role === 'SUPERADMIN'
    }
    return true
  })

  // Get 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Панель управления
          </h2>
          <p className="text-slate-500 mt-1">
            {user?.role === 'SUPERADMIN' 
              ? "Сводка данных по всем филиалам платформы." 
              : "Сводка данных по вашему автосервису."}
          </p>
        </div>
      </div>
      
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${stat.color}`}>
              <stat.icon className="h-24 w-24 -mr-8 -mt-8" />
            </div>
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7 bg-white border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <CardTitle className="text-slate-900 text-lg font-medium">Последние заказы</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Заказов пока нет</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={order._id} 
                    className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Заказ #{order._id.slice(-6).toUpperCase()}</div>
                        <div className="text-sm text-slate-500 mt-0.5">
                          {new Date(order.createdAt || "").toLocaleDateString('ru-RU', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        order.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        order.status === 'OPEN' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                      <div className="text-lg font-bold text-slate-900 tabular-nums">
                        {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(order.totalAmount)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
