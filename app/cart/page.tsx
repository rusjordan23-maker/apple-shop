'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Корзина пуста</h1>
        <Link href="/catalog" className="text-blue-600 hover:underline">Перейти в каталог</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Корзина</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="object-contain h-full" />
                ) : (
                  <span className="text-gray-400">📱</span>
                )}
              </div>
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-gray-600">{item.price.toLocaleString()} ₽</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 border rounded hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 border rounded hover:bg-gray-100"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-right">
        <p className="text-2xl font-bold">Итого: {getTotalPrice().toLocaleString()} ₽</p>
        <div className="mt-4 space-x-4">
          <button
            onClick={clearCart}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Очистить корзину
          </button>
          <Link
            href="/checkout"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  )
}