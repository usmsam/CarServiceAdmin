"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"
import { useUserStore } from "@/store/user.store"
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
        console.error("Failed to load vehicles", error)
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
      header: "License Plate",
      cell: ({ row }) => <div className="font-medium text-blue-400">{row.getValue("licensePlate")}</div>,
    },
    {
      accessorKey: "brand",
      header: "Brand",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "vin",
      header: "VIN",
      cell: ({ row }) => <div className="text-neutral-400">{row.getValue("vin") || "-"}</div>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Vehicles</h2>
          <p className="text-neutral-400">View and manage customer vehicles.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-neutral-400">Loading vehicles...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="licensePlate" />
      )}
    </div>
  )
}
