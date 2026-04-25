"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Order, OrdersService } from "@/api/orders.service"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  OPEN: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  IN_PROGRESS: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  DONE: "bg-green-500/20 text-green-500 border-green-500/50",
  CLOSED: "bg-neutral-500/20 text-neutral-500 border-neutral-500/50",
}

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For demo purposes, generating fake data if API is not available
    const fetchData = async () => {
      try {
        const orders = await OrdersService.getOrders()
        setData(orders)
      } catch (error) {
        console.error("Failed to load orders", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString()
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${statusColors[status] || ""}`}>
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount") || "0")
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Orders</h2>
        <p className="text-neutral-400">Manage all service orders here.</p>
      </div>

      {loading ? (
        <div className="text-neutral-400">Loading orders...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="_id" />
      )}
    </div>
  )
}
