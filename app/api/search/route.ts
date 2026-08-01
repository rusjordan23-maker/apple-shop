import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = body.query?.trim()

    if (!query) {
      return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%, series.ilike.%${query}%, processor.ilike.%${query}%, memory.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Логирование запроса (с отдельной обработкой ошибок)
    try {
      await supabase.from('query_log').insert({
        query_text: query,
        found_product_ids: products.map(p => p.id),
      })
    } catch (logErr) {
      console.error('Log error:', logErr)
    }

    return NextResponse.json({ products: products || [] })
  } catch (error: any) {
    console.error('Unhandled error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}