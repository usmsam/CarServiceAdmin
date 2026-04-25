"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, Wrench, Settings, LogOut, Car, Store } from "lucide-react"
import { useUserStore } from "@/store/user.store"
import { StationsService, ServiceStation } from "@/api/stations.service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, activeServiceId, setActiveService } = useUserStore()
  const [stations, setStations] = useState<ServiceStation[]>([])

  useEffect(() => {
    const fetchStations = async () => {
      if (user) {
        try {
          const res = await StationsService.getStations()
          setStations(res)
          if (res.length > 0 && !activeServiceId) {
            setActiveService(res[0]._id)
          }
        } catch (error) {
          console.error("Не удалось загрузить СТО", error)
        }
      }
    }
    fetchStations()
  }, [user, activeServiceId, setActiveService])

  const routes = [
    {
      label: "Главная",
      icon: LayoutDashboard,
      href: "/",
      show: true,
    },
    {
      label: "Заказы",
      icon: ShoppingCart,
      href: "/orders",
      show: true,
    },
    {
      label: "Автомобили",
      icon: Car,
      href: "/vehicles",
      show: true,
    },
    {
      label: "Пользователи",
      icon: Users,
      href: "/users",
      show: user?.role === 'SUPERADMIN' || user?.role === 'OWNER',
    },
    {
      label: "Справочник работ",
      icon: Wrench,
      href: "/catalog",
      show: true,
    },
    {
      label: "Филиалы СТО",
      icon: Store,
      href: "/stations",
      show: user?.role === 'SUPERADMIN',
    },
    {
      label: "Настройки",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ]

  const translateRole = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'Суперадмин'
      case 'OWNER': return 'Владелец'
      case 'MASTER': return 'Мастер'
      case 'CLIENT': return 'Клиент'
      default: return role || 'Гость'
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-neutral-950 border-r border-neutral-800 text-white">
      <div className="flex h-16 items-center px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-500">AvtoLog</h1>
      </div>

      {user?.role === 'SUPERADMIN' && stations.length > 0 && (
        <div className="p-4 border-b border-neutral-800">
          <label className="text-xs font-medium text-neutral-400 block mb-1">Текущее СТО:</label>
          <Select
            value={activeServiceId || ""}
            onValueChange={(val: string | null) => {
              if (val) setActiveService(val)
            }}
          >
            <SelectTrigger className="w-full h-9 text-xs bg-neutral-900 border-neutral-800 text-white">
              <SelectValue placeholder="Выберите СТО" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
              {stations.map((st) => (
                <SelectItem key={st._id} value={st._id}>
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-4">
          {routes
            .filter((route) => route.show)
            .map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === route.href
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <route.icon className="h-5 w-5" />
                <span>{route.label}</span>
              </Link>
            ))}
        </nav>
      </div>
      
      <div className="border-t border-neutral-800 p-4">
        <div className="mb-4 px-3 flex flex-col">
          <span className="text-sm font-semibold truncate">{user?.fullName || "Гость"}</span>
          <span className="text-xs text-neutral-500">{translateRole(user?.role)}</span>
        </div>
        <button
          onClick={() => {
            logout()
            window.location.href = '/auth'
          }}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  )
}
