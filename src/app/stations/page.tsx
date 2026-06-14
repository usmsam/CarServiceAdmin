"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table/data-table"
import { StationsService, ServiceStation } from "@/api/stations.service"
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
import { Plus, Trash2, Store, MapPin, Eye, Phone, Clock3, Fingerprint, CalendarClock } from "lucide-react"
import { motion } from "framer-motion"

export default function StationsPage() {
  const [data, setData] = useState<ServiceStation[]>([])
  const [loading, setLoading] = useState(true)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedStation, setSelectedStation] = useState<Partial<ServiceStation>>({
    name: "",
    address: "",
    ownerId: "",
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const stations = await StationsService.getStations()
      setData(stations)
    } catch (error) {
      console.error("Не удалось загрузить СТО", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateStation = async () => {
    try {
      await StationsService.createStation(selectedStation)
      setOpenCreate(false)
      setSelectedStation({ name: "", address: "", ownerId: "" })
      fetchData()
    } catch (error) {
      console.error("Не удалось создать СТО", error)
    }
  }

  const handleUpdateStation = async () => {
    if (!selectedStation._id) return
    try {
      await StationsService.updateStation(selectedStation._id, {
        name: selectedStation.name,
        address: selectedStation.address,
        ownerId: selectedStation.ownerId,
      })
      setOpenEdit(false)
      setSelectedStation({ name: "", address: "", ownerId: "" })
      fetchData()
    } catch (error) {
      console.error("Не удалось обновить СТО", error)
    }
  }

  const handleDeleteStation = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это СТО?")) return
    try {
      await StationsService.deleteStation(id)
      fetchData()
    } catch (error) {
      console.error("Не удалось удалить СТО", error)
    }
  }

  const columns: ColumnDef<ServiceStation>[] = [
    {
      accessorKey: "name",
      header: "Название СТО",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Store className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-medium text-slate-900">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Адрес",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="h-3 w-3" />
          {row.getValue("address") || "Не указан"}
        </div>
      ),
    },
    {
      accessorKey: "ownerId",
      header: "Владелец",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Fingerprint className="h-3 w-3" />
          <span className="font-mono text-xs break-all">{row.original.ownerId || "—"}</span>
        </div>
      ),
    },
    {
      id: "contacts",
      header: "Контакты",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{row.original.phone || "Не указан"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-3 w-3" />
            <span>{row.original.workingHours || "Не указан"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
          row.original.status === "ACTIVE"
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            : row.original.status === "PENDING"
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
              : row.original.status === "BLOCKED"
                ? "bg-red-500/10 text-red-600 border-red-500/20"
                : "bg-slate-500/10 text-slate-600 border-slate-200"
        }`}>
          {row.original.status || "—"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Активно",
      cell: ({ row }) => (
        <span className={row.original.isActive ? "text-emerald-600 font-medium" : "text-slate-500"}>
          {row.original.isActive ? "Да" : "Нет"}
        </span>
      ),
    },
    {
      id: "coordinates",
      header: "Координаты",
      cell: ({ row }) => (
        <div className="text-xs text-slate-500">
          {row.original.latitude != null && row.original.longitude != null
            ? `${row.original.latitude}, ${row.original.longitude}`
            : "Не указаны"}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ row }) => (
        <div className="max-w-[240px] truncate text-slate-500" title={row.original.description || ""}>
          {row.original.description || "—"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Создано",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <CalendarClock className="h-3 w-3" />
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Обновлено",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <CalendarClock className="h-3 w-3" />
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Действия</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end items-center gap-2 pr-4">
            <Link
              href={`/stations/${row.original._id}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
              aria-label={`Открыть СТО ${row.original.name}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              onClick={() => handleDeleteStation(row.original._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Филиалы СТО</h2>
          <p className="text-sm text-slate-500 mt-1">Управление филиалами и локациями автосервисов.</p>
        </div>
        
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Добавить СТО
            </Button>
          } />
          <DialogContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добавить новое СТО</DialogTitle>
              <DialogDescription className="text-slate-500">
                Введите параметры новой локации автосервиса.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input
                  value={selectedStation.name}
                  onChange={(e) => setSelectedStation(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-50 border-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid gap-2">
                <Label>Адрес</Label>
                <Input
                  value={selectedStation.address}
                  onChange={(e) => setSelectedStation(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-slate-50 border-slate-200 focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-2">
                <Label>ID Владельца (User ObjectId)</Label>
                <Input
                  value={selectedStation.ownerId || ""}
                  onChange={(e) => setSelectedStation(prev => ({ ...prev, ownerId: e.target.value }))}
                  placeholder="Например: 662a1c..."
                  className="bg-slate-50 border-slate-200 focus:border-emerald-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateStation} 
                disabled={!selectedStation.name || !selectedStation.ownerId || selectedStation.ownerId.length !== 24}
                className="bg-emerald-600 hover:bg-emerald-700 text-slate-900"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать СТО</DialogTitle>
            <DialogDescription className="text-slate-500">
              Внесите изменения в реквизиты СТО.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={selectedStation.name}
                onChange={(e) => setSelectedStation(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-50 border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div className="grid gap-2">
              <Label>Адрес</Label>
              <Input
                value={selectedStation.address}
                onChange={(e) => setSelectedStation(prev => ({ ...prev, address: e.target.value }))}
                className="bg-slate-50 border-slate-200 focus:border-emerald-500"
              />
            </div>

            <div className="grid gap-2">
              <Label>ID Владельца (User ObjectId)</Label>
              <Input
                value={selectedStation.ownerId || ""}
                onChange={(e) => setSelectedStation(prev => ({ ...prev, ownerId: e.target.value }))}
                className="bg-slate-50 border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateStation} 
              disabled={!selectedStation.name || !selectedStation.ownerId || selectedStation.ownerId.length !== 24}
              className="bg-emerald-600 hover:bg-emerald-700 text-slate-900"
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="name" />
        </div>
      )}
    </motion.div>
  )
}
