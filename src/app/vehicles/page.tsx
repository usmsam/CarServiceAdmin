"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { CarFront, Fingerprint } from "lucide-react"

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
      accessorKey: "brand",
      header: "Марка",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CarFront className="h-4 w-4 text-neutral-500" />
          <span className="font-medium text-white">{row.getValue("brand")}</span>
        </div>
      )
    },
    {
      accessorKey: "model",
      header: "Модель",
      cell: ({ row }) => <span className="text-neutral-300">{row.getValue("model")}</span>
    },
    {
      accessorKey: "vin",
      header: "VIN код",
      cell: ({ row }) => {
        const vin = row.getValue<string>("vin")
        return (
          <div className="flex items-center gap-2 text-neutral-400">
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
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Автомобили</h2>
          <p className="text-neutral-400 mt-1">База данных транспортных средств клиентов.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <DataTable columns={columns} data={data} searchKey="licensePlate" />
        </div>
      )}
    </motion.div>
  )
}
