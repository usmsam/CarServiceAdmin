"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/user.store'
import { AuthService } from '@/api/auth.service'
import { Loader2 } from 'lucide-react'

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useUserStore()

  useEffect(() => {
    const token = searchParams.get('token')
    
    const authenticate = async (authToken: string) => {
      try {
        localStorage.setItem('token', authToken)
        const user = await AuthService.getMe()
        login(user, authToken)
        router.push('/')
      } catch (error) {
        console.error('Failed to authenticate with token:', error)
        // could show an error state
      }
    }

    if (token) {
      authenticate(token)
    } else {
      // If no token in URL, check if we have one in localStorage
      const existingToken = localStorage.getItem('token')
      if (existingToken) {
        authenticate(existingToken)
      } else {
        // Fallback for development, since we might not have a bot running
        // Normally you'd show a "Login via Telegram" button here
      }
    }
  }, [searchParams, router, login])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl flex flex-col items-center w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-blue-500">AvtoLog Admin</h1>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-neutral-400">Authenticating...</p>
        
        {/* Placeholder for manual login in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-neutral-800 w-full text-center">
            <p className="text-xs text-neutral-500 mb-2">Dev Quick Login:</p>
            <button 
              onClick={() => {
                login({
                  id: "dev-id",
                  telegramId: 12345,
                  fullName: "Dev User",
                  role: "SUPERADMIN"
                }, "dev-token")
                router.push('/')
              }}
              className="text-sm text-blue-400 hover:underline"
            >
              Login as SuperAdmin
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
      <AuthContent />
    </Suspense>
  )
}
