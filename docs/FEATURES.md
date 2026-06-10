# Shopnest — Features, Tiers & Roadmap

> Last updated: June 2026. Companion to [PITCH.md](PITCH.md).

## 1. Market research summary

**The market is large and growing fast.** India's social commerce market is estimated at **~USD 29B in 2025, growing at ~37% CAGR toward USD 144B by 2030** ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/india-social-commerce-market)); other analysts are even more aggressive ([Grand View Research](https://www.grandviewresearch.com/horizon/outlook/social-commerce-market/india)). ~90% of GMV is on smartphones, and chat-commerce via WhatsApp is the dominant pattern ([IMARC](https://www.imarcgroup.com/india-social-commerce-market)). ONDC alone has onboarded 700,000+ small sellers ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/india-social-commerce-market)).

**What competitors charge (June 2026):**

| Product | Entry paid plan | Notes |
|---|---|---|
| Dukaan | ~₹299–433/mo ([SaaSworthy](https://www.saasworthy.com/product/dukaan-io/pricing), [AP Digital](https://apdigi.in/dukaan-review/)) | Full checkout, needs payment gateway KYC |
| Wix India | ₹199/mo but **annual billing only** (₹2,388/yr) ([Nimbbl guide](https://nimbbl.biz/blog/wix-plans-india)) | Generic website builder, no WhatsApp commerce |
| Shopify India | ₹1,499/mo after trial ([Avada](https://avada.io/blog/shopify-price-in-india/)) | Overkill + too costly for micro-sellers |
| Linktree | $8–35/mo (~₹670–2,900) ([The Leap](https://www.theleap.co/blog/linktree-pricing/)) | Links only, raised prices 67% in Nov 2025 |

**The gap Shopnest fills:** nobody offers *WhatsApp-native ordering + UPI + a real custom website* under ₹200/month with zero payment-gateway KYC. Dukaan is checkout-first (KYC friction), Wix/Shopify are website-first (no WhatsApp commerce), Linktree is links-only. Shopnest sits exactly in the middle — and the custom-website Pro feature lets us pitch it as **"your own website"**, not just "a store link", which is emotionally bigger for small business owners.

## 2. Current features (shipped ✅)

- Mobile-first storefront at `/{slug}` with themed sections (hero, text, image, products, testimonials, FAQ, socials)
- Cart-lite → single WhatsApp order message; per-product "Order on WhatsApp"; out-of-stock "Notify me"
- UPI QR payment modal with cart total pre-filled
- Hindi / English storefront toggle
- Drag-and-drop store builder with live phone preview, 5 theme presets, 5 font pairs, custom colors & button shapes
- Product manager: multi-image upload (client-compressed), categories, stock toggle, drag-to-reorder
- Instagram post import → product draft
- Catalog PDF + 1080×1920 story share card (both with store QR)
- Analytics: daily views, WhatsApp clicks, top products
- Clerk auth, Supabase RLS security model, demo store seeding

## 3. Free vs Pro

| Feature | Free | Pro (₹199/mo or ₹999/yr) |
|---|---|---|
| Products | 10 | **Unlimited** |
| Storefront page (`shopnest.store/name`) | ✅ | ✅ |
| WhatsApp cart + UPI QR | ✅ | ✅ |
| Theme presets & fonts | ✅ | ✅ + premium themes |
| **Custom website (2 pages: Home + Shop)** | — | ✅ |
| **Own subdomain `name.shopnest.store`** | — | ✅ |
| Custom domain (`www.yourbrand.in`) | — | ✅ (₹499/yr add-on or bundled annual) |
| Desktop + mobile layouts in builder | mobile only | ✅ both, with preview toggle |
| "Powered by Shopnest" badge | shown | **removable** |
| Analytics history | 30 days | 90 days + CSV export |
| Catalog PDF & story card | ✅ with Shopnest QR | ✅ white-label |
| Instagram import | 3/month | Unlimited |
| Order inbox (click log w/ product details) | basic | Full + daily WhatsApp digest |
| Support | community | WhatsApp priority support |

*Pricing rationale: undercuts Dukaan's entry plan, matches Wix's headline price but with monthly billing and WhatsApp-native commerce they don't have. Launch offer: ₹1,499 lifetime for first 100 sellers.*

## 4. Custom website (Pro) — feasibility & architecture

**Verdict: very feasible.** We already own 80% of the hard part (the section builder + theme engine). Plan:

1. **Two pages per store** — add a `page` field to `store_sections` (`home` | `shop`). "Shop" keeps the current product/cart experience; "Home" is the free-form custom page (hero, gallery, about, testimonials, contact/map, embeds). Builder gets a page switcher tab.
2. **Desktop + mobile** — keep the **section-based** builder (like Shopify/Dukaan), not free-pixel drag-drop (like Wix). Sections get responsive layout variants (e.g. image-left/right, 2/3/4-column grids) and the preview gains a mobile/desktop toggle. Free-pixel builders take months and produce broken mobile sites — section-based is the industry-proven approach for non-designers.
3. **Subdomains (`ria.shopnest.store`)** — wildcard DNS (`*.shopnest.store`) pointed at Vercel + ~30 lines in `middleware.ts` that read the `Host` header and rewrite `ria.shopnest.store` → `/ria`. No per-seller infra, effectively zero marginal cost.
4. **Custom domains** — seller's own domain attached via the Vercel Domains API + a CNAME instruction screen. Slightly more ops, hence the add-on pricing.
5. **SEO** — each subdomain gets its own sitemap, OG tags (already built), and indexable pages — a genuine "my business has a website" story for the seller.

Estimated effort: pages + builder tab ~1 week, subdomain middleware ~1 day, desktop layouts ~1–2 weeks, custom domains ~3–4 days.

## 5. Feature backlog (future ideas)

**Commerce**
- Order status tracking (received → packed → delivered) with WhatsApp status links
- Razorpay/UPI payment-link upsell for sellers who want confirmed payment before dispatch
- Delivery-area & charges config (pin-code based)
- Coupons / festival sale banners (Diwali, Rakhi templates)
- Product variants (size/color) and inventory counts

**Growth**
- Referral program: free Pro month per referred seller
- Theme marketplace (designers sell themes, rev-share)
- Reviews: buyers submit via WhatsApp link, seller approves
- Auto-generated reels/poster templates from product photos
- Buyer-side discovery directory of Shopnest stores (city/category)

**Operations & retention**
- WhatsApp daily digest: "Yesterday: 42 views, 5 order clicks, top product: Fudge Cake"
- Abandoned-cart nudge link sellers can copy
- Bulk product import via CSV/Excel
- Multi-language beyond Hindi (Tamil, Telugu, Bengali, Marathi)
- Staff access (one helper login per store)

**AI (later, strong pitch material)**
- AI product descriptions from a photo
- AI background cleanup for product images
- AI WhatsApp reply suggestions from buyer messages
