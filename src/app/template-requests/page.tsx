"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, GitMerge, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  TemplateProposal,
  TemplateProposalsService,
  TemplateProposalStatus,
  TemplateProposalType,
} from "@/api/template-proposals.service"
import { TemplateCategory, TemplateItem, TemplatesService } from "@/api/templates.service"

type StatusFilter = TemplateProposalStatus | "all"
type TypeFilter = TemplateProposalType | "all"

const statusFilters: StatusFilter[] = ["new", "all", "approved", "merged", "rejected"]

export default function TemplateRequestsPage() {
  const [proposals, setProposals] = useState<TemplateProposal[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [items, setItems] = useState<TemplateItem[]>([])
  const [selected, setSelected] = useState<TemplateProposal | null>(null)
  const [status, setStatus] = useState<StatusFilter>("new")
  const [type, setType] = useState<TypeFilter>("all")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [itemId, setItemId] = useState("")
  const [price, setPrice] = useState(0)
  const [comment, setComment] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const [proposalData, categoryData] = await Promise.all([
        TemplateProposalsService.getProposals({
          status: status === "all" ? undefined : status,
          type: type === "all" ? undefined : type,
        }),
        TemplatesService.getCategories(),
      ])
      setProposals(proposalData)
      setCategories(categoryData)
      setSelected((current) => {
        if (current && proposalData.some((proposal) => proposal._id === current._id)) return current
        return proposalData[0] || null
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [status, type])

  useEffect(() => {
    if (!categoryId) {
      setItems([])
      return
    }
    void TemplatesService.getItems(categoryId).then(setItems)
  }, [categoryId])

  useEffect(() => {
    if (!selected) return
    setComment("")
    setItemId("")
    setPrice(0)

    if (selected.type === "service") {
      const matched = categories.find((category) =>
        (category.nameRu || category.name).toLowerCase() === (selected.categoryQuery || "").toLowerCase(),
      )
      setCategoryId(matched?._id || categories[0]?._id || "")
    } else {
      setCategoryId(categories[0]?._id || "")
    }
  }, [selected?._id, categories])

  const visibleCounts = useMemo(() => {
    return proposals.reduce<Record<string, number>>((acc, proposal) => {
      acc[proposal.status] = (acc[proposal.status] || 0) + 1
      return acc
    }, {})
  }, [proposals])

  const title = selected?.titleRu || selected?.query || ""
  const station = typeof selected?.stationId === "object" ? selected.stationId : null
  const owner = typeof selected?.ownerId === "object" ? selected.ownerId : null

  const afterAction = async () => {
    setSelected(null)
    await load()
  }

  const approve = async () => {
    if (!selected) return
    setSaving(true)
    try {
      if (selected.type === "category") {
        await TemplateProposalsService.approveCategory(selected._id, {
          name: title,
          nameRu: title,
          nameUz: selected.titleUz,
          segment: "sto",
          adminComment: comment,
        })
      } else if (categoryId) {
        await TemplateProposalsService.approveService(selected._id, {
          templateCategoryId: categoryId,
          title,
          titleRu: title,
          titleUz: selected.titleUz,
          defaultPrice: price,
          adminComment: comment,
        })
      }
      await afterAction()
    } finally {
      setSaving(false)
    }
  }

  const merge = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await TemplateProposalsService.merge(selected._id, {
        templateCategoryId: selected.type === "category" ? categoryId : undefined,
        templateItemId: selected.type === "service" ? itemId : undefined,
        adminComment: comment,
      })
      await afterAction()
    } finally {
      setSaving(false)
    }
  }

  const reject = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await TemplateProposalsService.reject(selected._id, { adminComment: comment })
      await afterAction()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Заявки на шаблоны</h2>
          <p className="text-sm text-slate-500 mt-1">Модерация категорий и услуг, которые не нашлись у владельца СТО.</p>
        </div>
        <Button variant="outline" onClick={load} className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              status === item ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {statusLabel(item)} {item !== "all" ? visibleCounts[item] || "" : ""}
          </button>
        ))}
        {(["all", "category", "service"] as TypeFilter[]).map((item) => (
          <button
            key={item}
            onClick={() => setType(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              type === item ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {item === "all" ? "Все типы" : item === "category" ? "Категории" : "Услуги"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">Загрузка...</div>
            ) : proposals.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Заявок нет</div>
            ) : proposals.map((proposal) => {
              const proposalStation = typeof proposal.stationId === "object" ? proposal.stationId : null
              return (
                <button
                  key={proposal._id}
                  onClick={() => setSelected(proposal)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selected?._id === proposal._id ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{proposal.titleRu || proposal.query}</div>
                      <div className="mt-1 text-xs text-slate-500">{proposal.type} · {proposalStation?.name || "СТО"}</div>
                    </div>
                    <Badge className={proposalTone(proposal.status)}>{proposal.status}</Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selected ? (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-slate-400">Выберите заявку</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{selected.type}</div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {station?.name || "СТО не загружена"} · {owner?.fullName || "Автор не загружен"}
                  </p>
                </div>
                <Badge className={proposalTone(selected.status)}>{selected.status}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Info label="Категория из заявки" value={selected.categoryQuery || "—"} />
                <Info label="Создана" value={selected.createdAt ? new Date(selected.createdAt).toLocaleString("ru-RU") : "—"} />
                <Info label="Комментарий владельца" value={selected.comment || "—"} wide />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LabelLike>Шаблонная категория</LabelLike>
                    <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                      <option value="">Не выбрана</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>{category.nameRu || category.name}</option>
                      ))}
                    </select>
                  </div>

                  {selected.type === "service" ? (
                    <div>
                      <LabelLike>Цена по умолчанию</LabelLike>
                      <Input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
                    </div>
                  ) : null}
                </div>

                {selected.type === "service" ? (
                  <div>
                    <LabelLike>Существующая услуга для merge</LabelLike>
                    <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={itemId} onChange={(event) => setItemId(event.target.value)}>
                      <option value="">Не выбрана</option>
                      {items.map((item) => (
                        <option key={item._id} value={item._id}>{item.titleRu || item.title}</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div>
                  <LabelLike>Комментарий админа</LabelLike>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button disabled={saving || selected.status !== "new" || (selected.type === "service" && !categoryId)} onClick={approve} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Одобрить
                </Button>
                <Button disabled={saving || selected.status !== "new" || (selected.type === "service" ? !itemId : !categoryId)} onClick={merge} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <GitMerge className="h-4 w-4 mr-2" />
                  Merge
                </Button>
                <Button disabled={saving || selected.status !== "new"} onClick={reject} variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Отклонить
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}

function statusLabel(status: StatusFilter) {
  if (status === "all") return "Все"
  if (status === "new") return "Новые"
  if (status === "approved") return "Одобрены"
  if (status === "merged") return "Объединены"
  return "Отклонены"
}

function proposalTone(status: TemplateProposalStatus) {
  if (status === "new") return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
}

function LabelLike({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">{children}</div>
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}
