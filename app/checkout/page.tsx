'use client'

import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Корзина пуста</h1>
        <Link href="/catalog" className="text-blue-600 hover:underline">Вернуться в каталог</Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Пожалуйста, войдите в систему перед оформлением заказа')
      setLoading(false)
      return
    }

    // Создаём заказ
    const total = getTotalPrice()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_price: total,
        delivery_address: address,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      alert('Ошибка создания заказа: ' + orderError.message)
      setLoading(false)
      return
    }

    // Добавляем товары в order_items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      alert('Ошибка добавления товаров: ' + itemsError.message)
      setLoading(false)
      return
    }

    // Очищаем корзину
    clearCart()
    router.push(`/order-confirmation?orderId=${order.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Адрес доставки</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Улица, дом, квартира"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Способ оплаты</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="cash">Наличными при получении</option>
            <option value="card">Картой онлайн (через платежный шлюз)</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <p className="text-xl font-bold">Сумма: {getTotalPrice().toLocaleString()} ₽</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Оформление...' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  )
}