"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Order, OrdersService } from "@/api/orders.service"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"
import { UsersService } from "@/api/users.service"
import { User, useUserStore } from "@/store/user.store"
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
import { Trash2, Plus, ShoppingBag, CalendarClock } from "lucide-react"
import { motion } from "framer-motion"

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const { user: currentUser } = useUserStore()

  const [openCreate, setOpenCreate] = useState(false)
  const [newOrder, setNewOrder] = useState({
    vehicleId: "",
    clientId: "",
    masterId: "",
    status: "OPEN" as Order["status"],
    totalAmount: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, vehiclesRes, usersRes] = await Promise.all([
        OrdersService.getOrders(),
        VehiclesService.getVehicles(),
        UsersService.getUsers(), // Fetch all without filtering
      ])
      setData(ordersRes)
      setVehicles(vehiclesRes)
      setUsers(usersRes)
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
        ...newOrder,
        serviceId: undefined, // Superadmin doesn't need to pass serviceId if it's optional, or we might need a station selector if creating orders from superadmin.
      }
      await OrdersService.createOrder(payload)
      setOpenCreate(false)
      setNewOrder({
        vehicleId: "",
        clientId: "",
        masterId: "",
        status: "OPEN",
        totalAmount: 0,
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот наряд-заказ?")) return
    try {
      await OrdersService.deleteOrder(orderId)
      fetchData()
    } catch (error) {
      console.error("Не удалось удалить заказ", error)
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
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              onClick={() => handleDeleteOrder(row.original._id)}
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
          <DialogContent className="bg-neutral-900/90 backdrop-blur-xl border-neutral-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Создание наряда-заказа</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Укажите базовую информацию для открытия нового заказа.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Автомобиль</Label>
                <Select
                  value={newOrder.vehicleId}
                  onValueChange={(val: string | null) => {
                    if (val) setNewOrder(prev => ({ ...prev, vehicleId: val }))
                  }}
                >
                  <SelectTrigger className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500">
                    <SelectValue placeholder="Выберите автомобиль" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
                    {vehicles.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {v.brand} {v.model} ({v.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Клиент</Label>
                <Select
                  value={newOrder.clientId}
                  onValueChange={(val: string | null) => {
                    if (val) setNewOrder(prev => ({ ...prev, clientId: val }))
                  }}
                >
                  <SelectTrigger className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500">
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 text-white">
                    {clients.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Мастер</Label>
                <Select
                  value={newOrder.masterId}
                  onValueChange={(val: string | null) => {
                    if (val) setNewOrder(prev => ({ ...prev, masterId: val }))
                  }}
                >
                  <SelectTrigger className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500">
                    <SelectValue placeholder="Выберите мастера" />
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

              <div className="grid gap-2">
                <Label>Общая стоимость</Label>
                <Input
                  type="number"
                  value={newOrder.totalAmount}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) }))}
                  className="bg-neutral-950/50 border-neutral-800 focus:border-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-neutral-400 hover:text-white hover:bg-neutral-800">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateOrder} 
                disabled={!newOrder.vehicleId || !newOrder.clientId || !newOrder.masterId}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Сохранить
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
    </motion.div>
  )
}
