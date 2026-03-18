import { Suspense } from 'react'
import { createAdminClient } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import Footer from '@/app/components/layout/Footer'
import EventCard from '@/app/components/ui/EventCard'
import { Search, SlidersHorizontal } from 'lucide-react'
import { EVENT_CATEGORIES } from '@/app/lib/utils'
import type { EventWithTiers } from '@/app/lib/database.types'

interface SearchParams {
  category?: string
  search?: string
  city?: string
  page?: string
}

async function getEvents(params: SearchParams): Promise<EventWithTiers[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*), profiles(full_name, email)')
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .order('is_featured', { ascending: false })
    .order('start_date', { ascending: true })

  if (params.category) {
    query = query.eq('category', params.category)
  }
  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,venue.ilike.%${params.search}%`)
  }

  const { data } = await query.limit(24)
  return (data ?? []) as unknown as EventWithTiers[]
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const events = await getEvents(searchParams)

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <h1 className="font-display font-extrabold text-5xl text-white mb-2">
            {searchParams.category ?? 'All Events'}
          </h1>
          <p className="text-white/50 text-lg">
            {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
            {searchParams.city ? ` in ${searchParams.city}` : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <form className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search events..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
              />
            </div>

            {/* Category select */}
            <select
              name="category"
              defaultValue={searchParams.category ?? ''}
              className="px-4 py-3 rounded-xl text-sm min-w-[180px]"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* City */}
            <input
              type="text"
              name="city"
              defaultValue={searchParams.city}
              placeholder="City..."
              className="px-4 py-3 rounded-xl text-sm w-full sm:w-40"
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <a
              href="/events"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !searchParams.category
                  ? 'bg-mint-500 text-navy-900'
                  : 'glass text-white/60 hover:text-white hover:border-mint-500/30'
              }`}
            >
              All
            </a>
            {EVENT_CATEGORIES.map(cat => (
              <a
                key={cat}
                href={`/events?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  searchParams.category === cat
                    ? 'bg-mint-500 text-navy-900'
                    : 'glass text-white/60 hover:text-white hover:border-mint-500/30'
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass rounded-2xl">
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">No events found</h3>
              <p className="text-white/50 mb-6">Try adjusting your search or filters</p>
              <a
                href="/events"
                className="px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-colors"
              >
                Clear Filters
              </a>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
