"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ServiceCategoriesService, ServiceCategory } from "@/api/categories.service"
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
import { Plus, Trash2, Edit, Layers } from "lucide-react"
import { motion } from "framer-motion"

export default function CategoriesPage() {
  const [data, setData] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Partial<ServiceCategory>>({
    name: "",
    order: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const categories = await ServiceCategoriesService.getCategories()
      setData(categories)
    } catch (error) {
      console.error("Не удалось загрузить категории", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateCategory = async () => {
    try {
      await ServiceCategoriesService.createCategory(selectedCategory)
      setOpenCreate(false)
      setSelectedCategory({ name: "", order: 0 })
      fetchData()
    } catch (error) {
      console.error("Не удалось создать категорию", error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory._id) return
    try {
      await ServiceCategoriesService.updateCategory(selectedCategory._id, {
        name: selectedCategory.name,
        order: selectedCategory.order,
      })
      setOpenEdit(false)
      setSelectedCategory({ name: "", order: 0 })
      fetchData()
    } catch (error) {
      console.error("Не удалось обновить категорию", error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return
    try {
      await ServiceCategoriesService.deleteCategory(id)
      fetchData()
    } catch (error) {
      console.error("Не удалось удалить категорию", error)
    }
  }

  const columns: ColumnDef<ServiceCategory>[] = [
    {
      accessorKey: "name",
      header: "Название категории",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="font-medium text-slate-900">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "order",
      header: "Порядок",
      cell: ({ row }) => <div className="text-slate-500">{row.getValue("order")}</div>,
    },
    {
      id: "station",
      header: "СТО",
      cell: ({ row }) => {
        const station = row.original.serviceId as any;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{station?.name || 'Общая'}</span>
            <span className="text-xs text-slate-500">{station?.address || ''}</span>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Действия</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end items-center gap-2 pr-4">
            {/* <Button
              variant="ghost"
              size="icon"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
              onClick={() => {
                setSelectedCategory(row.original)
                setOpenEdit(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              onClick={() => handleDeleteCategory(row.original._id)}
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Категории услуг</h2>
          <p className="text-sm text-slate-500 mt-1">Управление категориями для группировки услуг.</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Добавить категорию
            </Button>
          } />
          <DialogContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Новая категория</DialogTitle>
              <DialogDescription className="text-slate-500">
                Введите название и порядок сортировки для новой категории.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-50 border-slate-200 focus:border-blue-500"
                  placeholder="Например: Шиномонтаж"
                />
              </div>
              <div className="grid gap-2">
                <Label>Порядок сортировки</Label>
                <Input
                  type="number"
                  value={selectedCategory.order}
                  onChange={(e) => setSelectedCategory(prev => ({ ...prev, order: Number(e.target.value) }))}
                  className="bg-slate-50 border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                Отмена
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={!selectedCategory.name}
                className="bg-blue-600 hover:bg-blue-700 text-slate-900"
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
            <DialogTitle>Редактировать категорию</DialogTitle>
            <DialogDescription className="text-slate-500">
              Внесите изменения в категорию услуг.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={selectedCategory.name}
                onChange={(e) => setSelectedCategory(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-50 border-slate-200 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={selectedCategory.order}
                onChange={(e) => setSelectedCategory(prev => ({ ...prev, order: Number(e.target.value) }))}
                className="bg-slate-50 border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              Отмена
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={!selectedCategory.name}
              className="bg-blue-600 hover:bg-blue-700 text-slate-900"
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="name" />
        </div>
      )}
    </motion.div>
  )
}
