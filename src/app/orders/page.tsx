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
import { Plus, ShoppingBag, CalendarClock, Trash2, Wrench } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const { user: currentUser } = useUserStore()

  const [stations, setStations] = useState<ServiceStation[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [newOrder, setNewOrder] = useState({
    stationId: "",
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
      const [ordersRes, vehiclesRes, usersRes, stationsRes] = await Promise.all([
        OrdersService.getOrders(),
        VehiclesService.getVehicles(),
        UsersService.getUsers(),
        StationsService.getStations()
      ])
      setData(ordersRes)
      setVehicles(vehiclesRes)
      setUsers(usersRes)
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
        stationId: newOrder.stationId,
        vehicleId: newOrder.vehicleId,
        clientId: newOrder.clientId,
        masterId: newOrder.masterId,
        status: "OPEN" as const,
        services: [],
      }
      await OrdersService.createOrder(payload)
      setOpenCreate(false)
      setNewOrder({
        stationId: "",
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
          <span className="font-medium text-slate-900">#{row.getValue<string>("_id").slice(-6).toUpperCase()}</span>
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {new Date(row.getValue("createdAt")).toLocaleDateString('ru-RU')}
        </div>
      )
    },
    {
      id: "station",
      header: "СТО",
      cell: ({ row }) => {
        const station = row.original.stationId as any;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{station?.name || 'Неизвестно'}</span>
            <span className="text-xs text-slate-500">{station?.address || ''}</span>
          </div>
        )
      }
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
            <SelectTrigger className={`w-[140px] h-8 text-xs border-0 font-medium ${status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' :
              status === 'OPEN' ? 'bg-blue-500/10 text-blue-400' :
                status === 'CLOSED' ? 'bg-slate-100 text-slate-500' :
                  'bg-amber-500/10 text-amber-400'
              }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
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
        return <div className="text-right font-bold text-slate-900 tracking-tight">{formatted}</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Наряды-заказы</h2>
          <p className="text-sm text-slate-500 mt-1">Управление всеми работами и клиентами.</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Создать заказ
            </Button>
          } />
          <DialogContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создание наряда-заказа</DialogTitle>
              <DialogDescription className="text-slate-500">
                Сначала создайте заказ, затем вы сможете добавить в него работы.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Мастерская (СТО)</Label>
                  <Select
                    value={newOrder.stationId || undefined}
                    onValueChange={(val) => {
                      setNewOrder(prev => ({ ...prev, stationId: val || "" }))
                    }}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-500 h-10">
                      <SelectValue placeholder="Выберите СТО" />
                    </SelectTrigger>
                    <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
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
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-500 h-10">
                        <SelectValue placeholder="Выберите авто" />
                      </SelectTrigger>
                      <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
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
                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-500 h-10">
                      <SelectValue placeholder="Назначить мастера" />
                    </SelectTrigger>
                    <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
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
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                Отмена
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={!newOrder.stationId || !newOrder.vehicleId || !newOrder.clientId || !newOrder.masterId}
                className="bg-blue-600 hover:bg-blue-700 text-slate-900 px-8"
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
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="_id" />
        </div>
      )}
    </motion.div>
  )
}
