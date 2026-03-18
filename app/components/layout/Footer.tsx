import Link from 'next/link'
import { Ticket, Twitter, Instagram, Facebook, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-900 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint-500 to-lime-400 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-navy-900" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">TicketFlow</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              The easiest way to discover events, create experiences, and connect communities.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Instagram, Facebook, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/50 hover:text-mint-400 hover:border-mint-500/40 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-mint-400 mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {['Browse Events', 'Featured Events', 'Categories', 'Near Me'].map(link => (
                <li key={link}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-mint-400 mb-4">Organizers</h4>
            <ul className="space-y-2.5">
              {['Create Event', 'Dashboard', 'Ticket Management', 'Analytics'].map(link => (
                <li key={link}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-mint-400 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(link => (
                <li key={link}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} TicketFlow. All rights reserved.
          </p>
          <p className="text-white/30 text-sm font-mono">
            Built for Africa · Powered by Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
