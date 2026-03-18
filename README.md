# 🎫 TicketFlow — Full-Stack Events & Ticketing Platform

A production-ready events ticketing platform built with **Next.js 14**, **Supabase**, and deployable to **Vercel**.

**Color palette:** Minty Lime · Dark Navy · White · Black

---

## ✨ Features

### For Attendees
- 🔍 Browse & search events by category, city, or keyword
- 🎟 Select ticket tiers, specify quantities, and check out instantly
- 🖨 Get a printable ticket with a **unique QR code** for each ticket
- 📱 View all your tickets in "My Tickets" dashboard

### For Organizers
- 📅 Create events with images, descriptions, categories, venue & dates
- 🎫 Configure multiple ticket tiers (Free, General, VIP, VVIP…)
- 📊 Dashboard with revenue, tickets sold, and order history
- 👁 Publish/Draft event status control
- ✅ QR code check-in verification page

### Technical
- 🔐 Supabase Auth (email/password)
- 🗄 Supabase PostgreSQL with Row Level Security
- 📦 Supabase Storage for event images
- ⚡ Next.js 14 App Router + Server Components
- 🌐 REST API routes for ticket purchase & verification
- 🖨 Print-optimized ticket layout with QR codes

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourusername/ticketflow.git
cd ticketflow
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Authentication → Settings** and configure your Site URL
4. (Optional) Disable email confirmation for faster local dev

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find your keys at: **Supabase Dashboard → Project Settings → API**

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

### Method 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

When prompted, add your environment variables.

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL, e.g. `https://ticketflow.vercel.app`)
5. Click **Deploy** ✅

---

## 🗂 Project Structure

```
ticketflow/
├── app/
│   ├── api/
│   │   ├── events/route.ts           # GET events API
│   │   └── tickets/
│   │       ├── purchase/route.ts     # POST purchase endpoint
│   │       └── [code]/route.ts       # GET/POST verify & check-in
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       ├── EventCard.tsx
│   │       ├── TicketPurchaseForm.tsx
│   │       └── PrintableTickets.tsx
│   ├── dashboard/
│   │   ├── page.tsx                  # Organizer dashboard
│   │   └── events/new/page.tsx       # Create event form
│   ├── events/
│   │   ├── page.tsx                  # Events listing
│   │   └── [slug]/page.tsx           # Event detail + purchase
│   ├── my-tickets/page.tsx           # Attendee tickets
│   ├── tickets/
│   │   └── confirmation/[orderNumber]/page.tsx
│   ├── verify/[code]/page.tsx        # QR code verification
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── database.types.ts
│   │   └── utils.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Home page
├── supabase/
│   └── schema.sql                    # Full DB schema — run this!
├── .env.local.example
├── vercel.json
├── tailwind.config.js
└── package.json
```

---

## 🗄 Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Extended user profiles (role: attendee/organizer/admin) |
| `events` | Event listings with venue, dates, status |
| `ticket_tiers` | Ticket types per event (price, quantity, limits) |
| `orders` | Purchase orders with buyer details |
| `tickets` | Individual tickets with unique codes & QR data |

All tables have **Row Level Security (RLS)** enabled.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List published events (with filters) |
| `POST` | `/api/tickets/purchase` | Purchase tickets (creates order + tickets) |
| `GET` | `/api/tickets/:code` | Verify a ticket by code |
| `POST` | `/api/tickets/:code` | Check in a ticket (mark as used) |

---

## 💳 Adding Real Payments

The current setup marks orders as `confirmed` immediately (demo mode). To add real payments:

**M-Pesa (Safaricom Daraja API)** — recommended for Kenya:
1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Use the STK Push API for mobile payments
3. Add a webhook to confirm payment and update order status

**Stripe:**
1. `npm install stripe @stripe/stripe-js`
2. Create a checkout session in `/api/tickets/purchase`
3. Add a webhook at `/api/webhooks/stripe` to fulfill orders

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| `attendee` | Browse events, purchase tickets, view own tickets |
| `organizer` | All attendee permissions + create/manage events |
| `admin` | Full access (set manually in Supabase) |

To make someone an organizer, update their profile:
```sql
UPDATE public.profiles SET role = 'organizer' WHERE email = 'user@example.com';
```

---

## 🎨 Design System

- **Primary:** Minty Green (`#22c55e`) + Lime (`#a3e635`)
- **Background:** Dark Navy (`#0a0f1e`, `#0d1529`, `#111d3c`)
- **Display Font:** Syne (headings)
- **Body Font:** DM Sans
- **Mono Font:** JetBrains Mono (ticket codes)

---

## 📄 License

MIT — free to use, modify, and deploy.
