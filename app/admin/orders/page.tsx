'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Order = {
  id: string
  created_at: string
  total_price: number
  status: string
  delivery_address: string
  payment_method: string
  user_id: string
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchOrders = async () => {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    const { data, error } = await query
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    if (!error) {
      fetchOrders()
    } else {
      alert('Ошибка обновления статуса')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
      <div className="mb-4">
        <label className="mr-2">Фильтр по статусу:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded p-2">
          <option value="all">Все</option>
          <option value="pending">В обработке</option>
          <option value="paid">Оплачен</option>
          <option value="shipped">Отправлен</option>
          <option value="delivered">Доставлен</option>
          <option value="cancelled">Отменён</option>
        </select>
      </div>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Адрес</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.total_price.toLocaleString()} ₽</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.delivery_address || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="pending">В обработке</option>
                      <option value="paid">Оплачен</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}