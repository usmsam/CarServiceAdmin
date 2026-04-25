"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { StationsService, ServiceStation } from "@/api/stations.service"
import { useUserStore } from "@/store/user.store"
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
import { Plus, Trash2, Edit } from "lucide-react"

export default function StationsPage() {
  const [data, setData] = useState<ServiceStation[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useUserStore()

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
    if (currentUser?.role !== "SUPERADMIN") {
      window.location.href = "/"
      return
    }
    fetchData()
  }, [currentUser])

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
      cell: ({ row }) => <div className="font-medium text-white">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "address",
      header: "Адрес",
      cell: ({ row }) => <div className="text-neutral-400">{row.getValue("address") || "-"}</div>,
    },

    {
      id: "actions",
      header: () => <div className="text-center">Действия</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              onClick={() => {
                setSelectedStation(row.original)
                setOpenEdit(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => handleDeleteStation(row.original._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    },
  ]

  if (currentUser?.role !== "SUPERADMIN") return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Филиалы СТО</h2>
          <p className="text-neutral-400">Управление филиалами и локациями автосервисов.</p>
        </div>
        
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Добавить СТО
            </Button>
          } />
          <DialogContent className="bg-neutral-950 border-neutral-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добавить новое СТО</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Введите параметры новой локации автосервиса.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input
                  value={selectedStation.name}
                  onChange={(e) => setSelectedStation(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-neutral-900 border-neutral-800"
                />
              </div>
              <div className="grid gap-2">
                <Label>Адрес</Label>
                <Input
                  value={selectedStation.address}
                  onChange={(e) => setSelectedStation(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-neutral-900 border-neutral-800"
                />
              </div>

              <div className="grid gap-2">
                <Label>ID Владельца (User ObjectId)</Label>
                <Input
                  value={selectedStation.ownerId || ""}
                  onChange={(e) => setSelectedStation(prev => ({ ...prev, ownerId: e.target.value }))}
                  placeholder="Например: 662a1c..."
                  className="bg-neutral-900 border-neutral-800"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-neutral-400 hover:bg-neutral-900">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateStation} 
                disabled={!selectedStation.name || !selectedStation.ownerId || selectedStation.ownerId.length !== 24}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать СТО</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Внесите изменения в реквизиты СТО.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={selectedStation.name}
                onChange={(e) => setSelectedStation(prev => ({ ...prev, name: e.target.value }))}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
            <div className="grid gap-2">
              <Label>Адрес</Label>
              <Input
                value={selectedStation.address}
                onChange={(e) => setSelectedStation(prev => ({ ...prev, address: e.target.value }))}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div className="grid gap-2">
              <Label>ID Владельца (User ObjectId)</Label>
              <Input
                value={selectedStation.ownerId || ""}
                onChange={(e) => setSelectedStation(prev => ({ ...prev, ownerId: e.target.value }))}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)} className="text-neutral-400 hover:bg-neutral-900">
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateStation} 
              disabled={!selectedStation.name || !selectedStation.ownerId || selectedStation.ownerId.length !== 24}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-neutral-400">Загрузка филиалов...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="name" />
      )}
    </div>
  )
}
