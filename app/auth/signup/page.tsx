'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'attendee' as 'attendee' | 'organizer',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update profile role if organizer selected
    if (form.role === 'organizer' && data.user) {
      await supabase
        .from('profiles')
        .update({ role: 'organizer', full_name: form.name })
        .eq('id', data.user.id)
    } else if (data.user) {
      await supabase
        .from('profiles')
        .update({ full_name: form.name })
        .eq('id', data.user.id)
    }

    setSuccess(true)
    setLoading(false)

    // If email confirmation is disabled in Supabase, redirect immediately
    if (data.session) {
      router.push(form.role === 'organizer' ? '/dashboard' : '/events')
    }
  }

  if (success && !supabase) {
    return null
  }

  return (
    <div className="min-h-screen bg-hero-gradient bg-grid-pattern bg-grid flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-500 to-lime-400 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-navy-900" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">TicketFlow</span>
          </Link>
        </div>

        {success ? (
          <div className="glass rounded-2xl p-10 text-center">
            <CheckCircle className="w-14 h-14 text-mint-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-white mb-2">Account Created!</h2>
            <p className="text-white/60 text-sm mb-6">
              Check your email to confirm your account, then sign in.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-bold hover:bg-mint-400 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Create your account</h1>
            <p className="text-white/50 text-sm mb-8">Join thousands of event-goers and organizers</p>

            {/* Role toggle */}
            <div className="flex rounded-xl glass p-1 mb-6 gap-1">
              {(['attendee', 'organizer'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    form.role === role
                      ? 'bg-mint-500 text-navy-900 font-semibold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {role === 'attendee' ? '🎟 Attendee' : '🎪 Organizer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-mint-500 text-navy-900 font-bold text-base hover:bg-mint-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2 glow-mint mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Create ${form.role === 'organizer' ? 'Organizer' : ''} Account`}
              </button>
            </form>

            <p className="text-center text-white/50 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-mint-400 hover:text-mint-300 font-medium">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
