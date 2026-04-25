"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { CatalogItem, CatalogService } from "@/api/catalog.service"
import { ServiceCategory, ServiceCategoriesService } from "@/api/categories.service"
import { useUserStore } from "@/store/user.store"
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
import { Plus, Trash2, Edit } from "lucide-react"

export default function CatalogPage() {
  const [data, setData] = useState<CatalogItem[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useUserStore()

  const [activeTab, setActiveTab] = useState<"services" | "categories">("services")

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Partial<CatalogItem>>({
    categoryId: "",
    title: "",
  })

  const [openCatCreate, setOpenCatCreate] = useState(false)
  const [openCatEdit, setOpenCatEdit] = useState(false)
  const [selectedCat, setSelectedCat] = useState<Partial<ServiceCategory>>({
    name: "",
    order: 0,
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
  }, [currentUser])

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

  const handleCreateCat = async () => {
    try {
      await ServiceCategoriesService.createCategory(selectedCat)
      setOpenCatCreate(false)
      setSelectedCat({ name: "", order: 0 })
      fetchData()
    } catch (error) {
      console.error("Не удалось создать категорию", error)
    }
  }

  const handleUpdateCat = async () => {
    if (!selectedCat._id) return
    try {
      await ServiceCategoriesService.updateCategory(selectedCat._id, {
        name: selectedCat.name,
        order: selectedCat.order,
      })
      setOpenCatEdit(false)
      setSelectedCat({ name: "", order: 0 })
      fetchData()
    } catch (error) {
      console.error("Не удалось обновить категорию", error)
    }
  }

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return
    try {
      await ServiceCategoriesService.deleteCategory(id)
      fetchData()
    } catch (error) {
      console.error("Не удалось удалить категорию", error)
    }
  }

  const serviceColumns: ColumnDef<CatalogItem>[] = [
    {
      accessorKey: "title",
      header: "Название работы",
      cell: ({ row }) => <div className="font-medium text-white">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "categoryId",
      header: "Категория",
      cell: ({ row }) => {
        const cat = row.getValue("categoryId") as any
        return <div className="text-neutral-400">{cat?.name || cat || "Без категории"}</div>
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Действия</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
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
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => handleDeleteItem(row.original._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    },
  ]

  const categoryColumns: ColumnDef<ServiceCategory>[] = [
    {
      accessorKey: "name",
      header: "Название категории",
      cell: ({ row }) => <div className="font-medium text-white">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "order",
      header: "Порядок сортировки",
      cell: ({ row }) => <div className="text-neutral-400">{row.getValue("order")}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-center">Действия</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              onClick={() => {
                setSelectedCat(row.original)
                setOpenCatEdit(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => handleDeleteCat(row.original._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    },
  ]

  const isSuperAdmin = currentUser?.role === "SUPERADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Справочник работ</h2>
          <p className="text-neutral-400">Единый глобальный реестр услуг для всех СТО.</p>
        </div>
        
        {activeTab === "services" ? (
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger render={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Добавить работу
              </Button>
            } />
            <DialogContent className="bg-neutral-950 border-neutral-800 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Добавить новую работу</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Введите наименование оказываемой услуги.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input
                    value={selectedItem.title}
                    onChange={(e) => setSelectedItem(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-neutral-900 border-neutral-800"
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
                    <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
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
                <Button variant="ghost" onClick={() => setOpenCreate(false)} className="text-neutral-400 hover:bg-neutral-900">
                  Отмена
                </Button>
                <Button 
                  onClick={handleCreateItem} 
                  disabled={!selectedItem.title}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={openCatCreate} onOpenChange={setOpenCatCreate}>
            <DialogTrigger render={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Добавить категорию
              </Button>
            } />
            <DialogContent className="bg-neutral-950 border-neutral-800 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Добавить категорию</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Введите название новой группы услуг.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input
                    value={selectedCat.name}
                    onChange={(e) => setSelectedCat(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-neutral-900 border-neutral-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Порядок</Label>
                  <Input
                    type="number"
                    value={selectedCat.order}
                    onChange={(e) => setSelectedCat(prev => ({ ...prev, order: parseFloat(e.target.value) }))}
                    className="bg-neutral-900 border-neutral-800"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpenCatCreate(false)} className="text-neutral-400 hover:bg-neutral-900">
                  Отмена
                </Button>
                <Button 
                  onClick={handleCreateCat} 
                  disabled={!selectedCat.name}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isSuperAdmin && (
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "services" ? "border-blue-500 text-blue-500" : "border-transparent text-neutral-400 hover:text-white"}`}
          >
            Работы
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "categories" ? "border-blue-500 text-blue-500" : "border-transparent text-neutral-400 hover:text-white"}`}
          >
            Категории
          </button>
        </div>
      )}

      {/* Edit Dialog Services */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Изменить услугу</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Внесите изменения в параметры работы.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={selectedItem.title}
                onChange={(e) => setSelectedItem(prev => ({ ...prev, title: e.target.value }))}
                className="bg-neutral-900 border-neutral-800"
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
                <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
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
            <Button variant="ghost" onClick={() => setOpenEdit(false)} className="text-neutral-400 hover:bg-neutral-900">
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateItem} 
              disabled={!selectedItem.title}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog Categories */}
      <Dialog open={openCatEdit} onOpenChange={setOpenCatEdit}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Изменить категорию</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Отредактируйте наименование группы.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={selectedCat.name}
                onChange={(e) => setSelectedCat(prev => ({ ...prev, name: e.target.value }))}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
            <div className="grid gap-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={selectedCat.order}
                onChange={(e) => setSelectedCat(prev => ({ ...prev, order: parseFloat(e.target.value) }))}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenCatEdit(false)} className="text-neutral-400 hover:bg-neutral-900">
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateCat} 
              disabled={!selectedCat.name}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-neutral-400">Загрузка...</div>
      ) : activeTab === "services" ? (
        <DataTable columns={serviceColumns} data={data} searchKey="title" />
      ) : (
        <DataTable columns={categoryColumns} data={categories} searchKey="name" />
      )}
    </div>
  )
}
