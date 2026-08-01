'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
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

type OrderItem = {
  id: string
  product_id: string
  quantity: number
  price_at_time: number
  products: { name: string }[]
}

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Загружаем заказ
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (orderError) {
        alert('Заказ не найден')
        router.push('/admin/orders')
        return
      }
      setOrder(orderData)

      // Загружаем товары в заказе (исправленный запрос)
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          quantity,
          price_at_time,
          products ( name )
        `)
        .eq('order_id', id)

      if (itemsError) {
        console.error('Ошибка загрузки товаров заказа:', itemsError)
      } else {
        setItems(itemsData || [])
      }
      setLoading(false)
    }

    fetchOrderDetails()
  }, [id, router])

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>
  if (!order) return <div className="container mx-auto px-4 py-8 text-red-500">Заказ не найден</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-4">
        <Link href="/admin/orders" className="text-blue-600 hover:underline">← Назад к списку заказов</Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Заказ #{order.id.slice(0, 8)}</h1>

      <div className="bg-white p-6 rounded shadow mb-6 space-y-2">
        <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Статус:</strong> {order.status}</p>
        <p><strong>Способ оплаты:</strong> {order.payment_method === 'cash' ? 'Наличные' : 'Карта'}</p>
        <p><strong>Адрес доставки:</strong> {order.delivery_address || 'Не указан'}</p>
        <p><strong>Общая сумма:</strong> {order.total_price.toLocaleString()} ₽</p>
      </div>

      <h2 className="text-xl font-semibold mb-3">Товары в заказе</h2>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена за шт.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.products?.[0]?.name || 'Товар удалён'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.price_at_time.toLocaleString()} ₽</td>
                <td className="px-6 py-4 whitespace-nowrap">{(item.price_at_time * item.quantity).toLocaleString()} ₽</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}