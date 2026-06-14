"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import {
  CalendarClock,
  Eye,
  Phone,
  UserCircle2,
} from "lucide-react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { AdminUser, UsersService } from "@/api/users.service"

export default function UsersPage() {
  const [data, setData] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await UsersService.getUsers(undefined)
        setData(users)
      } catch (error) {
        console.error("Не удалось загрузить пользователей", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="text-xs font-mono text-slate-400">
          {row.getValue<string>("_id").slice(-8)}
        </div>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Пользователь",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <UserCircle2 className="h-5 w-5 text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 truncate">
              {row.getValue("fullName")}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {formatStation(row.original.stationId)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-700">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          {row.original.phone || "—"}
        </div>
      ),
    },
    {
      accessorKey: "telegramId",
      header: "Telegram ID",
      cell: ({ row }) => (
        <div className="font-mono text-slate-500">
          {row.original.telegramId ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div className="text-slate-700">{row.original.username || "—"}</div>,
    },
    {
      accessorKey: "role",
      header: "Роль",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(row.original.status)}`}>
          {row.original.status || "—"}
        </span>
      ),
    },
    {
      accessorKey: "language",
      header: "Язык",
      cell: ({ row }) => <div className="text-slate-700">{row.original.language || "—"}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Активен",
      cell: ({ row }) => (
        <Badge className={row.original.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600 border-slate-200"}>
          {row.original.isActive ? "Да" : "Нет"}
        </Badge>
      ),
    },
    {
      accessorKey: "hasCredentials",
      header: "Credentials",
      cell: ({ row }) => (
        <Badge className={row.original.hasCredentials ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-slate-500/10 text-slate-600 border-slate-200"}>
          {row.original.hasCredentials ? "Есть" : "Нет"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastTelegramLoginAt",
      header: "Последний вход",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {row.original.lastTelegramLoginAt ? new Date(row.original.lastTelegramLoginAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Создан",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Обновлён",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock className="h-3 w-3" />
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleString("ru-RU") : "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Действия</div>,
      cell: ({ row }) => (
        <div className="flex justify-end items-center gap-2 pr-4">
          <Link
            href={`/users/${row.original._id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
            aria-label={`Открыть пользователя ${row.original.fullName}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Пользователи
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Полный список пользователей с переходом в карточку и управлением ролью в detail page.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="fullName" />
        </div>
      )}
    </motion.div>
  )
}

function formatStation(station: AdminUser["stationId"]) {
  if (!station) return "СТО: не привязан"
  if (typeof station === "string") return `СТО: ${station}`
  return `СТО: ${station.fullName || station.name || station._id || "неизвестно"}`
}

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  const tone =
    role === "SUPERADMIN"
      ? "bg-red-500/10 text-red-500 border-red-500/20"
      : role === "OWNER"
        ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
        : role === "MECHANIC"
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          : role === "CLIENT"
            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
            : "bg-slate-500/10 text-slate-500 border-slate-500/20"

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {role}
    </span>
  )
}

function statusTone(status?: AdminUser["status"]) {
  if (status === "ACTIVE") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "PENDING") return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  if (status === "BLOCKED") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-slate-500/10 text-slate-600 border-slate-200"
}
