"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { CatalogItem, CatalogService } from "@/api/catalog.service"
import { useUserStore } from "@/store/user.store"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CatalogPage() {
  const [data, setData] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const currentUser = useUserStore(state => state.user)

  useEffect(() => {
    // For demo purposes, generating fake data if API is not available
    const fetchData = async () => {
      try {
        if (currentUser?.serviceId) {
          const items = await CatalogService.getItems(currentUser.serviceId)
          setData(items)
        } else {
          // If no serviceId, maybe fetch all if SUPERADMIN? For now, fetch with undefined if no serviceId.
          const items = await CatalogService.getItems(currentUser?.activeServiceId || '')
          setData(items)
        }
      } catch (error) {
        console.error("Failed to load catalog", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  const columns: ColumnDef<CatalogItem>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="text-neutral-400">{row.getValue("category") || "-"}</div>,
    },
    {
      accessorKey: "normHour",
      header: "Norm Hour",
      cell: ({ row }) => <div className="text-neutral-400">{row.getValue("normHour")} h</div>,
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Service Catalog</h2>
          <p className="text-neutral-400">Manage your price list and services.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {loading ? (
        <div className="text-neutral-400">Loading catalog...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="title" />
      )}
    </div>
  )
}
