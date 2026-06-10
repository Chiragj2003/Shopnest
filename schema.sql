-- HelloLink → Seller Storefront schema
-- Run this in the Supabase SQL editor.
--
-- NOTE: the old HelloLink `users` table (link-in-bio data) is replaced by this
-- schema. Drop it manually once you've confirmed you don't need the data:
--   drop table if exists public.users cascade;

-- ============================== TABLES ==============================

create table if not exists public.sellers (
  id              text primary key,            -- Clerk user ID
  slug            text unique,
  store_name      text not null default '',
  bio             text,
  whatsapp_number text not null default '',
  upi_id          text,
  theme           jsonb,                       -- colors, fonts, button shape
  logo_url        text,
  wa_template     text not null default 'Hi! I want to order {product} (₹{price}) from {store}',
  is_premium      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists sellers_slug_idx on public.sellers (slug);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  seller_id   text not null references public.sellers(id) on delete cascade,
  name        text not null,
  description text,
  price       numeric not null,
  image_urls  text[] not null default '{}',
  category    text,
  in_stock    boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists products_seller_idx on public.products (seller_id, sort_order);

create table if not exists public.store_sections (
  id         uuid primary key default gen_random_uuid(),
  seller_id  text not null references public.sellers(id) on delete cascade,
  type       text not null check (type in ('hero','text','image','products','testimonials','faq','socials')),
  content    jsonb not null default '{}',
  sort_order int not null default 0
);

create index if not exists store_sections_seller_idx on public.store_sections (seller_id, sort_order);

create table if not exists public.orders_log (
  id         uuid primary key default gen_random_uuid(),
  seller_id  text not null references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  event_type text not null default 'wa_click' check (event_type in ('wa_click','page_view')),
  clicked_at timestamptz not null default now()
);

create index if not exists orders_log_seller_idx on public.orders_log (seller_id, clicked_at);

-- ============================== RLS ==============================
-- Writes to sellers/products/store_sections happen exclusively through
-- Next.js server actions using the SECRET key (bypasses RLS) after a Clerk
-- auth() check. The public (publishable key) gets read-only access, plus
-- insert-only on orders_log for click logging.

alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.store_sections enable row level security;
alter table public.orders_log enable row level security;

drop policy if exists "public read sellers" on public.sellers;
create policy "public read sellers" on public.sellers
  for select using (true);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

drop policy if exists "public read sections" on public.store_sections;
create policy "public read sections" on public.store_sections
  for select using (true);

drop policy if exists "public insert orders_log" on public.orders_log;
create policy "public insert orders_log" on public.orders_log
  for insert with check (true);
-- No public SELECT on orders_log: analytics are read server-side.

-- ============================== STORAGE ==============================
-- Bucket for product images: public read, writes only via the secret key
-- (uploads go through a server action).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
