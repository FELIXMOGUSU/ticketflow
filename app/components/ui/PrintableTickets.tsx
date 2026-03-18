'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/app/lib/utils'

interface TicketData {
  id: string
  ticket_code: string
  holder_name: string
  holder_email: string
  status: string
  ticket_tiers: {
    name: string
    price: number
    currency: string
  }
}

interface Props {
  tickets: TicketData[]
  event: {
    title: string
    start_date: string
    end_date: string
    venue: string
    city: string
    country: string
  } | null
  orderNumber: string
}

function TicketCard({ ticket, event, orderNumber }: { ticket: TicketData; event: Props['event']; orderNumber: string }) {
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!qrRef.current) return
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/verify/${ticket.ticket_code}`
    QRCode.toCanvas(qrRef.current, verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0a0f1e',
        light: '#ffffff',
      },
    })
  }, [ticket.ticket_code])

  return (
    <div className="ticket-print glass rounded-2xl overflow-hidden mb-4 border border-mint-500/20">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mint-500 to-lime-400 flex items-center justify-center">
            <Ticket className="w-3.5 h-3.5 text-navy-900" />
          </div>
          <span className="font-display font-bold text-white">TicketFlow</span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          ticket.status === 'valid'
            ? 'bg-mint-500/20 text-mint-400 border border-mint-500/30'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {ticket.status.toUpperCase()}
        </span>
      </div>

      {/* Ticket body */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: ticket info */}
          <div className="flex-1">
            <h3 className="font-display font-extrabold text-2xl text-white mb-1 leading-tight">
              {event?.title ?? 'Event'}
            </h3>
            <p className="text-mint-400 font-medium mb-4">{ticket.ticket_tiers?.name}</p>

            <div className="space-y-2 mb-6 text-sm">
              {event && (
                <>
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="w-4 h-4 text-mint-500" />
                    <span>{formatDateTime(event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-4 h-4 text-mint-500" />
                    <span>{event.venue}, {event.city}</span>
                  </div>
                </>
              )}
            </div>

            {/* Holder info */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-xs font-medium mb-1">Ticket Holder</p>
              <p className="text-white font-semibold">{ticket.holder_name}</p>
              <p className="text-white/50 text-sm">{ticket.holder_email}</p>
            </div>

            {/* Ticket code */}
            <div className="mt-4 p-3 rounded-xl bg-mint-500/5 border border-mint-500/20">
              <p className="text-white/40 text-xs font-medium mb-1">Unique Ticket Code</p>
              <p className="ticket-code">{ticket.ticket_code}</p>
            </div>
          </div>

          {/* Right: QR + stub */}
          <div className="flex flex-col items-center gap-3 sm:border-l sm:border-dashed sm:border-white/20 sm:pl-6">
            {/* QR Code */}
            <div className="p-2 rounded-xl bg-white">
              <canvas ref={qrRef} className="block" />
            </div>
            <p className="text-white/30 text-xs text-center max-w-[140px]">Scan to verify at entry</p>

            {/* Price */}
            <div className="mt-auto text-center">
              <p className="text-white/40 text-xs">Price</p>
              <p className="font-display font-bold text-xl gradient-text">
                {formatCurrency(ticket.ticket_tiers?.price ?? 0, ticket.ticket_tiers?.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-4 pt-4 border-t border-dashed border-white/20 flex items-center justify-between text-xs text-white/30 font-mono">
          <span>Order: {orderNumber}</span>
          <span>ID: {ticket.id.split('-')[0].toUpperCase()}</span>
          <span>ticketflow.app</span>
        </div>
      </div>
    </div>
  )
}

export default function PrintableTickets({ tickets, event, orderNumber }: Props) {
  return (
    <div>
      <h2 className="font-display font-bold text-xl text-white mb-4">
        Your Tickets <span className="text-white/40 text-base font-normal">({tickets.length})</span>
      </h2>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} event={event} orderNumber={orderNumber} />
      ))}
    </div>
  )
}
