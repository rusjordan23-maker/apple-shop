'use client'

import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  series: string
  memory: string
  price: number
  stock_status: string
  image_url: string | null
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const supabase = createClient()
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Каталог Apple</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col">
            <div className="h-48 bg-gray-100 rounded mb-4 flex items-center justify-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="object-contain h-full" />
              ) : (
                <span className="text-gray-400">📱</span>
              )}
            </div>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.series} • {product.memory}</p>
            <p className="text-xl font-bold mt-2">{product.price.toLocaleString()} ₽</p>
            <p className="text-sm mt-1">
              {product.stock_status === 'in_stock' ? '✅ В наличии' :
               product.stock_status === 'preorder' ? '⏳ Под заказ' : '❌ Нет в наличии'}
            </p>
            <button
              onClick={() => addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || undefined,
                stock_status: product.stock_status
              })}
              className="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}