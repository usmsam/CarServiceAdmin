"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"
import { ColumnDef } from "@tanstack/react-table"

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
      cell: ({ row }) => <div className="font-medium text-blue-400">{row.getValue("licensePlate")}</div>,
    },
    {
      accessorKey: "brand",
      header: "Марка",
    },
    {
      accessorKey: "model",
      header: "Модель",
    },
    {
      accessorKey: "vin",
      header: "VIN код",
      cell: ({ row }) => <div className="text-neutral-400">{row.getValue("vin") || "-"}</div>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Автомобили</h2>
          <p className="text-neutral-400">База данных транспортных средств клиентов.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-neutral-400">Загрузка автопарка...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="licensePlate" />
      )}
    </div>
  )
}
