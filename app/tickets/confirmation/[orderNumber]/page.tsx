import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import PrintableTickets from '@/app/components/ui/PrintableTickets'
import { CheckCircle, ArrowLeft, Download } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/app/lib/utils'

async function getOrder(orderNumber: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()

  if (!order) return null

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, ticket_tiers(name, price, currency), events(title, start_date, end_date, venue, city, country, image_url)')
    .eq('order_id', order.id)

  return { order, tickets: tickets ?? [] }
}

export default async function ConfirmationPage({
  params,
}: {
  params: { orderNumber: string }
}) {
  const result = await getOrder(params.orderNumber)
  if (!result) notFound()

  const { order, tickets } = result
  const event = (tickets[0] as any)?.events

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-28 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success banner */}
        <div className="text-center mb-12 animate-slide-up animation-fill-both">
          <div className="w-20 h-20 rounded-full bg-mint-500/10 border-2 border-mint-500/40 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <CheckCircle className="w-10 h-10 text-mint-400" />
          </div>
          <h1 className="font-display font-extrabold text-4xl text-white mb-3">
            You're going! 🎉
          </h1>
          <p className="text-white/60 text-lg">
            Your tickets are confirmed. See you there!
          </p>
        </div>

        {/* Order details card */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Order Number</p>
              <p className="font-mono font-bold text-2xl text-mint-400 tracking-widest">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Total Paid</p>
              <p className="font-display font-bold text-2xl gradient-text">
                {formatCurrency(order.total_amount, order.currency)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/60">
            <div><span className="text-white/30">Buyer: </span>{order.buyer_name}</div>
            <div><span className="text-white/30">Email: </span>{order.buyer_email}</div>
            {order.buyer_phone && <div><span className="text-white/30">Phone: </span>{order.buyer_phone}</div>}
            {event && (
              <div><span className="text-white/30">Event: </span>
                <span className="text-white">{event.title}</span>
              </div>
            )}
            {event && (
              <div><span className="text-white/30">Date: </span>{formatDateTime(event.start_date)}</div>
            )}
          </div>
        </div>

        {/* Print button */}
        <div className="flex justify-end mb-6 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/20 text-white/70 hover:text-white hover:border-mint-500/40 transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4 text-mint-400" />
            Print / Save Tickets
          </button>
        </div>

        {/* Tickets */}
        <PrintableTickets tickets={tickets as any} event={event} orderNumber={order.order_number} />

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-8 no-print">
          <Link
            href="/events"
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/20 text-white/70 hover:text-white transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse More Events
          </Link>
          <Link
            href="/my-tickets"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold text-sm hover:bg-mint-400 transition-colors"
          >
            View My Tickets
          </Link>
        </div>
      </div>
    </div>
  )
}
