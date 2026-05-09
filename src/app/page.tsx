"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Car, CreditCard, ShoppingBag, TrendingUp, Users, DollarSign, Wrench } from "lucide-react"
import { OrdersService, Order } from "@/api/orders.service"
import { motion } from "framer-motion"
import { useUserStore } from "@/store/user.store"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'

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

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

export default function DashboardPage() {
  const { user } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, ordersRes] = await Promise.all([
          OrdersService.getStats(),
          OrdersService.getOrders()
        ])
        setStats(statsRes)
        setOrders(ordersRes)
      } catch (error) {
        console.error("Не удалось загрузить данные для дашборда", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 animate-pulse">Анализируем показатели СТО...</p>
      </div>
    )
  }

  // Calculate top level metrics
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const mastersCount = stats.mastersStats?.length || 0

  const topCards = [
    {
      title: "Выручка (Всего)",
      value: totalRevenue.toLocaleString() + " сум",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "За всё время работы"
    },
    {
      title: "Средний чек",
      value: avgCheck.toLocaleString() + " сум",
      icon: CreditCard,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Эффективность продаж"
    },
    {
      title: "Всего заказов",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      desc: "Количество заявок"
    },
    {
      title: "Мастера в штате",
      value: mastersCount.toString(),
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "Активные сотрудники"
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            {user?.role === 'SUPERADMIN' ? 'Глобальный Дашборд' : 'Аналитика Вашей СТО'}
          </h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Сводка ключевых показателей эффективности бизнеса.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700">
            Сегодня: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {topCards.map((card, i) => (
          <Card key={i} className="bg-white border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{card.value}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 border-t border-slate-50 pt-3 italic">
                {card.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Revenue Chart */}
      <motion.div variants={itemVariants} className="grid gap-6 grid-cols-1">
        <Card className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Динамика выручки и заказов</CardTitle>
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-blue-500" />Выручка</div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-indigo-200" />Заказы</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-10 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Выручка"
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={0.05}
                  fill="#6366f1"
                  name="Заказы"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Services Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full flex flex-col">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" /> Популярные услуги
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex-1">
              <div className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.servicesStats} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="_id"
                      type="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.servicesStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {stats.servicesStats.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[150px]">{s._id}</span>
                    <span className="font-bold text-slate-900">{s.count} раз</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Master Performance Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full flex flex-col">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" /> Выработка мастеров
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex-1">
              <div className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.mastersStats}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(val) => val.split(' ')[0]}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {stats.mastersStats.slice(0, 2).map((m: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-900">{m.name}</span>
                      <span className="text-blue-600">{m.revenue.toLocaleString()} сум</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(m.revenue / stats.mastersStats[0].revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Brand Distribution Pie Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full flex flex-col">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-indigo-500" /> Бренды автомобилей
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex-1 flex flex-col items-center justify-center">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.brandsStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {stats.brandsStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                {stats.brandsStats.slice(0, 4).map((b: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">{b._id}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders List (Keeping existing but styled) */}
      <motion.div variants={itemVariants} className="grid gap-6 grid-cols-1">
        <Card className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Последние заказы</CardTitle>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <ShoppingBag className="h-10 w-10 opacity-20" />
                Заказов пока нет
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order, i) => (
                  <div
                    key={order._id}
                    className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Заказ #{order._id.slice(-6).toUpperCase()}</div>
                        <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${order.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          order.status === 'OPEN' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                        {order.status === 'OPEN' ? 'Открыт' :
                          order.status === 'IN_PROGRESS' ? 'В работе' :
                            order.status === 'DONE' ? 'Готов' : 'Закрыт'}
                      </span>
                      <div className="text-lg font-black text-slate-900 tabular-nums">
                        {order.totalAmount.toLocaleString()} сум
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
