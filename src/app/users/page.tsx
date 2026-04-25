"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table/data-table"
import { UsersService } from "@/api/users.service"
import { User, useUserStore } from "@/store/user.store"
import { ColumnDef } from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser, activeServiceId } = useUserStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await UsersService.getUsers(activeServiceId || undefined)
        setData(users)
      } catch (error) {
        console.error("Не удалось загрузить пользователей", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser, activeServiceId])

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
    },
    {
      accessorKey: "fullName",
      header: "ФИО",
    },
    {
      accessorKey: "telegramId",
      header: "Telegram ID",
    },
    {
      accessorKey: "role",
      header: "Роль",
      cell: ({ row }) => {
        const user = row.original
        const canEdit = currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'OWNER'

        if (!canEdit) {
          return <span>{user.role}</span>
        }

        return (
          <Select
            defaultValue={user.role}
            onValueChange={(val: string | null) => {
              if (val) handleRoleChange(user._id, val)
            }}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs border-neutral-800 bg-neutral-900/50 text-white">
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
              <SelectItem value="SUPERADMIN">Суперадмин</SelectItem>
              <SelectItem value="OWNER">Владелец СТО</SelectItem>
              <SelectItem value="MANAGER">Менеджер</SelectItem>
              <SelectItem value="MASTER">Мастер</SelectItem>
              <SelectItem value="CLIENT">Клиент</SelectItem>
            </SelectContent>
          </Select>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Управление пользователями</h2>
        <p className="text-neutral-400">Назначение ролей сотрудникам и ведение базы клиентов.</p>
      </div>

      {loading ? (
        <div className="text-neutral-400">Загрузка пользователей...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="fullName" />
      )}
    </div>
  )
}
