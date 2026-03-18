'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Ticket, User, LogOut, ChevronDown, Plus, LayoutDashboard } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import type { Profile } from '@/app/lib/database.types'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => { if (data) setUser(data as Profile) })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => { if (data) setUser(data as Profile) })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/events', label: 'Browse Events' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint-500 to-lime-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4 text-navy-900" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">TicketFlow</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-mint-400 ${
                  pathname === link.href ? 'text-mint-400' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link
                    href="/dashboard/events/new"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mint-500/10 border border-mint-500/30 text-mint-400 text-sm font-medium hover:bg-mint-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg glass hover:bg-white/10 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint-500 to-lime-400 flex items-center justify-center text-navy-900 text-xs font-bold">
                      {user.full_name?.[0] ?? user.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80">{user.full_name ?? 'Account'}</span>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-dark rounded-xl overflow-hidden shadow-2xl border border-white/10">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-mint-400" />
                        Dashboard
                      </Link>
                      <Link
                        href="/my-tickets"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Ticket className="w-4 h-4 text-mint-400" />
                        My Tickets
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-mint-400" />
                        Profile
                      </Link>
                      <div className="h-px bg-white/10 mx-4" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-lg bg-mint-500 text-navy-900 text-sm font-semibold hover:bg-mint-400 transition-all hover:scale-105 glow-mint"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg glass hover:bg-white/10"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-dark border-t border-white/10 py-4">
          <div className="flex flex-col gap-1 px-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-2" />
            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link href="/my-tickets" className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setOpen(false)}>My Tickets</Link>
                <button onClick={handleSignOut} className="px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 text-left">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setOpen(false)}>Sign in</Link>
                <Link href="/auth/signup" className="px-3 py-2.5 rounded-lg bg-mint-500 text-navy-900 font-semibold text-center" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
