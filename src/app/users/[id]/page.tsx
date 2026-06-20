"use client"

import { use, useCallback, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarClock,
  Fingerprint,
  Phone,
  ShieldCheck,
  Store,
  User as UserIcon,
  UserCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminUser, UsersService } from "@/api/users.service"
import { ServiceStation, StationsService } from "@/api/stations.service"

type RefEntity = AdminUser["stationId"]

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingRole, setSavingRole] = useState(false)
  const [savingUser, setSavingUser] = useState(false)
  const [draftRole, setDraftRole] = useState<AdminUser["role"] | "">("")
  const [stations, setStations] = useState<ServiceStation[]>([])
  const [draft, setDraft] = useState({
    fullName: "",
    phone: "",
    username: "",
    telegramId: "",
    status: "ACTIVE" as AdminUser["status"],
    isActive: true,
    stationId: "",
    password: "",
  })

  const loadUser = useCallback(async () => UsersService.getUserById(id), [id])

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const [res, stationItems] = await Promise.all([
          loadUser(),
          StationsService.getStations(),
        ])
        if (active) {
          setUser(res)
          setStations(stationItems)
          setDraftRole(res.role)
          setDraft({
            fullName: res.fullName || "",
            phone: res.phone || "",
            username: res.username || "",
            telegramId: res.telegramId || "",
            status: res.status || "ACTIVE",
            isActive: Boolean(res.isActive),
            stationId: typeof res.stationId === "string" ? res.stationId : res.stationId?._id || "",
            password: "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch user details", error)
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [loadUser])

  const handleSaveRole = async () => {
    if (!user || !draftRole || draftRole === user.role) return

    setSavingRole(true)
    try {
      const updated = await UsersService.updateUserRole(user._id, draftRole)
      setUser(updated)
      setDraftRole(updated.role)
    } catch (error) {
      console.error("Не удалось обновить роль пользователя", error)
    } finally {
      setSavingRole(false)
    }
  }

  const handleSaveUser = async () => {
    if (!user || !draft.fullName.trim()) return

    setSavingUser(true)
    try {
      const updated = await UsersService.updateUser(user._id, {
        fullName: draft.fullName.trim(),
        phone: draft.phone || undefined,
        username: draft.username || undefined,
        telegramId: draft.telegramId || undefined,
        status: draft.status,
        isActive: draft.isActive,
        stationId: draft.stationId || null,
        password: draft.password || undefined,
      })
      setUser(updated)
      setDraftRole(updated.role)
      setDraft((prev) => ({ ...prev, password: "" }))
    } catch (error) {
      console.error("Не удалось обновить пользователя", error)
    } finally {
      setSavingUser(false)
    }
  }

  const statusTone = (status?: AdminUser["status"]) => {
    if (status === "ACTIVE") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    if (status === "PENDING") return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    if (status === "BLOCKED") return "bg-red-500/10 text-red-600 border-red-500/20"
    return "bg-slate-500/10 text-slate-600 border-slate-200"
  }

  const roleTone = (role?: AdminUser["role"]) => {
    if (role === "SUPERADMIN") return "bg-red-500/10 text-red-500 border-red-500/20"
    if (role === "OWNER") return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    if (role === "MECHANIC") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    if (role === "CLIENT") return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    return "bg-slate-500/10 text-slate-500 border-slate-200"
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!user) {
    return <div className="py-20 text-center text-slate-500">Пользователь не найден</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-10"
    >
      <div className="flex flex-col gap-4">
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
                {user.fullName}
              </h1>
              <Badge className={roleTone(user.role)}>{user.role}</Badge>
              <Badge className={statusTone(user.status)}>{user.status || "—"}</Badge>
              {user.isActive ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-slate-500/10 text-slate-600 border-slate-200">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-xs md:text-sm mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3 w-3" />
                Создан {formatDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3 w-3" />
                Обновлён {formatDate(user.updatedAt)}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveRole}
              disabled={savingRole || !draftRole || draftRole === user.role}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {savingRole ? "Сохранение..." : "Сохранить роль"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-orange-500" />
                Основная информация
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="ФИО" value={user.fullName} />
              <InfoCard label="Телефон" value={user.phone || "—"} icon={<Phone className="h-4 w-4 text-slate-400" />} />
              <InfoCard label="Telegram ID" value={user.telegramId?.toString() || "—"} icon={<Fingerprint className="h-4 w-4 text-slate-400" />} />
              <InfoCard label="Username" value={user.username || "—"} />
              <InfoCard label="Язык" value={user.language || "—"} />
              <InfoCard label="Has credentials" value={user.hasCredentials ? "Да" : "Нет"} />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Полное редактирование
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={draft.fullName} onChange={(event) => setDraft((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="ФИО" />
              <Input value={draft.phone} onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Телефон" />
              <Input value={draft.username} onChange={(event) => setDraft((prev) => ({ ...prev, username: event.target.value }))} placeholder="Username" />
              <Input value={draft.telegramId} onChange={(event) => setDraft((prev) => ({ ...prev, telegramId: event.target.value }))} placeholder="Telegram ID" />
              <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={draft.status || "ACTIVE"} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as AdminUser["status"] }))}>
                <option>ACTIVE</option>
                <option>PENDING</option>
                <option>BLOCKED</option>
              </select>
              <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={draft.stationId} onChange={(event) => setDraft((prev) => ({ ...prev, stationId: event.target.value }))}>
                <option value="">Без СТО</option>
                {stations.map((station) => (
                  <option key={station._id} value={station._id}>{station.name}</option>
                ))}
              </select>
              <Input type="password" value={draft.password} onChange={(event) => setDraft((prev) => ({ ...prev, password: event.target.value }))} placeholder="Новый пароль" />
              <button type="button" onClick={() => setDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`rounded-md border px-3 py-2 text-sm font-semibold ${draft.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                {draft.isActive ? "Активен" : "Неактивен"}
              </button>
            </div>
            <Button onClick={handleSaveUser} disabled={savingUser || !draft.fullName.trim()} className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">
              {savingUser ? "Сохранение..." : "Сохранить пользователя"}
            </Button>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-500" />
              Служебные поля
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="ID" value={user._id} mono />
              <InfoCard label="Последний вход" value={formatDate(user.lastTelegramLoginAt)} />
              <InfoCard label="Создан" value={formatDate(user.createdAt)} />
              <InfoCard label="Обновлён" value={formatDate(user.updatedAt)} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              Управление ролью
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Роль
                </div>
                <Select
                  value={draftRole || user.role}
                  onValueChange={(value) => setDraftRole(value as AdminUser["role"])}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                    <SelectItem value="OWNER">OWNER</SelectItem>
                    <SelectItem value="MECHANIC">MECHANIC</SelectItem>
                    <SelectItem value="CLIENT">CLIENT</SelectItem>
                    <SelectItem value="GUEST">GUEST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-slate-600">
                Текущая роль: <span className="font-semibold text-slate-900">{user.role}</span>
              </div>
              <div className="text-sm text-slate-600">
                Статус: <span className="font-semibold text-slate-900">{user.status || "—"}</span>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-500" />
              Привязка к СТО
            </h3>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900">
                {formatStation(user.stationId, "Не привязан")}
              </div>
              {renderStationMeta(user.stationId)}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  )
}

function formatDate(value?: string) {
  if (!value) return "—"
  return new Date(value).toLocaleString("ru-RU")
}

function formatStation(station: RefEntity, fallback = "—") {
  if (!station) return fallback
  if (typeof station === "string") return station
  return station.fullName || station.name || station._id || fallback
}

function renderStationMeta(station: RefEntity) {
  if (!station || typeof station === "string") return null
  const parts = [station.phone, station.address, station.username].filter(Boolean)
  if (!parts.length) return null
  return <div className="text-xs text-slate-500 mt-1">{parts.join(" • ")}</div>
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
      <div className={mono ? "font-mono text-sm text-slate-900 break-all" : "text-sm font-semibold text-slate-900 break-words"}>
        {value}
      </div>
    </div>
  )
}
