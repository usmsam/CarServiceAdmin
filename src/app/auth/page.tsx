"use client"

import { useEffect, useState, Suspense } from 'react'
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
          setError('Доступ запрещен. Требуются права суперадмина.')
          setInitLoading(false)
          return
        }
        login(user, authToken)
        router.push('/')
      } catch (error) {
        console.error('Не удалось авторизоваться по токену:', error)
        setInitLoading(false)
      }
    }

    if (token) {
      authenticate(token)
    } else {
      const existingToken = localStorage.getItem('token')
      if (existingToken) {
        authenticate(existingToken)
      } else {
        setInitLoading(false)
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
          setError('Доступ запрещен. Требуются права суперадмина.')
          setLoading(false)
          return
        }
        login(user, token)
        router.push('/')
      } else {
        setError('Не удалось получить токен авторизации')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-neutral-400">Проверка авторизации...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AvtoLog Admin
            </h1>
            <p className="text-neutral-400 mt-2 text-sm">Вход для администраторов</p>
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
              <Label className="text-neutral-300">Логин</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-10 bg-neutral-950/50 border-neutral-800 focus:border-blue-500 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-neutral-950/50 border-neutral-800 focus:border-blue-500 text-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
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
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
