"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { CarFront, Fingerprint, Eye, CalendarClock, User as UserIcon } from "lucide-react"

export default function VehiclesPage() {
  const [data, setData] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await VehiclesService.getVehicles()
        setData(items)
      } catch (error) {
        console.error("Не удалось загрузить автомобили", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "licensePlate",
      header: "Гос. номер",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <span className="font-bold text-purple-400 tracking-wider">
              {row.getValue<string>("licensePlate").toUpperCase()}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ownerId",
      header: "Владелец",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900">
              {formatOwner(row.original.ownerId)}
            </span>
          </div>
          <span className="text-xs text-slate-500">{formatOwnerId(row.original.ownerId)}</span>
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: "Марка",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CarFront className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">{row.getValue("brand")}</span>
        </div>
      )
    },
    {
      accessorKey: "model",
      header: "Модель",
      cell: ({ row }) => <span className="text-slate-700">{row.getValue("model")}</span>
    },
    {
      accessorKey: "vin",
      header: "VIN код",
      cell: ({ row }) => {
        const vin = row.getValue<string>("vin")
        return (
          <div className="flex items-center gap-2 text-slate-500">
            {vin ? (
              <>
                <Fingerprint className="h-3 w-3" />
                <span className="font-mono text-xs">{vin}</span>
              </>
            ) : (
              "-"
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Создан",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Обновлён",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Действия</div>,
      cell: ({ row }) => (
        <div className="flex justify-end items-center gap-2 pr-4">
          <Link
            href={`/vehicles/${row.original._id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
            aria-label={`Открыть авто ${row.original.licensePlate.toUpperCase()}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Автомобили</h2>
          <p className="text-sm text-slate-500 mt-1">Список всех авто с полными полями и переходом в детальную карточку.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="licensePlate" />
        </div>
      )}
    </motion.div>
  )

  function formatOwner(owner: Vehicle["ownerId"]) {
    if (!owner) return "—"
    if (typeof owner === "string") return owner
    return owner.fullName || owner.name || owner._id || "—"
  }

  function formatOwnerId(owner: Vehicle["ownerId"]) {
    if (!owner) return ""
    if (typeof owner === "string") return owner
    return owner._id || ""
  }
}
