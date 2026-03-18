import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase'
import { generateOrderNumber, generateTicketCode } from '@/app/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()

  try {
    const body = await req.json()
    const { eventId, cart, buyer } = body as {
      eventId: string
      cart: { tierId: string; quantity: number }[]
      buyer: { name: string; email: string; phone?: string }
    }

    if (!eventId || !cart?.length || !buyer?.name || !buyer?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify event exists and is published
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('id, status, title')
      .eq('id', eventId)
      .eq('status', 'published')
      .single()

    if (eventErr || !event) {
      return NextResponse.json({ error: 'Event not found or not available' }, { status: 404 })
    }

    // Verify tiers and availability
    const tierIds = cart.map(c => c.tierId)
    const { data: tiers, error: tiersErr } = await supabase
      .from('ticket_tiers')
      .select('*')
      .in('id', tierIds)
      .eq('event_id', eventId)

    if (tiersErr || !tiers?.length) {
      return NextResponse.json({ error: 'Ticket tiers not found' }, { status: 404 })
    }

    // Check availability for each tier
    for (const item of cart) {
      const tier = tiers.find(t => t.id === item.tierId)
      if (!tier) return NextResponse.json({ error: `Tier not found: ${item.tierId}` }, { status: 400 })

      const available = tier.total_quantity - tier.sold_quantity
      if (item.quantity > available) {
        return NextResponse.json({
          error: `Only ${available} tickets available for "${tier.name}"`
        }, { status: 409 })
      }
      if (item.quantity > tier.max_per_order) {
        return NextResponse.json({
          error: `Maximum ${tier.max_per_order} tickets per order for "${tier.name}"`
        }, { status: 400 })
      }
    }

    // Calculate total
    let totalAmount = 0
    for (const item of cart) {
      const tier = tiers.find(t => t.id === item.tierId)!
      totalAmount += tier.price * item.quantity
    }

    // Generate unique order number
    let orderNumber = generateOrderNumber()
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single()
      if (!existing) break
      orderNumber = generateOrderNumber()
      attempts++
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        event_id: eventId,
        order_number: orderNumber,
        status: 'confirmed',  // In production, set to 'pending' until payment verified
        total_amount: totalAmount,
        currency: tiers[0].currency,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_phone: buyer.phone ?? null,
        payment_method: 'demo',  // Replace with real payment gateway
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error('Order creation error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create individual tickets
    const ticketsToInsert = []
    for (const item of cart) {
      const tier = tiers.find(t => t.id === item.tierId)!
      for (let i = 0; i < item.quantity; i++) {
        let code = generateTicketCode()
        ticketsToInsert.push({
          order_id: order.id,
          event_id: eventId,
          tier_id: tier.id,
          ticket_code: code,
          holder_name: buyer.name,
          holder_email: buyer.email,
          status: 'valid' as const,
        })
      }
    }

    const { error: ticketsErr } = await supabase
      .from('tickets')
      .insert(ticketsToInsert)

    if (ticketsErr) {
      console.error('Ticket creation error:', ticketsErr)
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to create tickets' }, { status: 500 })
    }

    // Update sold_quantity for each tier
    for (const item of cart) {
      const tier = tiers.find(t => t.id === item.tierId)!
      await supabase
        .from('ticket_tiers')
        .update({ sold_quantity: tier.sold_quantity + item.quantity })
        .eq('id', tier.id)
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
    })

  } catch (err) {
    console.error('Purchase API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
