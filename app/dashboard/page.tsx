import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/app/lib/supabase'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/app/components/layout/Navbar'
import { Plus, Eye, Edit2, Ticket, TrendingUp, Users, Calendar, MoreVertical } from 'lucide-react'
import { formatDate, formatCurrency, STATUS_COLORS } from '@/app/lib/utils'

async function getDashboardData(userId: string) {
  const supabase = createAdminClient()

  const [eventsRes, ordersRes] = await Promise.all([
    supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('*, events!inner(organizer_id)')
      .eq('events.organizer_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return {
    events: eventsRes.data ?? [],
    recentOrders: ordersRes.data ?? [],
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'attendee') redirect('/my-tickets')

  const { events, recentOrders } = await getDashboardData(session.user.id)

  const totalRevenue = events.reduce((sum, event) => {
    const tiers = (event as any).ticket_tiers ?? []
    return sum + tiers.reduce((s: number, t: any) => s + (t.sold_quantity * t.price), 0)
  }, 0)

  const totalTicketsSold = events.reduce((sum, event) => {
    const tiers = (event as any).ticket_tiers ?? []
    return sum + tiers.reduce((s: number, t: any) => s + t.sold_quantity, 0)
  }, 0)

  const publishedEvents = events.filter(e => e.status === 'published').length

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-white/50 text-sm mb-1">Welcome back,</p>
            <h1 className="font-display font-extrabold text-3xl text-white">
              {profile?.full_name ?? 'Organizer'} 👋
            </h1>
          </div>
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-all hover:scale-105 glow-mint"
          >
            <Plus className="w-4 h-4" />
            New Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-mint-400' },
            { label: 'Tickets Sold', value: totalTicketsSold.toString(), icon: Ticket, color: 'text-lime-400' },
            { label: 'Published Events', value: publishedEvents.toString(), icon: Calendar, color: 'text-blue-400' },
            { label: 'Total Events', value: events.length.toString(), icon: Users, color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-white/50 text-xs font-medium">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-white">Your Events</h2>
            </div>

            {events.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">🎪</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">No events yet</h3>
                <p className="text-white/50 mb-6">Create your first event and start selling tickets</p>
                <Link href="/dashboard/events/new" className="px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-colors">
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event: any) => {
                  const tiers = event.ticket_tiers ?? []
                  const sold = tiers.reduce((s: number, t: any) => s + t.sold_quantity, 0)
                  const total = tiers.reduce((s: number, t: any) => s + t.total_quantity, 0)
                  const revenue = tiers.reduce((s: number, t: any) => s + (t.sold_quantity * t.price), 0)
                  const pct = total > 0 ? (sold / total) * 100 : 0

                  return (
                    <div key={event.id} className="glass rounded-xl p-5 hover:border-mint-500/20 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-display font-semibold text-white truncate">{event.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[event.status] ?? ''}`}>
                              {event.status}
                            </span>
                          </div>
                          <p className="text-white/40 text-sm">{formatDate(event.start_date)} · {event.city}</p>

                          {/* Progress bar */}
                          {total > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-white/40 mb-1">
                                <span>{sold}/{total} tickets sold</span>
                                <span className="text-mint-400 font-medium">{formatCurrency(revenue)}</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-mint-500 to-lime-400 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/events/${event.slug}`}
                            className="p-2 rounded-lg glass hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/events/${event.id}/edit`}
                            className="p-2 rounded-lg glass hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-white/40 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="glass rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{order.buyer_name}</p>
                        <p className="text-white/40 text-xs font-mono">{order.order_number}</p>
                      </div>
                      <span className="text-mint-400 font-display font-bold text-sm">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
