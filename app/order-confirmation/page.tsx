'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Компонент, который использует useSearchParams
function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Заказ оформлен! 🎉</h1>
      <p className="text-lg mb-2">
        Номер заказа: <strong>{orderId}</strong>
      </p>
      <p className="text-gray-600 mb-6">
        Наш менеджер свяжется с вами для подтверждения.
      </p>
      <Link
        href="/catalog"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Продолжить покупки
      </Link>
    </div>
  )
}

// Основной компонент страницы с Suspense
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  )
}