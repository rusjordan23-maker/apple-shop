'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Order = {
  id: string
  created_at: string
  total_price: number
  status: string
  delivery_address: string
  payment_method: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setOrders(orders || [])
      }
      setLoading(false)
    }
    fetchUserAndOrders()
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Пожалуйста, войдите в систему.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Личный кабинет</h1>
      <div className="bg-white p-6 rounded shadow mb-8">
        <p><strong>Имя:</strong> {user.user_metadata?.full_name || 'Не указано'}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">История заказов</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">У вас пока нет заказов.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Заказ #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()} • {order.total_price.toLocaleString()} ₽
                  </p>
                  <p className="text-sm">
                    Статус: <span className="font-medium">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{order.delivery_address || 'Адрес не указан'}</p>
                  <p className="text-sm text-gray-500">{order.payment_method === 'cash' ? 'Наличные' : 'Карта'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}