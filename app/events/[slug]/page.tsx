import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createAdminClient } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import Footer from '@/app/components/layout/Footer'
import TicketPurchaseForm from '@/app/components/ui/TicketPurchaseForm'
import { Calendar, MapPin, Users, Share2, ArrowLeft, Clock, Tag } from 'lucide-react'
import { formatDateTime, formatDate, formatCurrency } from '@/app/lib/utils'
import type { EventWithTiers } from '@/app/lib/database.types'

async function getEvent(slug: string): Promise<EventWithTiers | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(*), profiles(full_name, email)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  return data as unknown as EventWithTiers | null
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const event = await getEvent(params.slug)
  if (!event) notFound()

  const totalAvailable = event.ticket_tiers?.reduce(
    (sum, t) => sum + (t.total_quantity - t.sold_quantity), 0
  ) ?? 0

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-20">
        {/* Hero image */}
        <div className="relative w-full h-[50vh] min-h-[320px]">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 flex items-center justify-center">
              <span className="text-9xl opacity-20">🎪</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/50 to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-6">
            <Link href="/events" className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-white/80 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Title block */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1.5 rounded-full glass border border-mint-500/30 text-mint-400 text-sm font-medium">
                    <Tag className="w-3.5 h-3.5 inline mr-1" />
                    {event.category}
                  </span>
                  {event.is_featured && (
                    <span className="px-3 py-1.5 rounded-full bg-lime-400/20 border border-lime-400/30 text-lime-300 text-sm font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight mb-4">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-mint-400" />
                    <span>{formatDateTime(event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-mint-400" />
                    <span>Ends {formatDateTime(event.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-mint-400" />
                    <span>{event.venue}{event.address ? `, ${event.address}` : ''} — {event.city}, {event.country}</span>
                  </div>
                  {totalAvailable > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-mint-400" />
                      <span className={totalAvailable < 20 ? 'text-red-400 font-medium' : ''}>
                        {totalAvailable < 20 ? `Only ${totalAvailable} tickets left!` : `${totalAvailable} tickets available`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="glass rounded-2xl p-8 mb-8">
                <h2 className="font-display font-bold text-xl text-white mb-4">About This Event</h2>
                {event.description ? (
                  <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                ) : (
                  <p className="text-white/40 italic">No description provided.</p>
                )}
              </div>

              {/* Ticket Tiers overview */}
              <div className="glass rounded-2xl p-8 mb-8">
                <h2 className="font-display font-bold text-xl text-white mb-6">Ticket Options</h2>
                <div className="space-y-4">
                  {event.ticket_tiers?.map(tier => {
                    const available = tier.total_quantity - tier.sold_quantity
                    const soldOut = available === 0
                    return (
                      <div key={tier.id} className={`rounded-xl p-5 border transition-all ${
                        soldOut
                          ? 'border-white/10 bg-white/5 opacity-60'
                          : 'border-mint-500/20 bg-mint-500/5'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display font-semibold text-white">{tier.name}</h3>
                              {soldOut && (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Sold Out</span>
                              )}
                            </div>
                            {tier.description && (
                              <p className="text-white/60 text-sm">{tier.description}</p>
                            )}
                            <p className="text-white/40 text-xs mt-1">
                              {available} of {tier.total_quantity} available · Max {tier.max_per_order} per order
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-display font-bold text-2xl gradient-text">
                              {formatCurrency(tier.price, tier.currency)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(!event.ticket_tiers || event.ticket_tiers.length === 0) && (
                    <p className="text-white/40 italic text-center py-8">No ticket tiers configured yet.</p>
                  )}
                </div>
              </div>

              {/* Organizer */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display font-bold text-lg text-white mb-4">Organized by</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-500 to-lime-400 flex items-center justify-center text-navy-900 font-bold">
                    {(event.profiles as any)?.full_name?.[0] ?? 'O'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{(event.profiles as any)?.full_name ?? 'Event Organizer'}</p>
                    <p className="text-white/50 text-sm">{(event.profiles as any)?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket purchase sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TicketPurchaseForm event={event} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <Footer />
      </div>
    </div>
  )
}
