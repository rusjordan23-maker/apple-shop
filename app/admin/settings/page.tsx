'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Setting = {
  key: string
  value: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
      if (!error) setSettings(data || [])
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Обновляем каждую настройку
    for (const setting of settings) {
      const { error } = await supabase
        .from('settings')
        .update({ value: setting.value, updated_at: new Date().toISOString() })
        .eq('key', setting.key)
      if (error) {
        setError(`Ошибка обновления ${setting.key}: ${error.message}`)
        setSaving(false)
        return
      }
    }
    alert('Настройки сохранены!')
    setSaving(false)
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Настройки сайта</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        {settings.map((setting) => (
          <div key={setting.key}>
            <label className="block text-sm font-medium capitalize">{setting.key.replace('_', ' ')}</label>
            {setting.key === 'main_banner_url' ? (
              <input
                type="text"
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                className="mt-1 block w-full border rounded p-2"
                placeholder="URL баннера"
              />
            ) : (
              <textarea
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                className="mt-1 block w-full border rounded p-2"
                rows={setting.key.includes('info') || setting.key.includes('policy') ? 3 : 1}
              />
            )}
          </div>
        ))}
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </div>
  )
}