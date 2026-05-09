"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Order, OrdersService } from "@/api/orders.service"
import { CatalogItem, CatalogService } from "@/api/catalog.service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, ChevronLeft, Wrench, Plus, X, User as UserIcon, Car, Clock, CreditCard, Store } from "lucide-react"
import { motion } from "framer-motion"

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const orderRes = await OrdersService.getOrderById(id)
      setOrder(orderRes)

      const stationId = (orderRes.serviceId as any)?._id || orderRes.serviceId
      const catalogRes = await CatalogService.getItems(stationId)
      setCatalog(catalogRes)
    } catch (error) {
      console.error("Failed to fetch order details", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleUpdateServices = async (updatedServices: any[]) => {
    if (!order) return
    try {
      const updatedOrder = await OrdersService.updateOrder(order._id, {
        services: updatedServices,
      })
      setOrder(updatedOrder)
    } catch (error) {
      console.error("Failed to update services", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-slate-500">
        Заказ не найден
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Заказ #{order._id.slice(-6).toUpperCase()}</h1>
              <Badge className={
                order.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  order.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }>
                {order.status}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Создан {new Date(order.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Services Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                Состав заказа
              </h3>

              <Select
                key={order.services?.length || 0}
                onValueChange={(val) => {
                  const item = catalog.find(i => i._id === val)
                  if (item) {
                    const updated = [...(order.services || []), { title: item.title, price: item.price, qty: 1, catalogId: item._id }]
                    handleUpdateServices(updated)
                  }
                }}
              >
                <SelectTrigger className="w-[200px] bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Добавить работу" />
                </SelectTrigger>
                <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
                  {catalog.map((i) => (
                    <SelectItem key={i._id} value={i._id}>
                      {i.title} — {i.price.toLocaleString()} сум
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {order.services?.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                      <Wrench className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                      <div className="text-xs text-slate-400">{s.price.toLocaleString()} сум × {s.qty}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-md font-bold text-slate-900">{(s.price * s.qty).toLocaleString()} сум</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => {
                        const updated = order.services.filter((_, i) => i !== idx)
                        handleUpdateServices(updated)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {!order.services?.length && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm italic">
                  Список услуг пуст. Начните добавлять работы из каталога выше.
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Итоговая стоимость</p>
                <div className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-emerald-500" />
                  {order.totalAmount.toLocaleString()} сум
                </div>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-emerald-600/20">
                Оплатить заказ
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Info Sidebar */}
        <div className="space-y-6">
          {/* Workshop Info */}
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Store className="h-16 w-16 text-blue-500" />
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-500" />
              Мастерская (СТО)
            </h4>
            <div className="space-y-1 relative z-10">
              <div className="text-xl font-bold text-slate-900">{(order.serviceId as any)?.name || "Не указано"}</div>
              <div className="text-slate-500 text-xs">{(order.serviceId as any)?.address}</div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 text-orange-500" />
              Автомобиль
            </h4>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900">{(order.vehicleId as any)?.brand} {(order.vehicleId as any)?.model}</div>
              <div className="text-blue-400 font-mono text-sm">{(order.vehicleId as any)?.licensePlate}</div>
              <div className="text-slate-400 text-[10px] mt-2">VIN: {(order.vehicleId as any)?.vin || "—"}</div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-purple-500" />
              Клиент
            </h4>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">{(order.clientId as any)?.fullName}</div>
              <div className="text-slate-500 text-sm">{(order.clientId as any)?.phone}</div>
              <div className="text-slate-400 text-[10px] mt-2">ID: {order.clientId._id}</div>
            </div>
          </div>

          {/* Master Info */}
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-emerald-500" />
              Мастер
            </h4>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">{(order.masterId as any)?.fullName}</div>
              <div className="text-slate-500 text-sm">{(order.masterId as any)?.phone}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
