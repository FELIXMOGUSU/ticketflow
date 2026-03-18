import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase'

// GET /api/tickets/[code] - verify ticket
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createAdminClient()
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*, ticket_tiers(name, price, currency), events(title, start_date, venue, city), orders(buyer_name, buyer_email, order_number)')
    .eq('ticket_code', params.code)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ valid: false, error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json({
    valid: ticket.status === 'valid',
    ticket,
  })
}

// POST /api/tickets/[code] - check in ticket
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createAdminClient()

  const { data: ticket } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_code', params.code)
    .single()

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (ticket.status !== 'valid') {
    return NextResponse.json({
      error: `Cannot check in ticket with status: ${ticket.status}`,
      status: ticket.status,
    }, { status: 409 })
  }

  const { error } = await supabase
    .from('tickets')
    .update({ status: 'used', checked_in_at: new Date().toISOString() })
    .eq('ticket_code', params.code)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Ticket checked in successfully' })
}
