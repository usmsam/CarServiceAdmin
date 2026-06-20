"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Layers, Plus, Save, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  TemplateCategory,
  TemplateItem,
  TemplatesService,
} from "@/api/templates.service"

const segments = ["all", "sto", "detailing", "tire", "wash", "fleet", "mobile"] as const

export default function TemplatesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [items, setItems] = useState<TemplateItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [segment, setSegment] = useState<(typeof segments)[number]>("all")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    nameRu: "",
    nameUz: "",
    segment: "sto",
    order: 0,
  })
  const [editingCategoryId, setEditingCategoryId] = useState("")
  const [itemForm, setItemForm] = useState({
    titleRu: "",
    titleUz: "",
    aliasesRu: "",
    aliasesUz: "",
    defaultPrice: 0,
    isActive: true,
  })
  const [editingItemId, setEditingItemId] = useState("")

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  )

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await TemplatesService.getCategories(segment === "all" ? undefined : segment)
      setCategories(data)
      setSelectedCategoryId((current) => {
        if (current && data.some((category) => category._id === current)) return current
        return data[0]?._id || ""
      })
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async (categoryId: string) => {
    if (!categoryId) {
      setItems([])
      return
    }
    setItems(await TemplatesService.getItems(categoryId))
  }

  useEffect(() => {
    void loadCategories()
  }, [segment])

  useEffect(() => {
    void loadItems(selectedCategoryId)
  }, [selectedCategoryId])

  const saveCategory = async () => {
    setSaving(true)
    try {
      const payload = {
        name: categoryForm.nameRu,
        nameRu: categoryForm.nameRu,
        nameUz: categoryForm.nameUz || undefined,
        segment: categoryForm.segment,
        order: Number(categoryForm.order) || 0,
      }
      if (editingCategoryId) {
        await TemplatesService.updateCategory(editingCategoryId, payload)
      } else {
        await TemplatesService.createCategory(payload)
      }
      setCategoryForm({ nameRu: "", nameUz: "", segment: "sto", order: 0 })
      setEditingCategoryId("")
      await loadCategories()
    } finally {
      setSaving(false)
    }
  }

  const editCategory = (category: TemplateCategory) => {
    setEditingCategoryId(category._id)
    setCategoryForm({
      nameRu: category.nameRu || category.name,
      nameUz: category.nameUz || "",
      segment: category.segment || "sto",
      order: category.order || 0,
    })
  }

  const saveItem = async () => {
    if (!selectedCategoryId) return
    setSaving(true)
    try {
      const payload = {
        title: itemForm.titleRu,
        titleRu: itemForm.titleRu,
        titleUz: itemForm.titleUz || undefined,
        aliasesRu: itemForm.aliasesRu.split(",").map((item) => item.trim()).filter(Boolean),
        aliasesUz: itemForm.aliasesUz.split(",").map((item) => item.trim()).filter(Boolean),
        defaultPrice: Number(itemForm.defaultPrice) || 0,
        isActive: itemForm.isActive,
      }
      if (editingItemId) {
        await TemplatesService.updateItem(editingItemId, payload)
      } else {
        await TemplatesService.createItem({ ...payload, templateCategoryId: selectedCategoryId })
      }
      setItemForm({ titleRu: "", titleUz: "", aliasesRu: "", aliasesUz: "", defaultPrice: 0, isActive: true })
      setEditingItemId("")
      await loadItems(selectedCategoryId)
    } finally {
      setSaving(false)
    }
  }

  const editItem = (item: TemplateItem) => {
    setEditingItemId(item._id)
    setItemForm({
      titleRu: item.titleRu || item.title,
      titleUz: item.titleUz || "",
      aliasesRu: (item.aliasesRu || []).join(", "),
      aliasesUz: (item.aliasesUz || []).join(", "),
      defaultPrice: item.defaultPrice || 0,
      isActive: item.isActive !== false,
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Шаблоны категорий и услуг</h2>
          <p className="text-sm text-slate-500 mt-1">Эталонный каталог, из которого владельцы добавляют услуги в свои СТО.</p>
        </div>
        <Badge className="w-fit bg-slate-900 text-white border-0">{categories.length} категорий</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {segments.map((item) => (
          <button
            key={item}
            onClick={() => setSegment(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              segment === item ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {item === "all" ? "Все сегменты" : item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Категории</h3>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="col-span-2 grid gap-1">
              <Label>Название RU</Label>
              <Input value={categoryForm.nameRu} onChange={(event) => setCategoryForm((prev) => ({ ...prev, nameRu: event.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Название UZ</Label>
              <Input value={categoryForm.nameUz} onChange={(event) => setCategoryForm((prev) => ({ ...prev, nameUz: event.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Порядок</Label>
              <Input type="number" value={categoryForm.order} onChange={(event) => setCategoryForm((prev) => ({ ...prev, order: Number(event.target.value) }))} />
            </div>
            <div className="col-span-2 grid gap-1">
              <Label>Сегмент</Label>
              <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={categoryForm.segment} onChange={(event) => setCategoryForm((prev) => ({ ...prev, segment: event.target.value }))}>
                {segments.filter((item) => item !== "all").map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <Button disabled={saving || !categoryForm.nameRu} onClick={saveCategory} className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingCategoryId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {editingCategoryId ? "Сохранить категорию" : "Добавить категорию"}
            </Button>
          </div>

          <div className="max-h-[56vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">Загрузка...</div>
            ) : categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategoryId(category._id)}
                onDoubleClick={() => editCategory(category)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  selectedCategoryId === category._id ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="font-semibold text-slate-900">{category.nameRu || category.name}</div>
                <div className="mt-1 text-xs text-slate-500">{category.segment} · order {category.order}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-rose-500" />
                {selectedCategory?.nameRu || selectedCategory?.name || "Выберите категорию"}
              </h3>
              <p className="text-sm text-slate-500">{items.length} шаблонных услуг</p>
            </div>
          </div>

          {selectedCategoryId ? (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3">
              <Input placeholder="Услуга RU" value={itemForm.titleRu} onChange={(event) => setItemForm((prev) => ({ ...prev, titleRu: event.target.value }))} />
              <Input placeholder="Услуга UZ" value={itemForm.titleUz} onChange={(event) => setItemForm((prev) => ({ ...prev, titleUz: event.target.value }))} />
              <Input placeholder="Алиасы RU через запятую" value={itemForm.aliasesRu} onChange={(event) => setItemForm((prev) => ({ ...prev, aliasesRu: event.target.value }))} />
              <Input type="number" placeholder="Цена по умолчанию" value={itemForm.defaultPrice} onChange={(event) => setItemForm((prev) => ({ ...prev, defaultPrice: Number(event.target.value) }))} />
              <button onClick={() => setItemForm((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`rounded-md border px-3 py-2 text-sm font-semibold ${itemForm.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
                {itemForm.isActive ? "Активна" : "Выключена"}
              </button>
              <Button disabled={saving || !itemForm.titleRu} onClick={saveItem} className="bg-slate-900 hover:bg-slate-800 text-white">
                {editingItemId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {editingItemId ? "Сохранить услугу" : "Добавить услугу"}
              </Button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {items.map((item) => (
              <button key={item._id} onClick={() => editItem(item)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900">{item.titleRu || item.title}</div>
                  {item.isActive !== false ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
                </div>
                <div className="mt-1 text-xs text-slate-500">{(item.defaultPrice || 0).toLocaleString("ru-RU")} сум</div>
                {(item.aliasesRu || []).length > 0 ? (
                  <div className="mt-2 line-clamp-1 text-xs text-slate-400">{item.aliasesRu?.join(", ")}</div>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  )
}
