"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, Wrench, Settings, LogOut, Car, Store, Layers } from "lucide-react"
import { useUserStore } from "@/store/user.store"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useUserStore()

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
      show: true,
    },
    {
      label: "Категории услуг",
      icon: Layers,
      href: "/categories",
      show: true,
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
      show: true,
    },
    {
      label: "Настройки",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-neutral-950/80 backdrop-blur-xl border-r border-neutral-800 text-white relative z-20">
      <div className="flex h-16 items-center px-6 py-4 border-b border-neutral-800/50">
        <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AvtoLog</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          {routes
            .filter((route) => route.show)
            .map((route) => {
              const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`) && route.href !== "/"
              
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-neutral-400 hover:bg-neutral-900/80 hover:text-white"
                  }`}
                >
                  <route.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span>{route.label}</span>
                </Link>
              )
            })}
        </nav>
      </div>
      
      <div className="border-t border-neutral-800/50 p-4 bg-neutral-950/50">
        <div className="mb-4 px-3 flex flex-col">
          <span className="text-sm font-medium truncate text-white">{user?.fullName || "Суперадмин"}</span>
          <span className="text-xs text-blue-400 font-medium">SUPERADMIN</span>
        </div>
        <button
          onClick={() => {
            logout()
            window.location.href = '/auth'
          }}
          className="flex w-full items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  )
}
