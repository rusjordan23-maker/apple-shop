//import { NextRequest, NextResponse } from 'next/server'
//import { createClient } from '@/lib/supabase/server'

//export async function POST(request: NextRequest) {
//  try {
//    const body = await request.json()
//    const query = body.query?.trim()

//    if (!query) {
//      return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 })
//    }

//    const supabase = createClient()
//    const { data: products, error } = await supabase
//      .from('products')
//      .select('*')
//      .or(`name.ilike.%${query}%, series.ilike.%${query}%, processor.ilike.%${query}%, memory.ilike.%${query}%`)
//      .limit(20)

//    if (error) {
//      console.error('Supabase error:', error)
//      return NextResponse.json({ error: error.message }, { status: 500 })
//    }

    // Логирование запроса (с отдельной обработкой ошибок)
//    try {
//      await supabase.from('query_log').insert({
//        query_text: query,
//        found_product_ids: products.map(p => p.id),
//      })
//    } catch (logErr) {
//      console.error('Log error:', logErr)
//    }

//    return NextResponse.json({ products: products || [] })
//  } catch (error: any) {
//    console.error('Unhandled error:', error)
//    return NextResponse.json(
//      { error: 'Внутренняя ошибка сервера' },
//      { status: 500 }
//    )
//  }
//}

// Прежний поиск по ключевым словам выше

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import axios from 'axios'
import { z } from 'zod'

const FiltersSchema = z.object({
  series: z.string().nullable().optional(),
  memory: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  processor: z.string().nullable().optional(),
  screen_size: z.string().nullable().optional(),
  price_min: z.number().nullable().optional(),
  price_max: z.number().nullable().optional(),
})

type Filters = z.infer<typeof FiltersSchema>

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = body.query?.trim()

    if (!query) {
      return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 })
    }

    const filters = await parseQueryToFilters(query)
    const products = await searchProducts(filters)
    await logQuery(query, products)

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Ошибка поиска:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

async function parseQueryToFilters(query: string): Promise<Filters> {
  const prompt = `
Ты — помощник по подбору техники Apple.
Извлеки из запроса пользователя параметры для поиска по каталогу.
Если поле не указано — верни null.

Поля:
- series: серия устройства (iPhone, MacBook, iPad, Watch, AirPods)
- memory: объём памяти (например, 256GB, 16GB) — только число + единица
- color: цвет
- processor: процессор (например, M3, A17 Pro)
- screen_size: размер экрана (например, 14.2")
- price_min: минимальная цена в рублях (если сказано "от 80 тысяч" — 80000)
- price_max: максимальная цена в рублях (если сказано "до 150 тысяч" — 150000)

Верни только JSON по схеме:
{
  "series": string | null,
  "memory": string | null,
  "color": string | null,
  "processor": string | null,
  "screen_size": string | null,
  "price_min": number | null,
  "price_max": number | null
}

Запрос пользователя: "${query}"
`

  try {
    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt-lite`,
        completionOptions: {
          temperature: 0,
          maxTokens: 500,
        },
        messages: [
          {
            role: 'system',
            text: 'Ты — помощник по подбору техники Apple. Отвечай только JSON.'
          },
          {
            role: 'user',
            text: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`
        }
      }
    )

    let content = response.data.result?.alternatives?.[0]?.message?.text
    if (!content) {
      throw new Error('Пустой ответ от Yandex GPT')
    }

    // Очищаем от Markdown
    content = content.trim()
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      content = jsonMatch[1].trim()
    }

    const parsed = JSON.parse(content)
    return FiltersSchema.parse(parsed)
  } catch (error: any) {
    console.error('Ошибка Yandex GPT:', error.response?.data || error.message)
    throw new Error('Не удалось обработать запрос через Yandex GPT')
  }
}

async function searchProducts(filters: Filters) {
  const supabase = createClient()
  let queryBuilder = supabase.from('products').select('*')

  if (filters.series) {
    queryBuilder = queryBuilder.ilike('series', `%${filters.series}%`)
  }
  if (filters.memory) {
    queryBuilder = queryBuilder.ilike('memory', `%${filters.memory}%`)
  }
  if (filters.color) {
    queryBuilder = queryBuilder.ilike('color', `%${filters.color}%`)
  }
  if (filters.processor) {
    queryBuilder = queryBuilder.ilike('processor', `%${filters.processor}%`)
  }
  if (filters.screen_size) {
    queryBuilder = queryBuilder.ilike('screen_size', `%${filters.screen_size}%`)
  }
  if (filters.price_min != null) {
    queryBuilder = queryBuilder.gte('price', filters.price_min)
  }
  if (filters.price_max != null) {
    queryBuilder = queryBuilder.lte('price', filters.price_max)
  }

  const { data, error } = await queryBuilder.limit(20)
  if (error) throw new Error(error.message)
  return data || []
}

async function logQuery(queryText: string, products: any[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    await supabase.from('query_log').insert({
      user_id: user?.id || null,
      query_text: queryText,
      found_product_ids: products.map(p => p.id),
    })
  } catch (err) {
    console.error('Log error:', err)
  }
}