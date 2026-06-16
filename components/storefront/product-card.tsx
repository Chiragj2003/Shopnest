"use client";

import Image from "next/image";
import { ShoppingBag, Check, BellRing } from "lucide-react";
import type { Product, Seller } from "@/lib/types";
import type { Labels } from "@/lib/i18n";
import { useCart } from "@/zustand/store";
import { fillTemplate, formatINR, notifyMeMessage, waLink, WHATSAPP_GREEN } from "@/lib/whatsapp";
import { WhatsAppGlyph } from "@/components/ui/whatsapp";
import { logWaClick } from "@/lib/actions/orders";

export function ProductCard({
  product,
  seller,
  labels,
  preview,
}: {
  product: Product;
  seller: Seller;
  labels: Labels;
  preview?: boolean;
}) {
  const cart = useCart();
  const inCart = cart.lines.some((l) => l.product.id === product.id);
  const images = product.image_urls.length > 0 ? product.image_urls : [];

  const orderNow = () => {
    const msg = fillTemplate(seller.wa_template, {
      product: product.name,
      price: formatINR(product.price),
      store: seller.store_name,
    });
    if (!preview) void logWaClick(seller.id, product.id);
    window.open(waLink(seller.whatsapp_number, msg), "_blank");
  };

  const notifyMe = () => {
    const msg = notifyMeMessage(seller.store_name, product.name);
    window.open(waLink(seller.whatsapp_number, msg), "_blank");
  };

  return (
    <div
      className="overflow-hidden border"
      style={{
        background: "var(--sf-card)",
        borderRadius: "calc(var(--sf-radius) + 6px)",
        borderColor: "color-mix(in srgb, var(--sf-text) 10%, transparent)",
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.04), 0 10px 30px -16px rgb(0 0 0 / 0.18)",
      }}
    >
      {/* image carousel */}
      <div className="relative">
        {images.length > 0 ? (
          <div className="flex snap-x snap-mandatory overflow-x-auto scroll-thin" style={{ scrollbarWidth: "none" }}>
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square w-full shrink-0 snap-center">
                <Image
                  src={url}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  sizes="(max-width: 480px) 100vw, 420px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex aspect-square w-full items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--sf-accent) 6%, var(--sf-card))" }}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "color-mix(in srgb, var(--sf-accent) 12%, transparent)",
                color: "var(--sf-accent)",
              }}
            >
              <ShoppingBag className="h-6 w-6" />
            </span>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/80 shadow" />
            ))}
          </div>
        )}
        {!product.in_stock && (
          <span
            className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "var(--sf-text)", color: "var(--sf-bg)" }}
          >
            {labels.outOfStock}
          </span>
        )}
      </div>

      <div className="space-y-2.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight" style={{ fontFamily: "var(--sf-font-body)" }}>
              {product.name}
            </h3>
            {product.category && (
              <p className="mt-0.5 text-[11px]" style={{ color: "var(--sf-muted)" }}>
                {product.category}
              </p>
            )}
          </div>
          <p className="shrink-0 text-[15px] font-bold">₹{formatINR(product.price)}</p>
        </div>

        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--sf-muted)" }}>
            {product.description}
          </p>
        )}

        {product.in_stock ? (
          <div className="flex gap-2">
            <button
              onClick={() => (inCart ? cart.remove(product.id) : cart.add(product))}
              aria-label={inCart ? labels.added : labels.addToCart}
              className="press flex shrink-0 items-center justify-center gap-1.5 border px-3 py-2.5 text-xs font-semibold transition-colors"
              style={{
                borderRadius: "var(--sf-radius)",
                borderColor: inCart ? "var(--sf-accent)" : "color-mix(in srgb, var(--sf-text) 18%, transparent)",
                background: inCart ? "color-mix(in srgb, var(--sf-accent) 12%, transparent)" : "transparent",
                color: inCart ? "var(--sf-accent)" : "var(--sf-text)",
              }}
            >
              {inCart ? (
                <>
                  <Check className="h-3.5 w-3.5" /> {labels.added}
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" /> {labels.add}
                </>
              )}
            </button>
            <button
              onClick={orderNow}
              className="press flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white shadow-sm"
              style={{
                borderRadius: "var(--sf-radius)",
                background: WHATSAPP_GREEN,
              }}
            >
              <WhatsAppGlyph className="h-4 w-4" /> {labels.orderWhatsApp}
            </button>
          </div>
        ) : (
          <button
            onClick={notifyMe}
            className="press flex w-full items-center justify-center gap-1.5 border px-3 py-2.5 text-xs font-semibold"
            style={{
              borderRadius: "var(--sf-radius)",
              borderColor: `color-mix(in srgb, ${WHATSAPP_GREEN} 40%, transparent)`,
              color: WHATSAPP_GREEN,
            }}
          >
            <BellRing className="h-3.5 w-3.5" /> {labels.notifyMe}
          </button>
        )}
      </div>
    </div>
  );
}
