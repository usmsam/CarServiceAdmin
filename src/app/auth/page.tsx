"use client"

import { Suspense, startTransition, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/user.store'
import { AuthService } from '@/api/auth.service'
import { Loader2, Lock, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useUserStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initLoading, setInitLoading] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')

    const authenticate = async (authToken: string) => {
      try {
        localStorage.setItem('token', authToken)
        const user = await AuthService.getMe()
        if (user.role !== 'SUPERADMIN') {
          localStorage.removeItem('token')
          setError('Доступ запрещен. Требуются права backoffice.')
          startTransition(() => {
            setInitLoading(false)
          })
          return
        }
        login(user, authToken)
        router.push('/')
      } catch (error: unknown) {
        console.error('Не удалось авторизоваться по токену:', error)
        startTransition(() => {
          setInitLoading(false)
        })
      }
    }

    if (token) {
      authenticate(token)
    } else {
      const existingToken = localStorage.getItem('token')
      if (existingToken) {
        authenticate(existingToken)
      } else {
        startTransition(() => {
          setInitLoading(false)
        })
      }
    }
  }, [searchParams, router, login])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Предпологаем, что бекенд возвращает { accessToken, user } или мы дергаем getMe после логина
      const res = await AuthService.login({ username, password })
      const token = res.accessToken || res.token

      if (token) {
        localStorage.setItem('token', token)
        const user = await AuthService.getMe()
        if (user.role !== 'SUPERADMIN') {
          localStorage.removeItem('token')
          setError('Доступ запрещен. Требуются права backoffice.')
          setLoading(false)
          return
        }
        login(user, token)
        router.push('/')
      } else {
        setError('Не удалось получить токен авторизации')
      }
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Проверка авторизации...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-2xl shadow-xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AvtoLog Admin
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Вход для администраторов</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700">Логин</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-10 bg-slate-50/50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-slate-50/50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-slate-900 font-medium h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
