import { createAdminClient } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import { CheckCircle, XCircle, AlertCircle, Calendar, MapPin, User, Ticket } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/app/lib/utils'

async function verifyTicket(code: string) {
  const supabase = createAdminClient()
  const { data: ticket } = await supabase
    .from('tickets')
    .select('*, ticket_tiers(name, price, currency), events(title, start_date, venue, city), orders(buyer_name, buyer_email, order_number)')
    .eq('ticket_code', code)
    .single()

  return ticket
}

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const ticket = await verifyTicket(params.code)
  const event = (ticket as any)?.events
  const order = (ticket as any)?.orders
  const tier = (ticket as any)?.ticket_tiers

  const isValid = ticket?.status === 'valid'
  const isUsed = ticket?.status === 'used'
  const isCancelled = ticket?.status === 'cancelled'

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-28 pb-16 max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Ticket Verification</h1>
          <p className="text-white/50 text-sm font-mono">{params.code}</p>
        </div>

        {!ticket ? (
          <div className="glass rounded-2xl p-10 text-center border border-red-500/20">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-white mb-2">Invalid Ticket</h2>
            <p className="text-white/60">This ticket code doesn't exist in our system.</p>
          </div>
        ) : (
          <div className={`glass rounded-2xl overflow-hidden border ${
            isValid ? 'border-mint-500/30' :
            isUsed ? 'border-yellow-500/30' :
            'border-red-500/30'
          }`}>
            {/* Status banner */}
            <div className={`px-6 py-5 flex items-center gap-4 ${
              isValid ? 'bg-mint-500/10' :
              isUsed ? 'bg-yellow-500/10' :
              'bg-red-500/10'
            }`}>
              {isValid ? (
                <CheckCircle className="w-10 h-10 text-mint-400" />
              ) : isUsed ? (
                <AlertCircle className="w-10 h-10 text-yellow-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400" />
              )}
              <div>
                <h2 className={`font-display font-bold text-2xl ${
                  isValid ? 'text-mint-300' :
                  isUsed ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {isValid ? '✅ Valid Ticket' : isUsed ? '⚠️ Already Used' : '❌ Invalid'}
                </h2>
                <p className="text-white/60 text-sm">
                  {isValid ? 'This ticket is authentic and ready for entry'
                    : isUsed ? `Checked in at ${ticket.checked_in_at ? formatDateTime(ticket.checked_in_at) : 'unknown time'}`
                    : `Ticket status: ${ticket.status}`}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {event && (
                <>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Event</p>
                    <p className="text-white font-semibold text-lg">{event.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                      <p className="text-white/80 text-sm">{formatDateTime(event.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</p>
                      <p className="text-white/80 text-sm">{event.venue}, {event.city}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="h-px bg-white/10" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Holder</p>
                  <p className="text-white font-medium">{ticket.holder_name}</p>
                  <p className="text-white/50 text-xs">{ticket.holder_email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Ticket className="w-3 h-3" /> Tier</p>
                  <p className="text-white font-medium">{tier?.name}</p>
                  <p className="text-white/50 text-xs">{formatCurrency(tier?.price ?? 0, tier?.currency)}</p>
                </div>
              </div>

              {order && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Order Reference</p>
                  <p className="font-mono text-mint-400 font-bold">{order.order_number}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
