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
  const currentUser = useUserStore(state => state.user)

  useEffect(() => {
    // For demo purposes, generating fake data if API is not available
    const fetchData = async () => {
      try {
        const users = await UsersService.getUsers(currentUser?.activeServiceId || undefined)
        setData(users)
      } catch (error) {
        // Mock data fallback
        setData([
          { id: "1", telegramId: 101, fullName: "Ivan Ivanov", role: "MANAGER", serviceId: "s1" },
          { id: "2", telegramId: 102, fullName: "Petr Petrov", role: "MASTER", serviceId: "s1" },
          { id: "3", telegramId: 103, fullName: "Aleksey Sidorov", role: "CLIENT", serviceId: "s1" },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Optimistic UI update
    setData(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
    try {
      await UsersService.updateUserRole(userId, newRole)
    } catch (error) {
      console.error("Failed to update role", error)
      // Revert in real app
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
    },
    {
      accessorKey: "telegramId",
      header: "Telegram ID",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original
        
        // Only SUPERADMIN or OWNER should change roles easily. 
        // Real app would check permissions strictly.
        const canEdit = currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'OWNER'

        if (!canEdit) {
          return <span>{user.role}</span>
        }

        return (
          <Select 
            defaultValue={user.role} 
            onValueChange={(val) => handleRoleChange(user.id, val)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs border-neutral-800 bg-neutral-900/50">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="MASTER">Master</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
            </SelectContent>
          </Select>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Users Management</h2>
        <p className="text-neutral-400">Manage your employees and clients.</p>
      </div>

      {loading ? (
        <div className="text-neutral-400">Loading users...</div>
      ) : (
        <DataTable columns={columns} data={data} searchKey="fullName" />
      )}
    </div>
  )
}
