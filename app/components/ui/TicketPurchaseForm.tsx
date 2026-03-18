'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Minus, Plus, CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/app/lib/utils'
import type { EventWithTiers, TicketTier } from '@/app/lib/database.types'

interface Props {
  event: EventWithTiers
}

interface CartItem {
  tier: TicketTier
  quantity: number
}

export default function TicketPurchaseForm({ event }: Props) {
  const router = useRouter()
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [step, setStep] = useState<'select' | 'details' | 'processing'>('select')
  const [error, setError] = useState<string | null>(null)

  const [buyerDetails, setBuyerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const availableTiers = event.ticket_tiers?.filter(t => t.is_visible && (t.total_quantity - t.sold_quantity) > 0) ?? []
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = Object.values(cart).reduce((sum, item) => sum + item.quantity * item.tier.price, 0)
  const currency = availableTiers[0]?.currency ?? 'KES'

  const updateCart = (tier: TicketTier, delta: number) => {
    const available = tier.total_quantity - tier.sold_quantity
    setCart(prev => {
      const current = prev[tier.id]?.quantity ?? 0
      const next = Math.max(0, Math.min(current + delta, tier.max_per_order, available))
      if (next === 0) {
        const { [tier.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [tier.id]: { tier, quantity: next } }
    })
  }

  const handlePurchase = async () => {
    setError(null)
    if (!buyerDetails.name || !buyerDetails.email) {
      setError('Please fill in your name and email.')
      return
    }
    if (totalItems === 0) {
      setError('Please select at least one ticket.')
      return
    }

    setStep('processing')

    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          cart: Object.values(cart).map(item => ({
            tierId: item.tier.id,
            quantity: item.quantity,
          })),
          buyer: buyerDetails,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Purchase failed')

      router.push(`/tickets/confirmation/${data.orderNumber}`)
    } catch (err: any) {
      setError(err.message)
      setStep('details')
    }
  }

  if (step === 'processing') {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <Loader2 className="w-12 h-12 text-mint-400 mx-auto animate-spin mb-4" />
        <h3 className="font-display font-bold text-xl text-white mb-2">Processing your order…</h3>
        <p className="text-white/50 text-sm">Please don't close this window</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-mint-500/10 to-lime-400/10 px-6 py-4 border-b border-white/10">
        <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-mint-400" />
          Get Tickets
        </h2>
      </div>

      <div className="p-6">
        {step === 'select' ? (
          <>
            {/* Tier selection */}
            {availableTiers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">😔</div>
                <p className="text-white/60 font-medium">No tickets available</p>
                <p className="text-white/40 text-sm mt-1">Check back later or explore other events</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {availableTiers.map(tier => {
                  const qty = cart[tier.id]?.quantity ?? 0
                  const available = tier.total_quantity - tier.sold_quantity
                  return (
                    <div key={tier.id} className="rounded-xl p-4 bg-white/5 border border-white/10 hover:border-mint-500/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{tier.name}</h4>
                          {tier.description && (
                            <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{tier.description}</p>
                          )}
                          <p className="text-white/30 text-xs mt-1">{available} left</p>
                        </div>
                        <div className="font-display font-bold text-lg gradient-text whitespace-nowrap">
                          {formatCurrency(tier.price, tier.currency)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCart(tier, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white/70 hover:border-mint-500/50 hover:text-mint-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-display font-bold text-white text-lg">{qty}</span>
                        <button
                          onClick={() => updateCart(tier, 1)}
                          disabled={qty >= Math.min(tier.max_per_order, available)}
                          className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white/70 hover:border-mint-500/50 hover:text-mint-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        {qty > 0 && (
                          <span className="ml-auto text-mint-400 text-sm font-medium">
                            = {formatCurrency(qty * tier.price, tier.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Order summary */}
            {totalItems > 0 && (
              <div className="rounded-xl p-4 bg-mint-500/5 border border-mint-500/20 mb-4">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>{totalItems} ticket{totalItems > 1 ? 's' : ''}</span>
                  <span className="font-display font-bold text-white text-base">
                    {formatCurrency(totalPrice, currency)}
                  </span>
                </div>
                {Object.values(cart).map(item => (
                  <div key={item.tier.id} className="flex justify-between text-xs text-white/40">
                    <span>{item.tier.name} × {item.quantity}</span>
                    <span>{formatCurrency(item.tier.price * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep('details')}
              disabled={totalItems === 0}
              className="w-full py-3.5 rounded-xl bg-mint-500 text-navy-900 font-bold text-base hover:bg-mint-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] glow-mint"
            >
              Continue → {totalItems > 0 && formatCurrency(totalPrice, currency)}
            </button>
          </>
        ) : (
          <>
            {/* Buyer details form */}
            <div className="space-y-4 mb-6">
              <h3 className="font-display font-semibold text-white">Your Details</h3>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Full Name *</label>
                <input
                  type="text"
                  value={buyerDetails.name}
                  onChange={e => setBuyerDetails(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Email Address *</label>
                <input
                  type="email"
                  value={buyerDetails.email}
                  onChange={e => setBuyerDetails(p => ({ ...p, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Phone (optional)</label>
                <input
                  type="tel"
                  value={buyerDetails.phone}
                  onChange={e => setBuyerDetails(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+254 700 000 000"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Order recap */}
            <div className="rounded-xl p-4 bg-white/5 border border-white/10 mb-4 space-y-2 text-sm">
              {Object.values(cart).map(item => (
                <div key={item.tier.id} className="flex justify-between text-white/70">
                  <span>{item.tier.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.tier.price * item.quantity, currency)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/10 flex justify-between font-display font-bold text-white">
                <span>Total</span>
                <span className="gradient-text">{formatCurrency(totalPrice, currency)}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handlePurchase}
                className="w-full py-3.5 rounded-xl bg-mint-500 text-navy-900 font-bold text-base hover:bg-mint-400 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 glow-mint"
              >
                <CreditCard className="w-4 h-4" />
                Confirm & Get Tickets
              </button>
              <button
                onClick={() => { setStep('select'); setError(null) }}
                className="w-full py-2.5 rounded-xl glass text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
            </div>

            <p className="text-white/30 text-xs text-center mt-4">
              🔒 Your details are safe with us. Tickets will be emailed instantly.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
