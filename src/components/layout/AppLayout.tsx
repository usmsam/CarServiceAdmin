"use client"

import { ReactNode, useEffect, useState } from "react"
import { Sidebar } from "./Sidebar"
import { useUserStore } from "@/store/user.store"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useUserStore()
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated && !pathname.startsWith('/auth')) {
        router.push('/auth')
      } else if (isAuthenticated && user?.role !== 'SUPERADMIN' && user?.role !== 'OWNER' && !pathname.startsWith('/auth')) {
        // Ограничение: пускаем только SUPERADMIN и OWNER
        logout()
        router.push('/auth')
      }
    }
  }, [isMounted, isAuthenticated, user, pathname, router, logout])

  if (!isMounted) return null

  // Don't show sidebar on auth page
  if (pathname.startsWith('/auth')) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-slate-50 text-slate-900"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  if (!isAuthenticated || (user?.role !== 'SUPERADMIN' && user?.role !== 'OWNER')) return null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8 relative">
        <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
