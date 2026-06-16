import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  IndianRupee,
  Palette,
  Share2,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppGlyph } from "@/components/ui/whatsapp";

const FEATURES = [
  {
    icon: WhatsAppGlyph,
    tint: "whatsapp" as const,
    title: "Orders land on WhatsApp",
    body: "No payment gateway setup, no commissions. Buyers tap a product and the order arrives as a WhatsApp message — exactly how your customers already shop.",
  },
  {
    icon: Palette,
    tint: "primary" as const,
    title: "A store that looks like you",
    body: "Pick a theme, drag sections, tune fonts and colors in a live phone preview. Every preset is designed to look beautiful on a 360px screen.",
  },
  {
    icon: Share2,
    tint: "primary" as const,
    title: "Share-ready everywhere",
    body: "One tap turns your catalog into a PDF or an Instagram story card — so your whole shop travels with a single link.",
  },
];

const STEPS = [
  { icon: ShoppingBag, title: "Add your products", body: "Upload photos, or import a post straight from Instagram." },
  { icon: Share2, title: "Share your one link", body: "Drop it in your bio. One link holds your whole catalog." },
  { icon: WhatsAppGlyph, title: "Orders on WhatsApp", body: "Buyers tap to order — you get a ready-to-reply message." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-md [&:has(+section)]:border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <p className="font-display text-xl font-bold">
          shop<span className="text-primary">nest</span>
        </p>
        <nav className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Open your store</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
        </nav>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto grid max-w-5xl items-center gap-10 overflow-x-clip px-5 pb-20 pt-10 md:grid-cols-2 md:pt-16">
        <div className="blob -left-24 top-10 h-72 w-72 bg-primary/15" />
        <div className="blob -right-20 bottom-0 h-80 w-80 bg-amber-400/15" />
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Smartphone className="h-3.5 w-3.5" /> Built for Instagram sellers in India
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-5xl">
            Your Instagram shop,
            <br />
            now a <span className="text-gradient">real storefront</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            One link with all your products. Buyers browse, add to cart, and order on
            WhatsApp — payment sorted right there in the chat. Live in five minutes, free for your first 10 products.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg" className="press">
                  Open your store free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button size="lg" asChild className="press">
                <Link href="/dashboard">
                  Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Show>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/demobakery">See a demo store →</Link>
            </Button>
          </div>
        </div>

        {/* phone mockup */}
        <div className="relative mx-auto w-full max-w-[300px] animate-fade-up">
          <div className="float-slow overflow-hidden rounded-[2.6rem] border-[10px] border-foreground/90 shadow-[0_30px_60px_-20px_rgb(32_24_16/0.35)]">
            <div className="bg-[#FAF6F0] pb-5">
              <div className="px-4 pb-4 pt-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl">
                  🧁
                </div>
                <p className="mt-2 font-display text-lg font-bold text-[#221C18]">Demo Bakery</p>
                <p className="text-[11px] text-[#8A7F75]">Fresh bakes, delivered in Indiranagar</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 px-4">
                {[
                  { emoji: "🍫", name: "Fudge Cake", price: "499" },
                  { emoji: "🥐", name: "Croissants", price: "180" },
                  { emoji: "🍞", name: "Sourdough", price: "220" },
                  { emoji: "🍪", name: "Cookies", price: "150" },
                ].map((p) => (
                  <div key={p.name} className="rounded-2xl bg-white p-2.5 shadow-sm">
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-[#F3E9DC] text-3xl">
                      {p.emoji}
                    </div>
                    <p className="mt-1.5 truncate text-[11px] font-semibold text-[#221C18]">{p.name}</p>
                    <p className="text-[11px] font-bold text-[#D95B2A]">₹{p.price}</p>
                    <div className="mt-1.5 flex items-center justify-center gap-1 rounded-full bg-[#25D366] py-1.5 text-center text-[9px] font-bold text-white">
                      <WhatsAppGlyph className="h-2.5 w-2.5" /> Order
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-4 mt-3 flex items-center justify-between rounded-full bg-[#221C18] px-4 py-2.5 text-[10px] font-bold text-white">
                <span className="inline-flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3" /> 2 items
                </span>
                <span>₹679</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-5xl px-5 pb-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border bg-card/60 p-4">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="mt-12 border-t bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Why Shopnest
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Everything you need to sell online
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Skip the dashboards and spreadsheets — just the few tools that actually move
              product for small sellers in India.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, tint, title, body }) => (
              <div key={title} className="card-soft card-hover p-6">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
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

      {/* final CTA */}
      <section className="mx-auto max-w-5xl px-5 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IndianRupee className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
          Stop taking orders in DMs.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Set up once, share your link everywhere. Free for your first 10 products — no card required.
        </p>
        <div className="mt-7">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button size="lg" className="press">
                Open your store free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button size="lg" asChild className="press">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </Show>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © 2026 Shopnest · Made for sellers, with ❤️
      </footer>
    </div>
  );
}
