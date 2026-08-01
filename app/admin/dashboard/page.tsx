import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-600">Товары</h2>
          <p className="text-4xl font-bold">{productsCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-600">Заказы</h2>
          <p className="text-4xl font-bold">{ordersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-600">Пользователи</h2>
          <p className="text-4xl font-bold">{usersCount || 0}</p>
        </div>
      </div>
    </div>
  )
}