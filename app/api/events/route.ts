import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)

  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*), profiles(full_name, email)')
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .order('is_featured', { ascending: false })
    .order('start_date', { ascending: true })
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (city) query = query.ilike('city', `%${city}%`)
  if (featured === 'true') query = query.eq('is_featured', true)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ events: data })
}
