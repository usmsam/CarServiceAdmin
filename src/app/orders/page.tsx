"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Order, OrdersService } from "@/api/orders.service"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  IN_PROGRESS: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  COMPLETED: "bg-green-500/20 text-green-500 border-green-500/50",
  CANCELLED: "bg-red-500/20 text-red-500 border-red-500/50",
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
        // Mock data fallback
        setData([
          { id: "1", orderNumber: "ORD-001", clientId: "c1", vehicleId: "v1", status: "PENDING", totalPrice: 150.00, createdAt: "2024-05-01", serviceId: "s1" },
          { id: "2", orderNumber: "ORD-002", clientId: "c2", vehicleId: "v2", status: "IN_PROGRESS", totalPrice: 450.00, createdAt: "2024-05-02", serviceId: "s1" },
          { id: "3", orderNumber: "ORD-003", clientId: "c3", vehicleId: "v3", status: "COMPLETED", totalPrice: 890.00, createdAt: "2024-05-03", serviceId: "s1" },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
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
      accessorKey: "totalPrice",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalPrice"))
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
        <DataTable columns={columns} data={data} searchKey="orderNumber" />
      )}
    </div>
  )
}
