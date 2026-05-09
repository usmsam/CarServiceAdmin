"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { CatalogItem, CatalogService } from "@/api/catalog.service"
import { ServiceCategory, ServiceCategoriesService } from "@/api/categories.service"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Edit, Wrench, Layers } from "lucide-react"
import { motion } from "framer-motion"

export default function CatalogPage() {
  const [data, setData] = useState<CatalogItem[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Partial<CatalogItem>>({
    categoryId: "",
    title: "",
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        CatalogService.getItems(),
        ServiceCategoriesService.getCategories(),
      ])
      setData(itemsRes)
      setCategories(categoriesRes)
    } catch (error) {
      console.error("Не удалось загрузить данные каталога", error)
      setData([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateItem = async () => {
    try {
      const payload = {
        title: selectedItem.title,
        categoryId: selectedItem.categoryId && selectedItem.categoryId !== "none" ? selectedItem.categoryId : undefined
      }
      await CatalogService.createItem(payload)
      setOpenCreate(false)
      setSelectedItem({ categoryId: "", title: "" })
      fetchData()
    } catch (error) {
      console.error("Не удалось создать услугу", error)
    }
  }

  const handleUpdateItem = async () => {
    if (!selectedItem._id) return
    try {
      const catId = selectedItem.categoryId?._id || selectedItem.categoryId;
      await CatalogService.updateItem(selectedItem._id, {
        categoryId: catId && catId !== "none" ? catId : undefined,
        title: selectedItem.title,
      })
      setOpenEdit(false)
      setSelectedItem({ categoryId: "", title: "" })
      fetchData()
    } catch (error) {
      console.error("Не удалось обновить услугу", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту работу?")) return
    try {
      await CatalogService.deleteItem(id)
      fetchData()
    } catch (error) {
      console.error("Не удалось удалить услугу", error)
    }
  }

  const columns: ColumnDef<CatalogItem>[] = [
    {
      accessorKey: "title",
      header: "Название работы",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Wrench className="h-4 w-4 text-rose-400" />
          </div>
          <span className="font-medium text-slate-900">{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: "Категория",
      cell: ({ row }) => {
        const cat = row.getValue("categoryId") as any
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <Layers className="h-3 w-3" />
            {cat?.name || cat || "Без категории"}
          </div>
        )
      },
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
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
              onClick={() => {
                setSelectedItem(row.original)
                setOpenEdit(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              onClick={() => handleDeleteItem(row.original._id)}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Справочник работ</h2>
          <p className="text-slate-500 mt-1">Единый глобальный реестр услуг для всех СТО.</p>
        </div>
        
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="bg-rose-600 hover:bg-rose-700 text-slate-900 shadow-lg shadow-rose-500/20 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Добавить работу
            </Button>
          } />
          <DialogContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добавить новую работу</DialogTitle>
              <DialogDescription className="text-slate-500">
                Введите наименование оказываемой услуги.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-slate-50 border-slate-200 focus:border-rose-500"
                />
              </div>
              <div className="grid gap-2">
                <Label>Категория</Label>
                <Select
                  value={typeof selectedItem.categoryId === 'object' ? selectedItem.categoryId._id : (selectedItem.categoryId || "none")}
                  onValueChange={(val: string | null) => {
                    setSelectedItem(prev => ({ ...prev, categoryId: val === "none" ? undefined : val }))
                  }}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-rose-500">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
                    <SelectItem value="none">Без категории</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateItem} 
                disabled={!selectedItem.title}
                className="bg-rose-600 hover:bg-rose-700 text-slate-900"
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
            <DialogTitle>Изменить услугу</DialogTitle>
            <DialogDescription className="text-slate-500">
              Внесите изменения в параметры работы.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={selectedItem.title}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-50 border-slate-200 focus:border-rose-500"
              />
            </div>
            <div className="grid gap-2">
              <Label>Категория</Label>
              <Select
                value={typeof selectedItem.categoryId === 'object' ? selectedItem.categoryId._id : (selectedItem.categoryId || "none")}
                onValueChange={(val: string | null) => {
                  setSelectedItem(prev => ({ ...prev, categoryId: val === "none" ? undefined : val }))
                }}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-rose-500">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
                  <SelectItem value="none">Без категории</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateItem} 
              disabled={!selectedItem.title}
              className="bg-rose-600 hover:bg-rose-700 text-slate-900"
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="title" />
        </div>
      )}
    </motion.div>
  )
}
