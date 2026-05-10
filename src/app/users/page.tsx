"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { UsersService } from "@/api/users.service"
import { User } from "@/store/user.store"
import { ColumnDef } from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { UserCircle2, ShieldCheck, User as UserIcon } from "lucide-react"

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await UsersService.getUsers(undefined) // Fetch all for superadmin
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setData(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as any } : u))
    try {
      await UsersService.updateUserRole(userId, newRole)
    } catch (error) {
      console.error("Не удалось обновить роль", error)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => <div className="text-xs font-mono text-slate-400">{row.getValue<string>("_id").slice(-8)}</div>
    },
    {
      accessorKey: "fullName",
      header: "ФИО",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <UserCircle2 className="h-5 w-5 text-orange-400" />
          </div>
          <span className="font-medium text-slate-900">{row.getValue("fullName")}</span>
        </div>
      )
    },
    {
      accessorKey: "telegramId",
      header: "Telegram ID",
      cell: ({ row }) => <div className="text-slate-500">{row.getValue("telegramId")}</div>
    },
    {
      accessorKey: "role",
      header: "Роль",
      cell: ({ row }) => {
        const user = row.original
        
        return (
          <Select
            defaultValue={user.role}
            onValueChange={(val: string | null) => {
              if (val) handleRoleChange(user._id, val)
            }}
          >
            <SelectTrigger className={`w-[160px] h-8 text-xs border-0 font-medium ${
              user.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-400' :
              user.role === 'OWNER' ? 'bg-purple-500/10 text-purple-400' :
              user.role === 'CLIENT' ? 'bg-blue-500/10 text-blue-400' :
              'bg-emerald-500/10 text-emerald-400'
            }`}>
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent className="bg-white backdrop-blur-xl border-slate-200 text-slate-900">
              <SelectItem value="SUPERADMIN">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-red-400"/> Суперадмин</div>
              </SelectItem>
              <SelectItem value="OWNER">
                <div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-purple-400"/> Владелец СТО</div>
              </SelectItem>
              <SelectItem value="MECHANIC">
                <div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-emerald-400"/> Механик</div>
              </SelectItem>
              <SelectItem value="CLIENT">
                <div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-blue-400"/> Клиент</div>
              </SelectItem>
            </SelectContent>
          </Select>
        )
      },
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Управление пользователями</h2>
          <p className="text-sm text-slate-500 mt-1">Назначение ролей сотрудникам и ведение базы клиентов.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data} searchKey="fullName" />
        </div>
      )}
    </motion.div>
  )
}
