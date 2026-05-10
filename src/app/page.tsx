"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Car, CreditCard, ShoppingBag, TrendingUp, Users, DollarSign, Wrench, Store } from "lucide-react"
import { OrdersService, Order } from "@/api/orders.service"
import { UsersService } from "@/api/users.service"
import { StationsService } from "@/api/stations.service"
import { motion } from "framer-motion"
import { useUserStore } from "@/store/user.store"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
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
  const [platformData, setPlatformData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoading(true)
      try {
        if (user.role === 'SUPERADMIN') {
          const [statsRes, ordersRes, usersRes, stationsRes] = await Promise.all([
            OrdersService.getGlobalStats(),
            OrdersService.getOrders(),
            UsersService.getUsers(undefined),
            StationsService.getStations()
          ])
          setStats(statsRes)
          setOrders(ordersRes)
          setPlatformData({
            totalUsers: usersRes.length,
            totalStations: stationsRes.length
          })
        } else {
          const [statsRes, ordersRes] = await Promise.all([
            OrdersService.getStats(),
            OrdersService.getOrders()
          ])
          setStats(statsRes)
          setOrders(ordersRes)
        }
      } catch (error) {
        console.error("Не удалось загрузить данные для дашборда", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 animate-pulse text-sm">Сбор аналитических данных...</p>
      </div>
    )
  }

  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const topCards = isSuperAdmin ? [
    {
      title: "Выручка (Платформа)",
      value: totalRevenue.toLocaleString() + " сум",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "Оборот всех филиалов"
    },
    {
      title: "Активных СТО",
      value: platformData?.totalStations.toString() || "0",
      icon: Store,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Подключено к системе"
    },
    {
      title: "Всего заказов",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      desc: "Транзакции платформы"
    },
    {
      title: "Пользователей",
      value: platformData?.totalUsers.toString() || "0",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "Владельцы, мастера и клиенты"
    }
  ] : [
    {
      title: "Выручка СТО",
      value: totalRevenue.toLocaleString() + " сум",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "Ваша текущая выручка"
    },
    {
      title: "Средний чек",
      value: avgCheck.toLocaleString() + " сум",
      icon: CreditCard,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Качество продаж услуг"
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
      title: "Мастеров",
      value: stats.mastersStats?.length.toString() || "0",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "Сотрудники в штате"
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
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            {isSuperAdmin ? 'Глобальный Дашборд' : 'Аналитика Вашей СТО'}
          </h2>
          <p className="text-xs lg:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              {isSuperAdmin ? 'Мониторинг всей экосистемы AvtoLog.' : 'Показатели эффективности вашего бизнеса.'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-[10px] lg:text-xs xl:text-sm font-medium text-slate-700">
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card, i) => (
          <Card key={i} className="bg-white border-slate-200 rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${card.bg}`}>
                  <card.icon className="h-5 w-5 lg:h-6 lg:w-6 ${card.color}" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] lg:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <div className="text-lg lg:text-xl xl:text-2xl font-bold text-slate-900 mt-0.5 lg:mt-1">{card.value}</div>
                </div>
              </div>
              <p className="text-[9px] lg:text-[10px] text-slate-400 mt-3 lg:mt-4 border-t border-slate-50 pt-2 lg:pt-3 flex items-center gap-1.5 font-medium">
                <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-emerald-500" /> {card.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Revenue Chart */}
      <motion.div variants={itemVariants} className="grid gap-6 grid-cols-1">
        <Card className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-base md:text-lg font-bold text-slate-900">
                {isSuperAdmin ? 'Оборот платформы (30 дней)' : 'Динамика выручки (14 дней)'}
              </CardTitle>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" />Выручка</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-indigo-300" />Заказы</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-6 md:pt-10 h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                  dy={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `${val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : (val/1000).toFixed(0) + 'k'}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
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

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Top Services Bar Chart */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="p-4 lg:p-6 border-b border-slate-50">
              <CardTitle className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" /> {isSuperAdmin ? 'Топ услуг в сети' : 'Ваши топ-услуги'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 flex-1">
              <div className="h-[220px] lg:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.servicesStats} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="_id" 
                      type="category" 
                      width={100} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Master / Station Performance Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="p-4 lg:p-6 border-b border-slate-50">
              <CardTitle className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                {isSuperAdmin ? (
                  <><Store className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-500" /> Рейтинг филиалов (по выручке)</>
                ) : (
                  <><Users className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" /> Эффективность мастеров</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 flex-1">
              <div className="h-[220px] lg:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={isSuperAdmin ? stats.stationsStats : stats.mastersStats}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      tickFormatter={(val) => val.length > 12 ? val.slice(0, 10) + '...' : val} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {(isSuperAdmin ? stats.stationsStats : stats.mastersStats).slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{item.name}</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{item.revenue.toLocaleString()} сум</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Recent Activity / Orders List */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 lg:p-6">
              <CardTitle className="text-base lg:text-lg font-bold text-slate-900">Последняя активность</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <ShoppingBag className="h-10 w-10 opacity-20" />
                  Заказов пока нет
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {orders.slice(0, 6).map((order, i) => (
                    <div 
                      key={order._id} 
                      className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group min-w-[300px]"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                          <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs md:text-sm truncate">#{order._id.slice(-6).toUpperCase()}</div>
                          <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span className={`text-[8px] md:text-[9px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md border uppercase tracking-wider ${
                          order.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          order.status === 'OPEN' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                        <div className="text-xs md:text-sm font-black text-slate-900 tabular-nums">
                          {order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Brand Distribution Pie Chart (Always useful) */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-indigo-500" /> {isSuperAdmin ? 'Автопарк платформы' : 'Бренды авто'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.brandsStats || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {stats.brandsStats?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6">
                {stats.brandsStats?.slice(0, 4).map((b: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[80px]">{b._id}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
