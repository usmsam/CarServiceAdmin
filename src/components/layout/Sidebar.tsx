"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, Wrench, Settings, LogOut, Car } from "lucide-react"
import { useUserStore } from "@/store/user.store"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useUserStore()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      show: true,
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/orders",
      show: true,
    },
    {
      label: "Vehicles",
      icon: Car,
      href: "/vehicles",
      show: true,
    },
    {
      label: "Users Management",
      icon: Users,
      href: "/users",
      show: user?.role === 'SUPERADMIN' || user?.role === 'OWNER',
    },
    {
      label: "Service Catalog",
      icon: Wrench,
      href: "/catalog",
      show: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-neutral-950 border-r border-neutral-800 text-white">
      <div className="flex h-16 items-center px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-500">AvtoLog</h1>
      </div>
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
          <span className="text-sm font-semibold truncate">{user?.fullName || "Guest"}</span>
          <span className="text-xs text-neutral-500">{user?.role}</span>
        </div>
        <button
          onClick={() => {
            logout()
            window.location.href = '/auth'
          }}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
