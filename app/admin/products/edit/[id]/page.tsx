'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function EditProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    series: 'iPhone',
    memory: '',
    color: '',
    processor: '',
    screen_size: '',
    price: '',
    stock_status: 'in_stock',
    image_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        setError('Товар не найден')
        setLoading(false)
        return
      }
      setFormData({
        name: data.name,
        series: data.series,
        memory: data.memory || '',
        color: data.color || '',
        processor: data.processor || '',
        screen_size: data.screen_size || '',
        price: data.price.toString(),
        stock_status: data.stock_status,
        image_url: data.image_url || '',
      })
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const priceNum = parseInt(formData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Цена должна быть положительным числом')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        series: formData.series,
        memory: formData.memory,
        color: formData.color,
        processor: formData.processor,
        screen_size: formData.screen_size,
        price: priceNum,
        stock_status: formData.stock_status,
        image_url: formData.image_url || null,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push('/admin/products')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Редактировать товар</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Название *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Серия *</label>
          <select name="series" required value={formData.series} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
            <option value="iPhone">iPhone</option>
            <option value="MacBook">MacBook</option>
            <option value="iPad">iPad</option>
            <option value="Watch">Watch</option>
            <option value="AirPods">AirPods</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Память</label>
          <input type="text" name="memory" value={formData.memory} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Цвет</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Процессор</label>
          <input type="text" name="processor" value={formData.processor} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Размер экрана</label>
          <input type="text" name="screen_size" value={formData.screen_size} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Цена (₽) *</label>
          <input type="number" name="price" required value={formData.price} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Статус наличия</label>
          <select name="stock_status" value={formData.stock_status} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
            <option value="in_stock">В наличии</option>
            <option value="preorder">Под заказ</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">URL изображения</label>
          <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="mt-1 block w-full border rounded p-2" placeholder="https://..." />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  )
}