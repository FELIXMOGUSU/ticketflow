'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import Navbar from '@/app/components/layout/Navbar'
import { Plus, Trash2, Loader2, AlertCircle, ArrowLeft, Save, Eye } from 'lucide-react'
import { slugify, EVENT_CATEGORIES } from '@/app/lib/utils'

interface TierForm {
  name: string
  description: string
  price: string
  total_quantity: string
  max_per_order: string
}

const emptyTier = (): TierForm => ({
  name: '',
  description: '',
  price: '0',
  total_quantity: '100',
  max_per_order: '10',
})

export default function NewEventPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Music',
    venue: '',
    address: '',
    city: '',
    country: 'Kenya',
    start_date: '',
    end_date: '',
    status: 'draft' as 'draft' | 'published',
  })

  const [tiers, setTiers] = useState<TierForm[]>([emptyTier()])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addTier = () => setTiers(p => [...p, emptyTier()])
  const removeTier = (i: number) => setTiers(p => p.filter((_, idx) => idx !== i))
  const updateTier = (i: number, field: keyof TierForm, value: string) => {
    setTiers(p => p.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    setError(null)
    if (!form.title || !form.venue || !form.city || !form.start_date || !form.end_date) {
      setError('Please fill in all required fields.')
      return
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setError('End date must be after start date.')
      return
    }
    if (tiers.some(t => !t.name || !t.total_quantity)) {
      setError('Each ticket tier needs a name and quantity.')
      return
    }

    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }

      let image_url: string | null = null

      // Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('event-images')
          .upload(path, imageFile, { upsert: true })

        if (uploadErr) throw new Error('Image upload failed: ' + uploadErr.message)

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(path)
        image_url = publicUrl
      }

      const slug = slugify(form.title)

      // Create event
      const { data: event, error: eventErr } = await supabase
        .from('events')
        .insert({
          organizer_id: session.user.id,
          title: form.title,
          slug,
          description: form.description || null,
          category: form.category,
          image_url,
          venue: form.venue,
          address: form.address || null,
          city: form.city,
          country: form.country,
          start_date: form.start_date,
          end_date: form.end_date,
          status,
        })
        .select()
        .single()

      if (eventErr || !event) throw new Error(eventErr?.message ?? 'Failed to create event')

      // Create ticket tiers
      const tiersToInsert = tiers.map(t => ({
        event_id: event.id,
        name: t.name,
        description: t.description || null,
        price: parseFloat(t.price) || 0,
        currency: 'KES',
        total_quantity: parseInt(t.total_quantity) || 100,
        max_per_order: parseInt(t.max_per_order) || 10,
      }))

      const { error: tiersErr } = await supabase
        .from('ticket_tiers')
        .insert(tiersToInsert)

      if (tiersErr) throw new Error(tiersErr.message)

      router.push(status === 'published' ? `/events/${slug}` : '/dashboard')

    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl glass hover:bg-white/10 text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-3xl text-white">Create New Event</h1>
            <p className="text-white/50 text-sm">Fill in the details below to publish your event</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-white mb-5">Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Nairobi Jazz Festival 2025"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Tell attendees what to expect..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  >
                    {EVENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                    placeholder="Kenya"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Event Image */}
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Event Image</label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden h-48 mb-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/20 hover:border-mint-500/50 cursor-pointer transition-colors">
                      <span className="text-3xl mb-2">📸</span>
                      <span className="text-white/50 text-sm">Click to upload image</span>
                      <span className="text-white/30 text-xs mt-1">JPG, PNG up to 10MB</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Venue & Date */}
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-white mb-5">When & Where</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Venue Name *</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
                  placeholder="e.g. KICC, Uhuru Gardens"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Street Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="Nairobi"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Ticket Tiers */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-white">Ticket Tiers</h2>
              <button
                type="button"
                onClick={addTier}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint-500/10 border border-mint-500/30 text-mint-400 text-sm hover:bg-mint-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Tier
              </button>
            </div>

            <div className="space-y-4">
              {tiers.map((tier, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white text-sm">Tier {i + 1}</h4>
                    {tiers.length > 1 && (
                      <button onClick={() => removeTier(i)} className="text-red-400/70 hover:text-red-400 text-xs flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Tier Name *</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={e => updateTier(i, 'name', e.target.value)}
                        placeholder="e.g. General, VIP, VVIP"
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Price (KES, 0 = Free)</label>
                      <input
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={e => updateTier(i, 'price', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Total Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={tier.total_quantity}
                        onChange={e => updateTier(i, 'total_quantity', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Max Per Order</label>
                      <input
                        type="number"
                        min="1"
                        value={tier.max_per_order}
                        onChange={e => updateTier(i, 'max_per_order', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-white/40 text-xs mb-1 block">Description (optional)</label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={e => updateTier(i, 'description', e.target.value)}
                        placeholder="What's included in this tier?"
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-mint-500 text-navy-900 font-bold hover:bg-mint-400 transition-all hover:scale-105 disabled:opacity-50 glow-mint"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Publish Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
