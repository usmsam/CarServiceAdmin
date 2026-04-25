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
        console.error('Не удалось авторизоваться по токену:', error)
      }
    }

    if (token) {
      authenticate(token)
    } else {
      const existingToken = localStorage.getItem('token')
      if (existingToken) {
        authenticate(existingToken)
      }
    }
  }, [searchParams, router, login])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl flex flex-col items-center w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-blue-500">AvtoLog Admin</h1>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-neutral-400">Проверка авторизации...</p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-neutral-800 w-full text-center">
            <p className="text-xs text-neutral-500 mb-2">Быстрый вход (Dev):</p>
            <button 
              onClick={() => {
                login({
                  _id: "dev-id",
                  telegramId: 12345,
                  fullName: "Разработчик",
                  role: "SUPERADMIN"
                }, "dev-token")
                router.push('/')
              }}
              className="text-sm text-blue-400 hover:underline"
            >
              Войти как SuperAdmin
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
