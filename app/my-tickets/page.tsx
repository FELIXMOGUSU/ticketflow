import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import Footer from '@/app/components/layout/Footer'
import { Ticket, Calendar, MapPin, QrCode, Download } from 'lucide-react'
import { formatDateTime, formatCurrency, STATUS_COLORS } from '@/app/lib/utils'

function createServerClient() {
  const cookieStore = cookies()
  const cookieHeader = cookieStore.getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { cookie: cookieHeader } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }
  )
}

async function getMyTickets(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      events(title, start_date, venue, city, slug),
      tickets(*, ticket_tiers(name, price, currency))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function MyTicketsPage() {
  const serverClient = createServerClient()
  const { data: { session } } = await serverClient.auth.getSession()

  if (!session) redirect('/auth/login')

  const orders = await getMyTickets(session.user.id)

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="font-display font-extrabold text-4xl text-white mb-2">My Tickets</h1>
          <p className="text-white/50">All your event tickets in one place</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 glass rounded-2xl">
            <Ticket className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="font-display font-bold text-2xl text-white mb-2">No tickets yet</h3>
            <p className="text-white/50 mb-6">Find events you love and grab your tickets</p>
            <Link href="/events" className="px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const event = order.events
              const tickets = order.tickets ?? []
              return (
                <div key={order.id} className="glass rounded-2xl overflow-hidden">
                  {/* Order header */}
                  <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-display font-bold text-white">{event?.title}</h3>
                      <p className="text-white/50 text-sm">Order: <span className="font-mono text-mint-400">{order.order_number}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}>
                        {order.status}
                      </span>
                      <Link
                        href={`/tickets/confirmation/${order.order_number}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-white/60 hover:text-white text-sm border border-white/10 hover:border-mint-500/30 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        View / Print
                      </Link>
                    </div>
                  </div>

                  {event && (
                    <div className="px-6 py-3 flex flex-wrap gap-4 text-sm text-white/50 border-b border-white/10">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-mint-500" />
                        {formatDateTime(event.start_date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-mint-500" />
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  )}

                  <div className="divide-y divide-white/10">
                    {tickets.map((ticket: any) => (
                      <div key={ticket.id} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-mint-500/10 border border-mint-500/20 flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-mint-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{ticket.ticket_tiers?.name}</p>
                            <p className="text-white/40 text-xs font-mono mt-0.5">{ticket.ticket_code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[ticket.status] ?? ''}`}>
                            {ticket.status}
                          </span>
                          <span className="font-display font-bold text-mint-400 text-sm">
                            {formatCurrency(ticket.ticket_tiers?.price ?? 0, ticket.ticket_tiers?.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-3 bg-white/5 flex justify-end">
                    <span className="text-white/50 text-sm">
                      Total: <span className="font-display font-bold text-white ml-1">{formatCurrency(order.total_amount, order.currency)}</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
