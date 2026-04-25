"use client"

import { ReactNode, useEffect, useState } from "react"
import { Sidebar } from "./Sidebar"
import { useUserStore } from "@/store/user.store"
import { usePathname, useRouter } from "next/navigation"

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useUserStore()
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isAuthenticated && !pathname.startsWith('/auth')) {
      router.push('/auth')
    }
  }, [isMounted, isAuthenticated, pathname, router])

  if (!isMounted) return null

  // Don't show sidebar on auth page
  if (pathname.startsWith('/auth')) {
    return <div className="min-h-screen bg-neutral-950 text-neutral-50">{children}</div>
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-950 p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
