import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  IndianRupee,
  Instagram,
  Palette,
  Share2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppGlyph } from "@/components/ui/whatsapp";

const HERO_PRODUCTS = [
  { emoji: "🍫", name: "Fudge Cake", price: "499" },
  { emoji: "🥐", name: "Croissants", price: "180" },
  { emoji: "🍞", name: "Sourdough", price: "220" },
  { emoji: "🍪", name: "Cookies", price: "150" },
];

const STATS = [
  { icon: Zap, value: "5 min", label: "to go live" },
  { icon: IndianRupee, value: "0%", label: "commission" },
  { icon: WhatsAppGlyph, value: "1 tap", label: "to order" },
  { icon: Sparkles, value: "₹0", label: "to start" },
];

const STEPS = [
  { icon: ShoppingBag, title: "Add your products", body: "Upload photos, or import a post straight from Instagram." },
  { icon: Share2, title: "Share your one link", body: "Drop it in your bio. One link holds your whole catalog." },
  { icon: WhatsAppGlyph, title: "Orders on WhatsApp", body: "Buyers tap to order — you get a ready-to-reply message." },
];

const FEATURES = [
  {
    icon: WhatsAppGlyph,
    tint: "whatsapp" as const,
    wide: true,
    title: "Orders land on WhatsApp",
    body: "No payment gateway, no commissions. Buyers tap a product and the order arrives as a tidy WhatsApp message — exactly how your customers already love to shop.",
  },
  {
    icon: Palette,
    tint: "primary" as const,
    wide: false,
    title: "A store that looks like you",
    body: "Themes, fonts and colors in a live phone preview.",
  },
  {
    icon: Instagram,
    tint: "primary" as const,
    wide: false,
    title: "Import from Instagram",
    body: "Pull a post in — photo, caption and price, done in seconds.",
  },
  {
    icon: Share2,
    tint: "primary" as const,
    wide: true,
    title: "Share-ready everywhere",
    body: "One tap turns your catalog into a PDF or an Instagram story card — so your whole shop travels with a single link.",
  },
];

const SHOWCASE = [
  {
    name: "Editorial Cream",
    bg: "#FAF6F0",
    card: "#FFFFFF",
    text: "#221C18",
    muted: "#8A7F75",
    accent: "#D95B2A",
    emoji: "🧁",
    store: "Aanya's Bakery",
    tag: "Fresh bakes daily",
  },
  {
    name: "Pastel Bloom",
    bg: "linear-gradient(170deg, #FDF2F6 0%, #EEE6FB 60%, #E3F0FD 100%)",
    card: "#FFFFFF",
    text: "#3A2E3F",
    muted: "#9C8AA5",
    accent: "#C2559D",
    emoji: "🌸",
    store: "Petal & Co",
    tag: "Handmade jewellery",
  },
  {
    name: "Dark Minimal",
    bg: "#101012",
    card: "#1B1B20",
    text: "#F4F4F5",
    muted: "#8E8E96",
    accent: "#C8F04C",
    emoji: "🕶️",
    store: "Mono Goods",
    tag: "Streetwear drops",
  },
];

function Wordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-sm ${
          size === "lg" ? "h-8 w-8" : "h-7 w-7"
        }`}
      >
        <ShoppingBag className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      </span>
      <span className={`font-display font-bold ${size === "lg" ? "text-lg" : "text-base"}`}>
        shop<span className="text-primary">nest</span>
      </span>
    </Link>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[2.7rem] border-[12px] border-foreground/90 bg-foreground/90 shadow-premium">
      <div className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
      <div className="overflow-hidden rounded-[1.9rem]">{children}</div>
    </div>
  );
}

function MiniPhone({ t }: { t: (typeof SHOWCASE)[number] }) {
  return (
    <div className="mx-auto w-[172px] rounded-[1.8rem] border-[7px] border-foreground/85 bg-foreground/85 shadow-premium transition-transform duration-300 hover:-translate-y-1.5">
      <div className="overflow-hidden rounded-[1.3rem]" style={{ background: t.bg, color: t.text }}>
        <div className="px-3 pb-2 pt-4 text-center">
          <div
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-lg"
            style={{ background: `color-mix(in srgb, ${t.accent} 16%, transparent)` }}
          >
            {t.emoji}
          </div>
          <p className="mt-1.5 text-[12px] font-bold leading-tight">{t.store}</p>
          <p className="text-[9px]" style={{ color: t.muted }}>
            {t.tag}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 px-2.5 pb-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl p-1.5" style={{ background: t.card }}>
              <div
                className="aspect-square rounded-lg"
                style={{ background: `color-mix(in srgb, ${t.accent} 14%, ${t.card})` }}
              />
              <div className="mt-1 flex items-center justify-between">
                <span
                  className="h-1.5 w-7 rounded-full"
                  style={{ background: `color-mix(in srgb, ${t.text} 16%, transparent)` }}
                />
                <span className="text-[8px] font-bold" style={{ color: t.accent }}>
                  ₹499
                </span>
              </div>
              <div className="mt-1 rounded-full py-0.5 text-center text-[7px] font-bold text-white" style={{ background: "#25D366" }}>
                Order
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* glassmorphism nav */}
      <header className="glass sticky top-0 z-50 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Wordmark />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#themes" className="transition-colors hover:text-foreground">Themes</a>
            <Link href="/demobakery" className="transition-colors hover:text-foreground">Demo</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="press">Open your store</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative isolate overflow-x-clip">
        <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]" />
        <div className="blob -left-24 top-10 -z-10 h-72 w-72 bg-primary/15" />
        <div className="blob -right-20 top-24 -z-10 h-80 w-80 bg-amber-400/15" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-2 lg:pt-20">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Smartphone className="h-3.5 w-3.5" /> Built for Instagram sellers in India
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
              Your Instagram shop, now a <span className="text-gradient">real storefront</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0">
              One link with all your products. Buyers browse, add to cart, and order on WhatsApp —
              payment sorted right there in the chat. Live in five minutes, free for your first 10 products.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" className="press glow-primary">
                    Open your store free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button size="lg" asChild className="press glow-primary">
                  <Link href="/dashboard">Go to dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </Show>
              <Button size="lg" variant="outline" asChild className="press">
                <Link href="/demobakery">See a live demo</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground lg:justify-start">
              {["Free for 10 products", "No card required", "Cancel anytime"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* device mockup + floating cards */}
          <div className="relative mx-auto w-full max-w-[300px] animate-fade-up">
            <div className="float-slow">
              <PhoneShell>
                <div className="bg-[#FAF6F0] pb-4">
                  <div className="px-4 pb-3 pt-9 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl">🧁</div>
                    <p className="mt-2 font-display text-lg font-bold text-[#221C18]">Aanya&apos;s Bakery</p>
                    <p className="text-[11px] text-[#8A7F75]">Fresh bakes, delivered in Indiranagar</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 px-4">
                    {HERO_PRODUCTS.map((p) => (
                      <div key={p.name} className="rounded-2xl bg-white p-2.5 shadow-sm">
                        <div className="flex aspect-square items-center justify-center rounded-xl bg-[#F3E9DC] text-3xl">{p.emoji}</div>
                        <p className="mt-1.5 truncate text-[11px] font-semibold text-[#221C18]">{p.name}</p>
                        <p className="text-[11px] font-bold text-[#D95B2A]">₹{p.price}</p>
                        <div className="mt-1.5 flex items-center justify-center gap-1 rounded-full bg-[#25D366] py-1.5 text-[9px] font-bold text-white">
                          <WhatsAppGlyph className="h-2.5 w-2.5" /> Order
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mx-4 mt-3 flex items-center justify-between rounded-full bg-[#221C18] px-4 py-2.5 text-[10px] font-bold text-white">
                    <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> 2 items</span>
                    <span>₹679</span>
                  </div>
                </div>
              </PhoneShell>
            </div>

            {/* floating accent cards (desktop) */}
            <div className="float-card absolute -left-6 top-20 z-20 hidden w-[176px] rounded-2xl bg-white p-3 shadow-premium ring-1 ring-border/60 sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp">
                  <WhatsAppGlyph className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">New order</p>
                  <p className="truncate text-[10px] text-muted-foreground">Fudge Cake · ₹499</p>
                </div>
              </div>
            </div>
            <div className="float-card-slow absolute -right-5 bottom-16 z-20 hidden w-[190px] rounded-2xl bg-white p-3 shadow-premium ring-1 ring-border/60 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">via WhatsApp</p>
              <p className="mt-1.5 rounded-2xl rounded-tl-sm bg-whatsapp/10 px-2.5 py-1.5 text-[11px] leading-snug text-foreground">
                Hi! I want to order Fudge Cake (₹499) 🧁
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* stats band */}
      <section className="mx-auto -mt-6 max-w-5xl px-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="card-soft flex flex-col items-center gap-1 px-3 py-5 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-1 font-display text-xl font-bold">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">How it works</span>
          <h2 className="mt-2 text-balance text-3xl font-bold sm:text-4xl">From DMs to a real shop in minutes</h2>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-5">
          <div className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block" />
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="relative flex flex-col items-center gap-3 text-center">
              <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
                <span className="flex h-full w-full items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
                  {i + 1}
                </span>
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="mx-auto mt-1 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* features bento */}
      <section id="features" className="scroll-mt-24 border-t bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Why Shopnest</span>
            <h2 className="mt-2 text-balance text-3xl font-bold sm:text-4xl">Everything you need to sell online</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Skip the dashboards and spreadsheets — just the few tools that actually move product for small sellers in India.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, tint, title, body, wide }) => (
              <div key={title} className={`card-soft card-hover group p-6 ${wide ? "md:col-span-2" : ""}`}>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${
                    tint === "whatsapp" ? "bg-whatsapp/10 text-whatsapp" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* theme showcase */}
      <section id="themes" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Make it yours</span>
          <h2 className="mt-2 text-balance text-3xl font-bold sm:text-4xl">{"A look that's unmistakably you"}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Five designer themes, plus custom colors, fonts and button shapes — all tuned to look perfect on a phone.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {SHOWCASE.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-3">
              <MiniPhone t={t} />
              <p className="text-sm font-semibold">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* conversion band */}
      <section className="px-5 pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#e0703a] to-amber-500 px-6 py-16 text-center shadow-premium">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(460px_240px_at_50%_-10%,#fff,transparent_70%)]" />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">
              <IndianRupee className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold text-white sm:text-4xl">Stop taking orders in DMs.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/85">
              Set up once, share your link everywhere. Free for your first 10 products — no card required.
            </p>
            <div className="mt-7 flex justify-center">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" className="press bg-white text-primary shadow-lg hover:bg-white/90">
                    Open your store free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button size="lg" asChild className="press bg-white text-primary shadow-lg hover:bg-white/90">
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              </Show>
            </div>
            <p className="mt-4 text-xs text-white/70">No commissions · Live in 5 minutes · Made in India</p>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
          <Wordmark size="sm" />
          <p className="order-3 text-xs text-muted-foreground sm:order-2">
            © 2026 Shopnest · Made for sellers, with ❤️
          </p>
          <div className="order-2 flex items-center gap-5 text-xs text-muted-foreground sm:order-3">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#themes" className="transition-colors hover:text-foreground">Themes</a>
            <Link href="/demobakery" className="transition-colors hover:text-foreground">Demo store</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
