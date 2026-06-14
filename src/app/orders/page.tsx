"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { CalendarClock, ShoppingBag, Eye } from "lucide-react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { OrdersService, Order } from "@/api/orders.service"

type RefValue =
  | {
      _id?: string
      name?: string
      address?: string
      fullName?: string
      phone?: string
      brand?: string
      model?: string
      licensePlate?: string
      vin?: string
    }
  | string
  | null
  | undefined

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    const items = await OrdersService.getOrders({ archived: "all" })
    return items
  }

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const items = await loadOrders()
        if (active) setData(items)
      } catch (error) {
        console.error("Не удалось загрузить заказы", error)
        if (active) setData([])
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "_id",
      header: "ID заказа",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ShoppingBag className="h-4 w-4 text-blue-400" />
          </div>
          <span className="font-medium text-slate-900">#{row.getValue<string>("_id").slice(-6).toUpperCase()}</span>
        </div>
      ),
    },
    {
      accessorKey: "bookingId",
      header: "Booking",
      cell: ({ row }) => <div className="text-slate-700">{formatRef(row.original.bookingId)}</div>,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const tone =
          status === "DONE"
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            : status === "OPEN"
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
              : status === "CLOSED"
                ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"

        return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {new Date(row.getValue("createdAt")).toLocaleDateString("ru-RU")}
        </div>
      ),
    },
    {
      accessorKey: "vehicleId",
      header: "Автомобиль",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{formatRef(row.original.vehicleId, "Не указано")}</span>
          <span className="text-xs text-slate-500">{formatRefMeta(row.original.vehicleId)}</span>
        </div>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Клиент",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{formatRef(row.original.clientId, "Не указано")}</span>
          <span className="text-xs text-slate-500">{formatRefMeta(row.original.clientId)}</span>
        </div>
      ),
    },
    {
      accessorKey: "masterId",
      header: "Мастер",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{formatRef(row.original.masterId, "Не назначен")}</span>
          <span className="text-xs text-slate-500">{formatRefMeta(row.original.masterId)}</span>
        </div>
      ),
    },
    {
      id: "station",
      header: "СТО",
      cell: ({ row }) => {
        const station = row.original.stationId
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{formatRef(station, "Неизвестно")}</span>
            <span className="text-xs text-slate-500">{formatPhone(station)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "mileage",
      header: "Пробег",
      cell: ({ row }) => (
        <div className="text-slate-700">
          {row.original.mileage != null ? `${row.original.mileage.toLocaleString("ru-RU")} км` : "—"}
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Заметка",
      cell: ({ row }) => (
        <div className="max-w-[280px] truncate text-slate-700" title={row.original.note || ""}>
          {row.original.note || "—"}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Сумма</div>,
      cell: ({ row }) => {
        const amount = Number(row.getValue("totalAmount") || 0)
        const formatted = new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "UZS",
          maximumFractionDigits: 0,
        }).format(amount)
        return <div className="text-right font-bold text-slate-900 tracking-tight">{formatted}</div>
      },
    },
    {
      accessorKey: "createdBy",
      header: "Создал",
      cell: ({ row }) => <div className="text-slate-700">{formatRef(row.original.createdBy)}</div>,
    },
    {
      accessorKey: "updatedBy",
      header: "Обновил",
      cell: ({ row }) => <div className="text-slate-700">{formatRef(row.original.updatedBy)}</div>,
    },
    {
      accessorKey: "archivedAt",
      header: "Архив",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-slate-700">
            {row.original.archivedAt ? new Date(row.original.archivedAt).toLocaleString("ru-RU") : "—"}
          </span>
          <span className="text-xs text-slate-500">{formatRef(row.original.archivedBy)}</span>
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Обновлён",
      cell: ({ row }) => (
        <div className="text-slate-700">{new Date(row.original.updatedAt).toLocaleString("ru-RU")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Действия</div>,
      cell: ({ row }) => (
        <div className="flex justify-end items-center gap-2 pr-4">
          <Link
            href={`/orders/${row.original._id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
            aria-label={`Открыть заказ ${row.original._id.slice(-6).toUpperCase()}`}
          >
              <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ]

  function formatRef(ref: RefValue, fallback = "—") {
    if (!ref) return fallback
    if (typeof ref === "string") return ref
    return ref.fullName || ref.name || ref.licensePlate || ref.model || fallback
  }

  function formatRefMeta(ref: RefValue) {
    if (!ref || typeof ref === "string") return ""
    return [ref.phone, ref.address, ref.vin].filter(Boolean).join(" • ")
  }

  function formatPhone(ref: RefValue) {
    if (!ref || typeof ref === "string") return ""
    return ref.phone || ""
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Заказы backoffice</h2>
          <p className="text-sm text-slate-500 mt-1">Только просмотр списка и переход в детальную карточку.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="createdAt" />
        </div>
      )}
    </motion.div>
  )
}
