'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Подписка на изменения авторизации (например, при выходе)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="space-x-4">
        <Link href="/auth/login" className="hover:text-blue-600">Вход</Link>
        <Link href="/auth/register" className="hover:text-blue-600">Регистрация</Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <span>👋 {user.user_metadata?.full_name || user.email}</span>
      <Link href="/profile" className="hover:text-blue-600">Профиль</Link>
      <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Выйти</button>
    </div>
  )
}