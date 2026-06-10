"use client";

import { useEffect, useMemo, useState } from "react";
import { Languages, Minus, Plus, QrCode, ShoppingBag, Trash2, X } from "lucide-react";
import type { Product, Seller, StoreSection } from "@/lib/types";
import { DEFAULT_THEME, buttonRadius, getFontPair } from "@/lib/themes";
import { LABELS, type Lang } from "@/lib/i18n";
import { useCart } from "@/zustand/store";
import { cartMessage, formatINR, waLink } from "@/lib/whatsapp";
import { logPageView, logWaClick } from "@/lib/actions/orders";
import { SectionRenderer } from "@/components/storefront/sections";
import { UpiModal } from "@/components/storefront/upi-modal";

export function StorefrontView({
  seller,
  sections,
  products,
  preview = false,
}: {
  seller: Seller;
  sections: StoreSection[];
  products: Product[];
  preview?: boolean;
}) {
  const theme = seller.theme ?? DEFAULT_THEME;
  const font = getFontPair(theme.fontPair);
  const [lang, setLang] = useState<Lang>("en");
  const [cartOpen, setCartOpen] = useState(false);
  const [upiOpen, setUpiOpen] = useState(false);
  const labels = LABELS[lang];
  const cart = useCart();

  useEffect(() => {
    if (!preview) void logPageView(seller.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedSections = useMemo(() => {
    if (sections.length > 0) return [...sections].sort((a, b) => a.sort_order - b.sort_order);
    // Sensible default when the seller hasn't customized yet.
    return [
      { id: "default-hero", seller_id: seller.id, type: "hero", content: {}, sort_order: 0 },
      { id: "default-products", seller_id: seller.id, type: "products", content: { title: "Shop" }, sort_order: 1 },
    ] as StoreSection[];
  }, [sections, seller.id]);

  const count = cart.lines.reduce((n, l) => n + l.qty, 0);
  const total = cart.lines.reduce((n, l) => n + l.qty * l.product.price, 0);

  const checkout = () => {
    if (cart.lines.length === 0) return;
    const msg = cartMessage(
      seller.store_name,
      cart.lines.map((l) => ({ name: l.product.name, price: l.product.price, qty: l.qty })),
      total
    );
    if (!preview) {
      for (const l of cart.lines) void logWaClick(seller.id, l.product.id);
    }
    window.open(waLink(seller.whatsapp_number, msg), "_blank");
  };

  return (
    <div
      className="relative min-h-dvh w-full"
      style={
        {
          background: theme.background === "gradient" ? theme.bgGradient : theme.bg,
          color: theme.text,
          fontFamily: font.body,
          "--sf-bg": theme.bg,
          "--sf-card": theme.card,
          "--sf-text": theme.text,
          "--sf-muted": theme.muted,
          "--sf-accent": theme.accent,
          "--sf-accent-text": theme.accentText,
          "--sf-radius": buttonRadius(theme.buttonShape),
          "--sf-font-display": font.display,
          "--sf-font-body": font.body,
        } as React.CSSProperties
      }
    >
      {/* Google fonts for the seller's chosen pair */}
      <link rel="stylesheet" href={font.href} />

      {/* language toggle */}
      <button
        onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
        className="press fixed right-3 top-3 z-40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--sf-card) 85%, transparent)",
          borderColor: "color-mix(in srgb, var(--sf-text) 12%, transparent)",
          position: preview ? "absolute" : "fixed",
        }}
        aria-label="Switch language"
      >
        <Languages className="h-3.5 w-3.5" /> {lang === "en" ? "हिं" : "EN"}
      </button>

      <div className="mx-auto max-w-md pb-28">
        {orderedSections.map((s) => (
          <SectionRenderer
            key={s.id}
            section={s}
            seller={seller}
            products={products}
            labels={labels}
            preview={preview}
          />
        ))}
        <footer className="px-5 pb-6 pt-2 text-center text-[11px]" style={{ color: "var(--sf-muted)" }}>
          Powered by <span className="font-bold">Shopnest</span>
        </footer>
      </div>

      {/* sticky bottom bar */}
      <div
        className={`${preview ? "absolute" : "fixed"} bottom-0 left-0 right-0 z-40`}
      >
        <div className="mx-auto flex max-w-md items-center gap-2 px-3 pb-3">
          {seller.upi_id && (
            <button
              onClick={() => setUpiOpen(true)}
              className="press inline-flex items-center gap-1.5 border px-4 py-3 text-xs font-bold shadow-xl backdrop-blur"
              style={{
                borderRadius: "var(--sf-radius)",
                background: "color-mix(in srgb, var(--sf-card) 92%, transparent)",
                borderColor: "color-mix(in srgb, var(--sf-text) 12%, transparent)",
              }}
            >
              <QrCode className="h-4 w-4" /> {labels.payUpi}
            </button>
          )}
          <button
            onClick={() => (count > 0 ? setCartOpen(true) : undefined)}
            className="press flex flex-1 items-center justify-between gap-2 px-4 py-3 text-sm font-bold shadow-xl"
            style={{
              borderRadius: "var(--sf-radius)",
              background: "var(--sf-accent)",
              color: "var(--sf-accent-text)",
              opacity: count > 0 ? 1 : 0.85,
            }}
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {count > 0
                ? `${count} ${count === 1 ? labels.item : labels.items}`
                : labels.orderWhatsApp}
            </span>
            {count > 0 && <span>₹{formatINR(total)}</span>}
          </button>
        </div>
      </div>

      {/* cart sheet */}
      {cartOpen && (
        <div
          className={`${preview ? "absolute" : "fixed"} inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm`}
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-full max-w-md animate-fade-up rounded-t-3xl p-5 shadow-2xl"
            style={{ background: "var(--sf-card)", color: "var(--sf-text)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--sf-font-display)" }}>
                {labels.yourCart}
              </h3>
              <div className="flex items-center gap-1">
                {cart.lines.length > 0 && (
                  <button
                    onClick={() => cart.clear()}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold"
                    style={{ color: "var(--sf-muted)" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {labels.clearCart}
                  </button>
                )}
                <button onClick={() => setCartOpen(false)} aria-label={labels.close} className="rounded-full p-1.5">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {cart.lines.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: "var(--sf-muted)" }}>
                {labels.emptyCart}
              </p>
            ) : (
              <>
                <ul className="max-h-64 space-y-3 overflow-y-auto scroll-thin">
                  {cart.lines.map((l) => (
                    <li key={l.product.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{l.product.name}</p>
                        <p className="text-xs" style={{ color: "var(--sf-muted)" }}>
                          ₹{formatINR(l.product.price)}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-2 rounded-full border px-2 py-1"
                        style={{ borderColor: "color-mix(in srgb, var(--sf-text) 15%, transparent)" }}
                      >
                        <button onClick={() => cart.setQty(l.product.id, l.qty - 1)} aria-label="decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{l.qty}</span>
                        <button onClick={() => cart.setQty(l.product.id, l.qty + 1)} aria-label="increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t pt-3"
                  style={{ borderColor: "color-mix(in srgb, var(--sf-text) 10%, transparent)" }}>
                  <span className="text-sm font-semibold">{labels.total}</span>
                  <span className="text-lg font-bold">₹{formatINR(total)}</span>
                </div>
                <button
                  onClick={checkout}
                  className="press mt-3 w-full px-4 py-3.5 text-sm font-bold"
                  style={{
                    borderRadius: "var(--sf-radius)",
                    background: "var(--sf-accent)",
                    color: "var(--sf-accent-text)",
                  }}
                >
                  {labels.checkout} →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {upiOpen && seller.upi_id && (
        <UpiModal seller={seller} amount={total > 0 ? total : undefined} labels={labels} onClose={() => setUpiOpen(false)} />
      )}
    </div>
  );
}
