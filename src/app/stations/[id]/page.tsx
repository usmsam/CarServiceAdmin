"use client"

import { use, useCallback, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  MapPin,
  Phone,
  Settings2,
  Store,
  User as UserIcon,
  Wrench,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  StationCategoryDetail,
  StationDetailResponse,
  StationsService,
} from "@/api/stations.service"
import { ServiceCategoriesService } from "@/api/categories.service"
import { CatalogService } from "@/api/catalog.service"
import { AdminUser, UsersService } from "@/api/users.service"

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const

const normalizeWorkingHoursByDay = (
  raw: Array<{
    dayOfWeek: number
    isWorkingDay: boolean
    openTime?: string
    closeTime?: string
  }> = [],
) => {
  const map = new Map<
    number,
    {
      dayOfWeek: number
      isWorkingDay: boolean
      openTime?: string
      closeTime?: string
    }
  >()

  for (const item of raw) {
    if (
      typeof item?.dayOfWeek !== "number" ||
      item.dayOfWeek < 0 ||
      item.dayOfWeek > 6
    ) {
      continue
    }

    map.set(item.dayOfWeek, {
      dayOfWeek: item.dayOfWeek,
      isWorkingDay: Boolean(item.isWorkingDay),
      openTime: typeof item.openTime === "string" ? item.openTime : undefined,
      closeTime: typeof item.closeTime === "string" ? item.closeTime : undefined,
    })
  }

  const result = []
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    result.push(
      map.get(dayOfWeek) ?? {
        dayOfWeek,
        isWorkingDay: false,
        openTime: "09:00",
        closeTime: "18:00",
      },
    )
  }

  return result
}

const buildWorkingHoursSummary = (
  station: {
    workingHoursByDay?: Array<{
      dayOfWeek: number
      isWorkingDay: boolean
      openTime?: string
      closeTime?: string
    }>
    workingHours?: string
  },
) => {
  if (!station.workingHoursByDay || station.workingHoursByDay.length === 0) {
    return station.workingHours || "—"
  }

  return normalizeWorkingHoursByDay(station.workingHoursByDay)
    .map((day) => {
      const label = WEEKDAYS[day.dayOfWeek] || `День ${day.dayOfWeek}`
      if (!day.isWorkingDay) return `${label}: выходной`
      if (!day.openTime || !day.closeTime) return `${label}: —`
      return `${label}: ${day.openTime}-${day.closeTime}`
    })
    .join(", ")
}

type TabKey = "main" | "categories" | "staff"

