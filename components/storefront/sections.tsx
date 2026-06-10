"use client";

import Image from "next/image";
import { ChevronDown, Globe, Instagram, Link as LinkIcon, Youtube } from "lucide-react";
import type { Product, Seller, StoreSection } from "@/lib/types";
import type { Labels } from "@/lib/i18n";
import { ProductCard } from "@/components/storefront/product-card";

export function SectionRenderer({
  section,
  seller,
  products,
  labels,
  preview,
}: {
  section: StoreSection;
  seller: Seller;
  products: Product[];
  labels: Labels;
  preview?: boolean;
}) {
  const c = section.content ?? {};

  switch (section.type) {
    case "hero":
      return (
        <header className="px-5 pb-8 pt-12 text-center">
          {seller.logo_url && (
            <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 shadow-lg"
              style={{ borderColor: "var(--sf-card)" }}>
              <Image src={seller.logo_url} alt={seller.store_name} fill sizes="80px" className="object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "var(--sf-font-display)" }}>
            {c.title || seller.store_name}
          </h1>
          {(c.subtitle || seller.bio) && (
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--sf-muted)" }}>
              {c.subtitle || seller.bio}
            </p>
          )}
          {c.imageUrl && (
            <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden" style={{ borderRadius: "calc(var(--sf-radius) + 8px)" }}>
              <Image src={c.imageUrl} alt="" fill sizes="(max-width: 480px) 100vw, 420px" className="object-cover" />
            </div>
          )}
        </header>
      );

    case "text":
      return (
        <section className="px-5 py-6">
          {c.title && (
            <h2 className="mb-2 text-xl font-bold" style={{ fontFamily: "var(--sf-font-display)" }}>
              {c.title}
            </h2>
          )}
          {c.body && (
            <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--sf-muted)" }}>
              {c.body}
            </p>
          )}
        </section>
      );

    case "image":
      return (
        <section className="px-5 py-6">
          {c.imageUrl && (
            <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ borderRadius: "calc(var(--sf-radius) + 8px)" }}>
              <Image src={c.imageUrl} alt={c.caption ?? ""} fill sizes="(max-width: 480px) 100vw, 420px" className="object-cover" />
            </div>
          )}
          {c.caption && (
            <p className="mt-2 text-center text-xs" style={{ color: "var(--sf-muted)" }}>
              {c.caption}
            </p>
          )}
        </section>
      );

    case "products":
      return (
        <section className="px-4 py-6">
          {c.title && (
            <h2 className="mb-4 px-1 text-xl font-bold" style={{ fontFamily: "var(--sf-font-display)" }}>
              {c.title}
            </h2>
          )}
          {products.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: "var(--sf-muted)" }}>
              No products yet — check back soon!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} seller={seller} labels={labels} preview={preview} />
              ))}
            </div>
          )}
        </section>
      );

    case "testimonials":
      return (
        <section className="px-5 py-6">
          {c.title && (
            <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--sf-font-display)" }}>
              {c.title}
            </h2>
          )}
          <div className="space-y-3">
            {(c.items ?? []).map((t, i) => (
              <figure
                key={i}
                className="border p-4"
                style={{
                  background: "var(--sf-card)",
                  borderRadius: "calc(var(--sf-radius) + 4px)",
                  borderColor: "color-mix(in srgb, var(--sf-text) 10%, transparent)",
                }}
              >
                <blockquote className="text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-2 text-xs font-semibold" style={{ color: "var(--sf-accent)" }}>
                  — {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="px-5 py-6">
          {c.title && (
            <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--sf-font-display)" }}>
              {c.title}
            </h2>
          )}
          <div className="space-y-2">
            {(c.items ?? []).map((f, i) => (
              <details
                key={i}
                className="group border p-3.5"
                style={{
                  background: "var(--sf-card)",
                  borderRadius: "var(--sf-radius)",
                  borderColor: "color-mix(in srgb, var(--sf-text) 10%, transparent)",
                }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                  {f.q}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--sf-muted)" }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      );

    case "socials": {
      const icon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes("insta")) return <Instagram className="h-4 w-4" />;
        if (p.includes("you")) return <Youtube className="h-4 w-4" />;
        if (p.includes("web")) return <Globe className="h-4 w-4" />;
        return <LinkIcon className="h-4 w-4" />;
      };
      return (
        <section className="flex flex-wrap justify-center gap-2 px-5 py-6">
          {(c.items ?? []).map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-semibold"
              style={{
                borderRadius: "var(--sf-radius)",
                background: "var(--sf-card)",
                borderColor: "color-mix(in srgb, var(--sf-text) 12%, transparent)",
              }}
            >
              {icon(s.platform)} {s.platform}
            </a>
          ))}
        </section>
      );
    }

    default:
      return null;
  }
}
