-- ============================================================
-- TicketFlow — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  email        text unique not null,
  full_name    text,
  avatar_url   text,
  role         text not null default 'attendee' check (role in ('attendee', 'organizer', 'admin')),
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────
create table public.events (
  id              uuid default uuid_generate_v4() primary key,
  organizer_id    uuid references public.profiles(id) on delete cascade not null,
  title           text not null,
  slug            text unique not null,
  description     text,
  category        text not null default 'Other',
  image_url       text,
  venue           text not null,
  address         text,
  city            text not null,
  country         text not null default 'Kenya',
  start_date      timestamptz not null,
  end_date        timestamptz not null,
  status          text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  is_featured     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.events enable row level security;

create policy "Published events are viewable by everyone" on public.events
  for select using (status = 'published' or auth.uid() = organizer_id);

create policy "Organizers can create events" on public.events
  for insert with check (auth.uid() = organizer_id);

create policy "Organizers can update own events" on public.events
  for update using (auth.uid() = organizer_id);

create policy "Organizers can delete own events" on public.events
  for delete using (auth.uid() = organizer_id);

-- ─────────────────────────────────────────
-- TICKET TIERS
-- ─────────────────────────────────────────
create table public.ticket_tiers (
  id              uuid default uuid_generate_v4() primary key,
  event_id        uuid references public.events(id) on delete cascade not null,
  name            text not null,
  description     text,
  price           numeric(10,2) not null default 0,
  currency        text not null default 'KES',
  total_quantity  integer not null,
  sold_quantity   integer not null default 0,
  max_per_order   integer not null default 10,
  sale_starts_at  timestamptz,
  sale_ends_at    timestamptz,
  is_visible      boolean default true,
  created_at      timestamptz default now()
);

alter table public.ticket_tiers enable row level security;

create policy "Ticket tiers are viewable by everyone" on public.ticket_tiers
  for select using (true);

create policy "Organizers can manage tiers for own events" on public.ticket_tiers
  for all using (
    exists (
      select 1 from public.events
      where events.id = ticket_tiers.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
create table public.orders (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete set null,
  event_id        uuid references public.events(id) on delete cascade not null,
  order_number    text unique not null,
  status          text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  total_amount    numeric(10,2) not null default 0,
  currency        text not null default 'KES',
  buyer_name      text not null,
  buyer_email     text not null,
  buyer_phone     text,
  payment_method  text,
  payment_ref     text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id or
    exists (
      select 1 from public.events
      where events.id = orders.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Anyone can create orders" on public.orders
  for insert with check (true);

create policy "Organizers can update order status" on public.orders
  for update using (
    exists (
      select 1 from public.events
      where events.id = orders.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- TICKETS (individual tickets per order)
-- ─────────────────────────────────────────
create table public.tickets (
  id              uuid default uuid_generate_v4() primary key,
  order_id        uuid references public.orders(id) on delete cascade not null,
  event_id        uuid references public.events(id) on delete cascade not null,
  tier_id         uuid references public.ticket_tiers(id) on delete cascade not null,
  ticket_code     text unique not null,
  holder_name     text not null,
  holder_email    text not null,
  status          text not null default 'valid' check (status in ('valid', 'used', 'cancelled', 'refunded')),
  checked_in_at   timestamptz,
  created_at      timestamptz default now()
);

alter table public.tickets enable row level security;

create policy "Ticket holders and organizers can view tickets" on public.tickets
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = tickets.order_id
      and orders.user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.events
      where events.id = tickets.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "System can insert tickets" on public.tickets
  for insert with check (true);

-- ─────────────────────────────────────────
-- HELPER: Generate order number
-- ─────────────────────────────────────────
create or replace function generate_order_number()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'TF-';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────
-- HELPER: Generate ticket code  
-- ─────────────────────────────────────────
create or replace function generate_ticket_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..4 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  result := result || '-';
  for i in 1..4 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  result := result || '-';
  for i in 1..4 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index idx_events_status on public.events(status);
create index idx_events_start_date on public.events(start_date);
create index idx_events_organizer on public.events(organizer_id);
create index idx_events_slug on public.events(slug);
create index idx_ticket_tiers_event on public.ticket_tiers(event_id);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_event on public.orders(event_id);
create index idx_tickets_order on public.tickets(order_id);
create index idx_tickets_code on public.tickets(ticket_code);
create index idx_tickets_event on public.tickets(event_id);

-- ─────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "Anyone can view event images" on storage.objects
  for select using (bucket_id = 'event-images');

create policy "Authenticated users can upload event images" on storage.objects
  for insert with check (bucket_id = 'event-images' and auth.role() = 'authenticated');

create policy "Users can update own event images" on storage.objects
  for update using (bucket_id = 'event-images' and auth.uid()::text = (storage.foldername(name))[1]);
