"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Order, OrdersService } from "@/api/orders.service"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"
import { UsersService } from "@/api/users.service"
import { StationsService, ServiceStation } from "@/api/stations.service"
import { User, useUserStore } from "@/store/user.store"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, ShoppingBag, CalendarClock, Info, Wrench, X } from "lucide-react"
import { motion } from "framer-motion"
import { CatalogItem, CatalogService } from "@/api/catalog.service"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const { user: currentUser } = useUserStore()

  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [stations, setStations] = useState<ServiceStation[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [openDetails, setOpenDetails] = useState(false)
  const [newOrder, setNewOrder] = useState({
    serviceId: "",
    vehicleId: "",
    clientId: "",
    masterId: "",
    status: "OPEN" as Order["status"],
    totalAmount: 0,
    services: [] as { title: string, price: number, qty: number, catalogId: string }[]
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, vehiclesRes, usersRes, catalogRes, stationsRes] = await Promise.all([
        OrdersService.getOrders(),
        VehiclesService.getVehicles(),
        UsersService.getUsers(),
        CatalogService.getItems(),
        StationsService.getStations()
      ])
      setData(ordersRes)
      setVehicles(vehiclesRes)
      setUsers(usersRes)
      setCatalog(catalogRes)
      setStations(stationsRes)
    } catch (error) {
      console.error("Не удалось загрузить наряды-заказы", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateOrder = async () => {
    try {
      const payload = {
        serviceId: newOrder.serviceId,
        vehicleId: newOrder.vehicleId,
        clientId: newOrder.clientId,
        masterId: newOrder.masterId,
        status: "OPEN" as const,
        services: [],
      }
      await OrdersService.createOrder(payload)
      setOpenCreate(false)
      setNewOrder({
        serviceId: "",
        vehicleId: "",
        clientId: "",
        masterId: "",
        status: "OPEN",
        totalAmount: 0,
        services: []
      })
      fetchData()
    } catch (error) {
      console.error("Не удалось создать заказ", error)
    }
  }

  const handleUpdateServices = async (orderId: string, updatedServices: any[]) => {
    try {
      const totalAmount = updatedServices.reduce((sum, s) => sum + (s.price * s.qty), 0)
      const updatedOrder = await OrdersService.updateOrder(orderId, { 
        services: updatedServices,
        totalAmount 
      })
      
      // Update local state
      setData(prev => prev.map(o => o._id === orderId ? updatedOrder : o))
      setSelectedOrder(updatedOrder)
    } catch (error) {
      console.error("Не удалось обновить услуги в заказе", error)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await OrdersService.updateOrderStatus(orderId, newStatus)
      fetchData()
    } catch (error) {
      console.error("Не удалось обновить статус", error)
    }
  }


  const clients = users.filter(u => u.role === "CLIENT" || u.role === "GUEST")
  const masters = users.filter(u => u.role === "MECHANIC" || u.role === "OWNER")

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "_id",
      header: "ID Заказа",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ShoppingBag className="h-4 w-4 text-blue-400" />
          </div>
          <span className="font-medium text-white">#{row.getValue<string>("_id").slice(-6).toUpperCase()}</span>
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-neutral-400">
          <CalendarClock className="h-3 w-3" />
          {new Date(row.getValue("createdAt")).toLocaleDateString('ru-RU')}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const orderId = row.original._id as string
        return (
          <Select
            defaultValue={status}
            onValueChange={(val: string | null) => {
              if (val) handleStatusChange(orderId, val)
            }}
          >
            <SelectTrigger className={`w-[140px] h-8 text-xs border-0 font-medium ${
              status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' :
              status === 'OPEN' ? 'bg-blue-500/10 text-blue-400' :
              status === 'CLOSED' ? 'bg-neutral-500/10 text-neutral-400' :
              'bg-amber-500/10 text-amber-400'
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
              <SelectItem value="OPEN">ОТКРЫТ</SelectItem>
              <SelectItem value="IN_PROGRESS">В РАБОТЕ</SelectItem>
              <SelectItem value="DONE">ВЫПОЛНЕН</SelectItem>
              <SelectItem value="CLOSED">ЗАКРЫТ</SelectItem>
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Сумма</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount") || "0")
        const formatted = new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "RUB",
        }).format(amount)
        return <div className="text-right font-bold text-white tracking-tight">{formatted}</div>
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Действия</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end items-center gap-2 pr-4">
            <Link href={`/orders/${row.original._id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
              >
                <Wrench className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              onClick={async () => {
                if (!confirm("Удалить этот заказ?")) return
                try {
                  await OrdersService.deleteOrder(row.original._id)
                  fetchData()
                } catch (e) {
                  console.error(e)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Наряды-заказы</h2>
          <p className="text-neutral-400 mt-1">Управление всеми работами и клиентами.</p>
        </div>
        
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Создать заказ
            </Button>
          } />
          <DialogContent className="bg-neutral-900/90 backdrop-blur-xl border-neutral-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создание наряда-заказа</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Сначала создайте заказ, затем вы сможете добавить в него работы.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Мастерская (СТО)</Label>
                  <Select
                    value={newOrder.serviceId || undefined}
                    onValueChange={(val) => {
                      setNewOrder(prev => ({ ...prev, serviceId: val || "" }))
                    }}
                  >
                    <SelectTrigger className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500 h-10">
                      <SelectValue placeholder="Выберите СТО" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
                      {stations.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Автомобиль</Label>
                    <Select
                      value={newOrder.vehicleId || undefined}
                      onValueChange={(val) => {
                        const vId = val || ""
                        const vehicle = vehicles.find(v => v._id === vId)
                        setNewOrder(prev => ({ 
                          ...prev, 
                          vehicleId: vId,
                          clientId: vehicle?.ownerId || ""
                        }))
                      }}
                    >
                      <SelectTrigger className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500 h-10">
                        <SelectValue placeholder="Выберите авто" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
                        {vehicles.map((v) => (
                          <SelectItem key={v._id} value={v._id}>
                            {v.licensePlate} — {v.brand} {v.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Мастер</Label>
                  <Select
                    value={newOrder.masterId || undefined}
                    onValueChange={(val) => {
                      setNewOrder(prev => ({ ...prev, masterId: val || "" }))
                    }}
                  >
                    <SelectTrigger className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500 h-10">
                      <SelectValue placeholder="Назначить мастера" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
                      {masters.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-neutral-400 hover:text-white hover:bg-neutral-800">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateOrder} 
                disabled={!newOrder.serviceId || !newOrder.vehicleId || !newOrder.clientId || !newOrder.masterId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <DataTable columns={columns} data={data} searchKey="_id" />
        </div>
      )}

      {/* Details & Services Management Dialog */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="bg-neutral-900/90 backdrop-blur-xl border-neutral-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  Заказ #{selectedOrder?._id.slice(-6).toUpperCase()}
                  <Badge className={
                    selectedOrder?.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    selectedOrder?.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }>
                    {selectedOrder?.status}
                  </Badge>
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Автомобиль</div>
                <div className="text-sm font-medium">{(selectedOrder?.vehicleId as any)?.brand} {(selectedOrder?.vehicleId as any)?.model}</div>
                <div className="text-xs text-blue-400 font-mono mt-1">{(selectedOrder?.vehicleId as any)?.licensePlate}</div>
              </div>
              <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Клиент</div>
                <div className="text-sm font-medium">{(selectedOrder?.clientId as any)?.fullName}</div>
                <div className="text-xs text-neutral-400 mt-1">{(selectedOrder?.clientId as any)?.phone}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Работы в заказе</div>
                <Select onValueChange={(val: string | null) => {
                  const item = catalog.find(i => i._id === val)
                  if (item && selectedOrder) {
                    const updated = [...(selectedOrder.services || []), { title: item.title, price: item.price, qty: 1, catalogId: item._id }]
                    handleUpdateServices(selectedOrder._id, updated)
                  }
                }}>
                  <SelectTrigger className="w-[180px] bg-blue-600/10 border-blue-500/20 text-blue-400 h-7 text-[10px] uppercase font-bold tracking-tight">
                    <Plus className="h-3 w-3 mr-1" />
                    Добавить работу
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
                    {catalog.map((i) => (
                      <SelectItem key={i._id} value={i._id}>
                        {i.title} — {i.price.toLocaleString()} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {selectedOrder?.services?.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-neutral-950/30 rounded-xl border border-neutral-800/50 group">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                        <Wrench className="h-3.5 w-3.5 text-neutral-500" />
                      </div>
                      <span className="text-sm font-medium">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{s.price.toLocaleString()} ₽</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => {
                          if (selectedOrder) {
                            const updated = selectedOrder.services.filter((_, i) => i !== idx)
                            handleUpdateServices(selectedOrder._id, updated)
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {!selectedOrder?.services?.length && (
                  <div className="text-center py-8 border border-dashed border-neutral-800 rounded-2xl text-neutral-500 text-xs italic">
                    Услуги еще не добавлены
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-5 rounded-2xl border border-blue-500/20 flex justify-between items-center">
              <span className="text-blue-300/80 text-sm font-medium">Итого к оплате:</span>
              <span className="text-3xl font-black text-white tracking-tighter">
                {selectedOrder?.totalAmount.toLocaleString()} ₽
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenDetails(false)} className="w-full bg-neutral-950 hover:bg-neutral-900 text-white border border-neutral-800">
              Готово
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
