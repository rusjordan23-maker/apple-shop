'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [series, setSeries] = useState('iPhone')
  const [memory, setMemory] = useState('')
  const [color, setColor] = useState('')
  const [processor, setProcessor] = useState('')
  const [screenSize, setScreenSize] = useState('')
  const [price, setPrice] = useState('')
  const [stockStatus, setStockStatus] = useState('in_stock')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const priceNum = parseInt(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Цена должна быть положительным числом')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('products').insert({
      name,
      series,
      memory,
      color,
      processor,
      screen_size: screenSize,
      price: priceNum,
      stock_status: stockStatus,
      image_url: imageUrl || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/products')
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Добавить товар</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Название *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Серия *</label>
          <select required value={series} onChange={(e) => setSeries(e.target.value)} className="mt-1 block w-full border rounded p-2">
            <option value="iPhone">iPhone</option>
            <option value="MacBook">MacBook</option>
            <option value="iPad">iPad</option>
            <option value="Watch">Watch</option>
            <option value="AirPods">AirPods</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Память</label>
          <input type="text" value={memory} onChange={(e) => setMemory(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Цвет</label>
          <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Процессор</label>
          <input type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Размер экрана</label>
          <input type="text" value={screenSize} onChange={(e) => setScreenSize(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Цена (₽) *</label>
          <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Статус наличия</label>
          <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className="mt-1 block w-full border rounded p-2">
            <option value="in_stock">В наличии</option>
            <option value="preorder">Под заказ</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">URL изображения</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="https://..." />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Сохранение...' : 'Добавить товар'}
        </button>
      </form>
    </div>
  )
}