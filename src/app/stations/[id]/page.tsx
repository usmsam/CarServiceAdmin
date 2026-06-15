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
import {
  StationCategoryDetail,
  StationDetailResponse,
  StationsService,
} from "@/api/stations.service"

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

type TabKey = "main" | "categories"

export default function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [detail, setDetail] = useState<StationDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("main")
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)

  const loadStation = useCallback(async () => StationsService.getStationById(id), [id])

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const res = await loadStation()
        if (active) {
          setDetail(res)
          setOpenCategoryId(res.categories[0]?._id || null)
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
      </div>

      {activeTab === "main" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
      ) : (
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              Привязанные категории
            </h2>
            <span className="text-sm text-slate-500">{categories.length} шт.</span>
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
                        <div className="text-sm font-semibold text-slate-900">{category.name}</div>
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
                                    <div className="text-sm font-semibold text-slate-900">{service.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      ID: {service._id}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">
                                      {service.price != null ? `${service.price.toLocaleString("ru-RU")} сум` : "—"}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {service.isActive ? "Active" : "Inactive"}
                                    </div>
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
      )}
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
