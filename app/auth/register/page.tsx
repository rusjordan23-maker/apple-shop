'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Регистрация через Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'user', // по умолчанию все новые пользователи — обычные
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // После успешной регистрации создаём запись в таблице profiles (если ещё не создана)
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: 'user',
          phone: '',
        })
      if (profileError) {
        console.error('Ошибка создания профиля:', profileError)
      }
    }

    // Перенаправляем на главную или в кабинет
    router.push('/profile')
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Регистрация</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Имя</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Иван Иванов"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Уже есть аккаунт? <Link href="/auth/login" className="text-blue-600 hover:underline">Войти</Link>
      </p>
    </div>
  )
}