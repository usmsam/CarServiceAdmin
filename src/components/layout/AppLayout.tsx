"use client"

import { ReactNode, startTransition, useEffect, useState } from "react"
import { Sidebar } from "./Sidebar"
import { useUserStore } from "@/store/user.store"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Menu } from "lucide-react"

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useUserStore()
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true)
    })
  }, [])

  // Close sidebar when route changes
  useEffect(() => {
    startTransition(() => {
      setIsSidebarOpen(false)
    })
  }, [pathname])

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated && !pathname.startsWith('/auth')) {
        router.push('/auth')
      } else if (isAuthenticated && user?.role !== 'SUPERADMIN' && !pathname.startsWith('/auth')) {
        // Backoffice доступен только SUPERADMIN
        logout()
        router.push('/auth')
      }
    }
  }, [isMounted, isAuthenticated, user, pathname, router, logout])

  if (!isMounted) return null

  // Don't show sidebar on auth page
  if (pathname.startsWith('/auth')) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'SUPERADMIN') return null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Persistent on desktop, drawer on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AvtoLog
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">
              {user?.role}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8 relative">
          <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="mx-auto max-w-7xl relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
