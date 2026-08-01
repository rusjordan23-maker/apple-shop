'use client'

import { useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  series: string
  memory: string
  price: number
  stock_status: string
  image_url: string | null
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setProducts([])
      setError('')
      return
    }

    setLoading(true)
    setError('')
    setProducts([])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmedQuery }),
      })

      // Проверяем статус ответа
      if (!res.ok) {
        let errorMessage = 'Ошибка поиска'
        try {
          const errorData = await res.json()
          if (errorData.error) errorMessage = errorData.error
        } catch {
          // Если тело ответа не JSON, читаем как текст
          const text = await res.text()
          if (text) errorMessage = text
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при поиске')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Подбор техники Apple</h1>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: MacBook для монтажа, 16 ГБ, до 150 тыс."
            className="flex-1 border rounded p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Поиск...' : 'Найти'}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500">Загрузка...</div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
              <div className="h-48 bg-gray-100 rounded mb-4 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="object-contain h-full" />
                ) : (
                  <span className="text-gray-400 text-4xl">📱</span>
                )}
              </div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.series} • {product.memory}</p>
              <p className="text-xl font-bold mt-2">{product.price.toLocaleString()} ₽</p>
              <p className="text-sm mt-1">
                {product.stock_status === 'in_stock' ? '✅ В наличии' :
                 product.stock_status === 'preorder' ? '⏳ Под заказ' : '❌ Нет в наличии'}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && query && !error && (
        <p className="text-center text-gray-500 mt-8">Ничего не найдено. Попробуйте изменить запрос.</p>
      )}

      <div className="text-center mt-8">
        <Link href="/catalog" className="text-blue-600 hover:underline">
          Или перейдите в полный каталог
        </Link>
      </div>
    </main>
  )
}