import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hero-gradient bg-grid-pattern bg-grid flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center relative">
        <div className="font-display font-extrabold text-[10rem] leading-none gradient-text opacity-20 select-none">
          404
        </div>
        <div className="-mt-16 relative z-10">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">Page not found</h1>
          <p className="text-white/50 mb-8 max-w-sm mx-auto">
            This page doesn't exist or the event may have been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-semibold hover:bg-mint-400 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Back to TicketFlow
          </Link>
        </div>
      </div>
    </div>
  )
}
