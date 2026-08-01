'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  series: string
  memory: string
  color: string
  processor: string
  screen_size: string
  price: number
  stock_status: string
  image_url: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Ошибка загрузки товаров:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Ошибка удаления: ' + error.message)
    } else {
      // Обновляем список локально
      setProducts(products.filter(p => p.id !== id))
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление товарами</h1>
        <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Добавить товар
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Серия</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.series}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.price.toLocaleString()} ₽</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.stock_status === 'in_stock' ? '✅ В наличии' :
                   product.stock_status === 'preorder' ? '⏳ Под заказ' : '❌ Нет'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Link href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:underline">Редактировать</Link>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}