export default function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [detail, setDetail] = useState<StationDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("main")
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [staff, setStaff] = useState<AdminUser[]>([])
  const [stationForm, setStationForm] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    status: "ACTIVE",
    isActive: true,
    latitude: "",
    longitude: "",
    workingHours: "",
  })
  const [newCategoryName, setNewCategoryName] = useState("")
  const [serviceForm, setServiceForm] = useState({
    categoryId: "",
    title: "",
    price: 0,
  })

  const loadStation = useCallback(async () => StationsService.getStationById(id), [id])

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const [res, stationStaff] = await Promise.all([
          loadStation(),
          UsersService.getUsers({ stationId: id }),
        ])
        if (active) {
          setDetail(res)
          setStaff(stationStaff)
          setOpenCategoryId(res.categories[0]?._id || null)
          setServiceForm((prev) => ({
            ...prev,
            categoryId: prev.categoryId || res.categories[0]?._id || "",
          }))
          setStationForm({
            name: res.station.name || "",
            address: res.station.address || "",
            phone: res.station.phone || "",
            description: res.station.description || "",
            status: res.station.status || "ACTIVE",
            isActive: Boolean(res.station.isActive),
            latitude: res.station.latitude == null ? "" : String(res.station.latitude),
            longitude: res.station.longitude == null ? "" : String(res.station.longitude),
            workingHours: res.station.workingHours || "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch station details", error)
        if (active) setDetail(null)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [loadStation])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500" />
      </div>
    )
  }

  if (!detail) {
    return <div className="py-20 text-center text-slate-500">СТО не найдено</div>
  }

  const { station, categories } = detail

  const saveStation = async () => {
    setSaving(true)
    try {
      const updated = await StationsService.updateStation(station._id, {
        name: stationForm.name,
        address: stationForm.address,
        phone: stationForm.phone,
        description: stationForm.description,
        status: stationForm.status,
        isActive: stationForm.isActive,
        workingHours: stationForm.workingHours,
        latitude: stationForm.latitude === "" ? undefined : Number(stationForm.latitude),
        longitude: stationForm.longitude === "" ? undefined : Number(stationForm.longitude),
      })
      setDetail((prev) => prev ? { ...prev, station: { ...prev.station, ...updated } } : prev)
    } finally {
      setSaving(false)
    }
  }

  const reloadStation = async () => {
    const [res, stationStaff] = await Promise.all([
      StationsService.getStationById(id),
      UsersService.getUsers({ stationId: id }),
    ])
    setDetail(res)
    setStaff(stationStaff)
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return
    setSaving(true)
    try {
      await ServiceCategoriesService.createCategory({
        stationId: station._id,
        name: newCategoryName.trim(),
        nameRu: newCategoryName.trim(),
        order: categories.length,
      })
      setNewCategoryName("")
      await reloadStation()
    } finally {
      setSaving(false)
    }
  }

  const updateCategory = async (category: StationCategoryDetail, name: string) => {
    const nextName = name.trim()
    if (!nextName || nextName === category.name) return
    setSaving(true)
    try {
      await ServiceCategoriesService.updateCategory(category._id, {
        name: nextName,
        nameRu: nextName,
      })
      await reloadStation()
    } finally {
      setSaving(false)
    }
  }

  const createService = async () => {
    if (!serviceForm.categoryId || !serviceForm.title.trim()) return
    setSaving(true)
    try {
      await CatalogService.createItem({
        stationId: station._id,
        categoryId: serviceForm.categoryId,
        title: serviceForm.title.trim(),
        titleRu: serviceForm.title.trim(),
        price: Number(serviceForm.price) || 0,
        isActive: true,
      })
      setServiceForm((prev) => ({ ...prev, title: "", price: 0 }))
      await reloadStation()
    } finally {
      setSaving(false)
    }
  }

  const updateService = async (
    serviceId: string,
    patch: { title?: string; titleRu?: string; price?: number; isActive?: boolean },
  ) => {
    setSaving(true)
    try {
      await CatalogService.updateItem(serviceId, patch)
      await reloadStation()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-10"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-100 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight truncate">
              {station.name}
            </h1>
            <Badge className={station.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600 border-slate-200"}>
              {station.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge className={statusTone(station.status)}>
              {station.status || "—"}
            </Badge>
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3 w-3" />
              Создан {formatDate(station.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3 w-3" />
              Обновлён {formatDate(station.updatedAt)}
            </span>
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <TabButton active={activeTab === "main"} onClick={() => setActiveTab("main")}>
          Основное
        </TabButton>
        <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
          Категории
        </TabButton>
        <TabButton active={activeTab === "staff"} onClick={() => setActiveTab("staff")}>
          Сотрудники
        </TabButton>
      </div>

      {activeTab === "main" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
                <Settings2 className="h-5 w-5 text-blue-500" />
                Управление СТО
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={stationForm.name} onChange={(event) => setStationForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Название" />
                <Input value={stationForm.phone} onChange={(event) => setStationForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Телефон" />
                <Input className="md:col-span-2" value={stationForm.address} onChange={(event) => setStationForm((prev) => ({ ...prev, address: event.target.value }))} placeholder="Адрес" />
                <Input value={stationForm.latitude} onChange={(event) => setStationForm((prev) => ({ ...prev, latitude: event.target.value }))} placeholder="Latitude" />
                <Input value={stationForm.longitude} onChange={(event) => setStationForm((prev) => ({ ...prev, longitude: event.target.value }))} placeholder="Longitude" />
                <Input className="md:col-span-2" value={stationForm.workingHours} onChange={(event) => setStationForm((prev) => ({ ...prev, workingHours: event.target.value }))} placeholder="График" />
                <textarea className="md:col-span-2 min-h-20 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" value={stationForm.description} onChange={(event) => setStationForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Описание" />
                <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={stationForm.status} onChange={(event) => setStationForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option>ACTIVE</option>
                  <option>PENDING</option>
                  <option>BLOCKED</option>
                </select>
                <button type="button" onClick={() => setStationForm((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`rounded-md border px-3 py-2 text-sm font-semibold ${stationForm.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {stationForm.isActive ? "Активна в выдаче" : "Выключена"}
                </button>
              </div>
              <Button disabled={saving || !stationForm.name} onClick={saveStation} className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">
                {saving ? "Сохранение..." : "Сохранить СТО"}
              </Button>
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
                <Store className="h-5 w-5 text-emerald-500" />
                Основная информация
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Название" value={station.name} />
                <InfoCard label="Адрес" value={station.address || "—"} icon={<MapPin className="h-4 w-4 text-slate-400" />} />
                <InfoCard label="Телефон" value={station.phone || "—"} icon={<Phone className="h-4 w-4 text-slate-400" />} />
                <InfoCard label="Режим работы" value={buildWorkingHoursSummary(station)} />
                <InfoCard label="Описание" value={station.description || "—"} />
                <InfoCard label="Статус" value={station.status || "—"} />
                <InfoCard label="Активность" value={station.isActive ? "Да" : "Нет"} />
                <InfoCard label="ID владельца" value={station.ownerId || "—"} mono />
                <InfoCard label="Широта" value={station.latitude != null ? String(station.latitude) : "—"} />
                <InfoCard label="Долгота" value={station.longitude != null ? String(station.longitude) : "—"} />
                <InfoCard label="Фото URL" value={station.photoUrl || "—"} mono />
                <InfoCard label="Лого URL" value={station.logoUrl || "—"} mono />
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-500" />
                Системные поля
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="ID СТО" value={station._id} mono />
                <InfoCard label="Создано" value={formatDate(station.createdAt)} />
                <InfoCard label="Обновлено" value={formatDate(station.updatedAt)} />
                <InfoCard label="Settings" value={formatSettings(station.settings)} mono />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-purple-500" />
                Владелец
              </h3>
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-900">{station.owner?.fullName || "—"}</div>
                <div className="text-xs text-slate-500">{station.owner?._id || station.ownerId || "—"}</div>
                {station.owner?.phone ? <div className="text-xs text-slate-500">{station.owner.phone}</div> : null}
                {station.owner?.username ? <div className="text-xs text-slate-500">@{station.owner.username}</div> : null}
                {station.owner?.role ? <div className="text-xs text-slate-500">Role: {station.owner.role}</div> : null}
              </div>
            </section>
          </div>
        </div>
      ) : activeTab === "categories" ? (
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              Привязанные категории
            </h2>
            <span className="text-sm text-slate-500">{categories.length} шт.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="Новая категория" />
              <Button disabled={saving || !newCategoryName.trim()} onClick={createCategory} className="bg-slate-900 hover:bg-slate-800 text-white">
                Добавить
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
              <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={serviceForm.categoryId} onChange={(event) => setServiceForm((prev) => ({ ...prev, categoryId: event.target.value }))}>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
              <Input value={serviceForm.title} onChange={(event) => setServiceForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Новая услуга" />
              <div className="flex gap-2">
                <Input className="w-32" type="number" value={serviceForm.price} onChange={(event) => setServiceForm((prev) => ({ ...prev, price: Number(event.target.value) }))} placeholder="Цена" />
                <Button disabled={saving || !serviceForm.title.trim() || !serviceForm.categoryId} onClick={createService} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Добавить
                </Button>
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
              Для этого СТО нет привязанных категорий
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const isOpen = openCategoryId === category._id
                return (
                  <div key={category._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setOpenCategoryId(isOpen ? null : category._id)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <input
                          defaultValue={category.name}
                          onBlur={(event) => updateCategory(category, event.target.value)}
                          className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-900 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-white"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                          Порядок: {category.order} • Услуг: {category.services.length}
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen ? (
                      <div className="border-t border-slate-200 bg-white px-4 py-4">
                        {category.services.length === 0 ? (
                          <div className="text-sm text-slate-400">В этой категории пока нет услуг</div>
                        ) : (
                          <div className="space-y-3">
                            {category.services.map((service) => (
                              <div key={service._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <input
                                      defaultValue={service.title}
                                      onBlur={(event) => {
                                        const value = event.target.value.trim()
                                        if (value && value !== service.title) {
                                          void updateService(service._id, { title: value, titleRu: value })
                                        }
                                      }}
                                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-900 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-white"
                                    />
                                    <div className="text-xs text-slate-500 mt-1">
                                      ID: {service._id}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <input
                                      defaultValue={service.price || 0}
                                      type="number"
                                      onBlur={(event) => {
                                        const value = Number(event.target.value) || 0
                                        if (value !== service.price) {
                                          void updateService(service._id, { price: value })
                                        }
                                      }}
                                      className="w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-sm font-bold text-slate-900"
                                    />
                                    <button
                                      onClick={() => updateService(service._id, { isActive: !service.isActive })}
                                      className="mt-1 text-xs text-slate-500 hover:text-blue-600"
                                    >
                                      {service.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "staff" ? (
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-purple-500" />
              Пользователи этой СТО
            </h2>
            <span className="text-sm text-slate-500">{staff.length} чел.</span>
          </div>

          {staff.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
              К этой СТО не привязаны пользователи
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staff.map((user) => (
                <div key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{user.fullName}</div>
                      <div className="mt-1 text-xs text-slate-500">{user.phone || user.username || user.telegramId || "Контакт не указан"}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-white text-slate-600 border-slate-200">{user.role}</Badge>
                      <Badge className={statusTone(user.status)}>{user.status || "—"}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </motion.div>
  )
}

function statusTone(status?: string) {
  if (status === "ACTIVE") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "PENDING") return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  if (status === "BLOCKED") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-slate-500/10 text-slate-600 border-slate-200"
}

function formatDate(value?: string) {
  if (!value) return "—"
  return new Date(value).toLocaleString("ru-RU")
}

function formatSettings(settings?: Record<string, string>) {
  if (!settings || Object.keys(settings).length === 0) return "—"
  return JSON.stringify(settings, null, 2)
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  )
}

function InfoCard({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string
  value: string
  icon?: ReactNode
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className={mono ? "font-mono text-sm text-slate-900 break-all whitespace-pre-wrap" : "text-sm font-semibold text-slate-900 break-words"}>
        {value}
      </div>
    </div>
  )
}
