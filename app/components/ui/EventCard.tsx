import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Tag } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/app/lib/utils'
import type { EventWithTiers } from '@/app/lib/database.types'

interface EventCardProps {
  event: EventWithTiers
  featured?: boolean
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const lowestPrice = event.ticket_tiers?.length
    ? Math.min(...event.ticket_tiers.map(t => t.price))
    : null

  const availableTickets = event.ticket_tiers?.reduce(
    (sum, t) => sum + (t.total_quantity - t.sold_quantity), 0
  ) ?? 0

  const isSoldOut = availableTickets === 0 && (event.ticket_tiers?.length ?? 0) > 0

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <article className={`glass rounded-2xl overflow-hidden hover:border-mint-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-mint-500/10 hover:-translate-y-1 ${
        featured ? 'h-full' : ''
      }`}>
        {/* Image */}
        <div className={`relative overflow-hidden ${featured ? 'h-56' : 'h-44'}`}>
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy-700 to-navy-600 flex items-center justify-center">
              <span className="text-5xl opacity-30">🎪</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full bg-navy-900/80 backdrop-blur text-xs font-medium text-mint-400 border border-mint-500/30">
              {event.category}
            </span>
            {event.is_featured && (
              <span className="px-2.5 py-1 rounded-full bg-lime-400/20 backdrop-blur text-xs font-medium text-lime-300 border border-lime-400/30">
                Featured
              </span>
            )}
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-red-500/80 text-white text-sm font-bold tracking-wide">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-white text-lg leading-tight mb-3 group-hover:text-mint-300 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar className="w-3.5 h-3.5 text-mint-500 shrink-0" />
              <span>{formatDateTime(event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-3.5 h-3.5 text-mint-500 shrink-0" />
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div>
              {lowestPrice !== null ? (
                <span className="font-display font-bold text-lg gradient-text">
                  {formatCurrency(lowestPrice, event.ticket_tiers?.[0]?.currency)}
                </span>
              ) : (
                <span className="text-white/40 text-sm">No tickets yet</span>
              )}
            </div>
            {availableTickets > 0 && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                availableTickets < 20
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-mint-500/20 text-mint-400'
              }`}>
                {availableTickets < 20 ? `Only ${availableTickets} left!` : `${availableTickets} available`}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
