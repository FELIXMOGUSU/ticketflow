import Link from 'next/link'
import { createAdminClient } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import Footer from '@/app/components/layout/Footer'
import EventCard from '@/app/components/ui/EventCard'
import { ArrowRight, Ticket, Zap, Shield, Star, ChevronRight } from 'lucide-react'
import type { EventWithTiers } from '@/app/lib/database.types'

async function getFeaturedEvents(): Promise<EventWithTiers[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(*), profiles(full_name, email)')
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .order('is_featured', { ascending: false })
    .order('start_date', { ascending: true })
    .limit(6)

  return (data ?? []) as unknown as EventWithTiers[]
}

const CATEGORIES = [
  { name: 'Music', emoji: '🎵', color: 'from-purple-500/20 to-purple-600/10' },
  { name: 'Sports', emoji: '⚽', color: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Arts & Culture', emoji: '🎨', color: 'from-orange-500/20 to-orange-600/10' },
  { name: 'Food & Drink', emoji: '🍽️', color: 'from-red-500/20 to-red-600/10' },
  { name: 'Technology', emoji: '💻', color: 'from-cyan-500/20 to-cyan-600/10' },
  { name: 'Business', emoji: '💼', color: 'from-yellow-500/20 to-yellow-600/10' },
  { name: 'Education', emoji: '📚', color: 'from-green-500/20 to-green-600/10' },
  { name: 'Fashion', emoji: '👗', color: 'from-pink-500/20 to-pink-600/10' },
]

export default async function HomePage() {
  const events = await getFeaturedEvents()

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow delay-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-mint-500/30 text-mint-400 text-sm font-medium mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>The future of events is here</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-6xl sm:text-7xl lg:text-8xl leading-none tracking-tight mb-8 animate-slide-up animation-fill-both">
              <span className="text-white">Your next</span>
              <br />
              <span className="gradient-text">unforgettable</span>
              <br />
              <span className="text-white">experience</span>
            </h1>

            <p className="text-white/60 text-xl max-w-2xl leading-relaxed mb-10 animate-slide-up animation-fill-both delay-200">
              Discover world-class events, secure your spot instantly, and get a unique ticket code you can print or show on your phone.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up animation-fill-both delay-300">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-mint-500 text-navy-900 font-semibold text-lg hover:bg-mint-400 transition-all hover:scale-105 glow-mint"
              >
                Browse Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Create an Event
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-16 animate-fade-in delay-500">
              {[
                { value: '10K+', label: 'Events hosted' },
                { value: '50K+', label: 'Happy attendees' },
                { value: '100%', label: 'Secure tickets' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="font-display font-bold text-3xl gradient-text">{stat.value}</div>
                  <div className="text-white/50 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-mint-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-mint-400 text-sm font-medium tracking-widest uppercase mb-2">Don't miss out</p>
            <h2 className="font-display font-bold text-4xl text-white">Upcoming Events</h2>
          </div>
          <Link
            href="/events"
            className="hidden sm:flex items-center gap-2 text-mint-400 hover:text-mint-300 font-medium transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">No events yet</h3>
            <p className="text-white/50 mb-6">Be the first to create an event on TicketFlow</p>
            <Link href="/auth/signup" className="px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-colors">
              Create Event
            </Link>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-navy-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-mint-400 text-sm font-medium tracking-widest uppercase mb-2">What's your vibe?</p>
            <h2 className="font-display font-bold text-4xl text-white">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href={`/events?category=${encodeURIComponent(cat.name)}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} glass border border-white/10 p-6 hover:border-mint-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-mint-500/10`}
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="font-display font-semibold text-white group-hover:text-mint-300 transition-colors">{cat.name}</h3>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-mint-400 mt-2 transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features / How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-mint-400 text-sm font-medium tracking-widest uppercase mb-2">Simple & fast</p>
          <h2 className="font-display font-bold text-4xl text-white">How TicketFlow Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Find Your Event',
              description: 'Browse hundreds of events by category, date, or location. Find exactly what excites you.',
              icon: '🔍',
            },
            {
              step: '02',
              title: 'Secure Your Ticket',
              description: 'Choose your ticket tier, fill in your details, and complete your purchase in seconds.',
              icon: '🎫',
            },
            {
              step: '03',
              title: 'Get Your Unique Code',
              description: 'Receive a unique ticket code instantly. Print it or show it on your phone at the door.',
              icon: '✨',
            },
          ].map(item => (
            <div key={item.step} className="relative group">
              <div className="glass rounded-2xl p-8 hover:border-mint-500/30 transition-all h-full">
                <div className="font-display font-extrabold text-6xl text-mint-500/10 mb-4 group-hover:text-mint-500/20 transition-colors">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For Organizers CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-700 to-navy-800" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-mint-500/50 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-lime-400/30 text-lime-300 text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            <span>For Event Organizers</span>
          </div>

          <h2 className="font-display font-bold text-5xl text-white mb-6">
            Ready to host your
            <span className="gradient-text"> next event?</span>
          </h2>
          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
            Create events, manage ticket tiers, track sales, and check in attendees — all from one powerful dashboard.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-mint-500 text-navy-900 font-bold text-lg hover:bg-mint-400 transition-all hover:scale-105 glow-mint"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
            >
              <Shield className="w-5 h-5 text-mint-400" />
              See Examples
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
