# 🏪 Shopnest

**Turn your Instagram shop into a real storefront — orders on WhatsApp, payments via UPI.**

Shopnest is a storefront builder for Instagram sellers in India. Sellers get a beautiful, mobile-first one-page store at `yoursite.com/storename`. Buyers browse products, add them to a lite cart, and check out with a **single WhatsApp message** — no payment gateway, no commissions, no app to install.

## ✨ Features

### For sellers
- 🚀 **5-minute setup** — sign up, pick a store link, add your WhatsApp number, go live
- 🛍️ **Product manager** — add/edit products with multi-image upload (auto-compressed), categories, stock toggle, and drag-to-reorder
- 🎨 **Store builder** — drag-and-drop sections (hero, products, testimonials, FAQ, socials & more) with a **live phone preview**, 5 theme presets, curated font pairs, custom accent colors and button shapes
- 📸 **Instagram import** — paste a post URL and get a pre-filled product draft
- 📄 **Catalog PDF** — one-click multi-page product catalog with a store QR code
- 📱 **Share kit** — auto-generated 1080×1920 Instagram story card with your store QR
- 📊 **Analytics** — daily page views, WhatsApp clicks per product, top products
- 💎 **Free plan** — 10 products free; Pro unlocks unlimited + your own website

### For buyers
- 🛒 **Cart-lite** — tap to add products; sticky bar shows count + total
- 💬 **WhatsApp checkout** — one tap sends the full order (items + total) as a WhatsApp message
- 📲 **UPI payments** — scannable UPI QR with the cart amount pre-filled
- 🌐 **Hindi / English** toggle for all storefront labels
- ⚡ Fast, SEO-friendly, designed mobile-first (perfect at 360px)

## 💎 Plans — Free vs Pro

| | Free | Pro · ₹199/mo or ₹999/yr |
|---|---|---|
| Products | 10 | Unlimited |
| Storefront at `shopnest.store/name` | ✅ | ✅ |
| WhatsApp cart + UPI QR + Hindi/English | ✅ | ✅ |
| **Custom website (Home + Shop pages)** | — | ✅ |
| **Own subdomain `name.shopnest.store`** | — | ✅ |
| Custom domain (`www.yourbrand.in`) | — | ✅ add-on |
| Desktop + mobile builder layouts | mobile | both |
| Remove "Powered by Shopnest" badge | — | ✅ |
| Analytics history | 30 days | 90 days + export |
| Instagram imports | 3/month | Unlimited |
| Catalog PDF & story card | with Shopnest QR | white-label |

Full tier details, market research, and the feature roadmap live in [`docs/FEATURES.md`](docs/FEATURES.md). The pitch deck is at [`docs/PITCH.md`](docs/PITCH.md).

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions), TypeScript strict |
| Auth | Clerk (Email + Google) |
| Database & storage | Supabase (Postgres + RLS, public storage bucket for product images) |
| Styling | Tailwind CSS 3 + shadcn/ui, custom editorial design system |
| State | Zustand (cart), react-hook-form + zod (all forms) |
| Extras | @dnd-kit (drag & drop), recharts (analytics), jspdf + qrcode (catalog/QR), browser-image-compression |

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Chiragj2003/Shopnest.git
cd Shopnest
npm install
```

### 2. Environment

Create `.env.local`:

```env
# Supabase (Dashboard → Settings → API keys)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...        # server-only, never expose

# Clerk (dashboard.clerk.com → API Keys, enable Email + Google)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...           # only needed in production
```

### 3. Database

Open the Supabase **SQL Editor** and run the contents of [`schema.sql`](schema.sql). This creates the tables (`sellers`, `products`, `store_sections`, `orders_log`), all RLS policies, and the `product-images` storage bucket.

### 4. Seed the demo store (optional)

```bash
npm run seed
```

Creates **Demo Bakery** at [`/demobakery`](http://localhost:3000/demobakery) with 6 products and 3 sections.

### 5. Run

```bash
npm run dev
```

Visit `http://localhost:3000` — sign up, complete onboarding, and your store is live at `/your-slug`.

## 📦 Production (Vercel)

1. Push to GitHub and import the repo in Vercel
2. Add all `.env.local` variables in **Settings → Environment Variables**
3. In Clerk: **Configure → Webhooks → Add Endpoint** → `https://your-domain/api/webhooks/clerk`, subscribe to `user.created`, and set the signing secret as `CLERK_WEBHOOK_SECRET`

## 🗂️ Project Structure

```
app/
  [slug]/            # public storefront (server-rendered, dynamic SEO)
  dashboard/         # seller dashboard: products, store-builder, settings, analytics
  onboarding/        # 5-step store setup
  api/
    webhooks/clerk/  # user.created → seller skeleton row (svix-verified)
    instagram-import # IG post → product draft
components/
  storefront/        # themed storefront renderer (cart, UPI modal, i18n)
  dashboard/         # dashboard UI (dnd grids, forms, charts)
lib/
  actions/           # server actions (Clerk-authed writes via secret key)
  themes.ts, i18n.ts, whatsapp.ts, validation.ts
utils/supabase/      # SSR / browser / admin / public clients
schema.sql           # full database schema + RLS
scripts/seed.ts      # demo store seeder
```

## 🔐 Security Model

- Public (anon key): **read-only** on sellers/products/sections, **insert-only** on the click log
- All writes go through **server actions** that verify the Clerk session, then use the Supabase secret key scoped to that seller's ID
- Image uploads are validated, compressed client-side, and stored under the seller's folder

## 🪪 License

MIT
