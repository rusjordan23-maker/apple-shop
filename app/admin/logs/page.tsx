import { createClient } from '@/lib/supabase/server'

export default async function AdminLogs() {
  const supabase = createClient()
  const { data: logs, error } = await supabase
    .from('query_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">Ошибка загрузки логов: {error.message}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">История поисковых запросов</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Запрос</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs?.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{log.user_id || 'Гость'}</td>
                <td className="px-6 py-4">{log.query_text}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs?.length && <p className="p-4 text-gray-500">Нет записей.</p>}
      </div>
    </div>
  )
}