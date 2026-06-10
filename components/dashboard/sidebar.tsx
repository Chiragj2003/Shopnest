"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  ExternalLink,
  LayoutTemplate,
  Menu,
  Package,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/store-builder", label: "Store Builder", icon: LayoutTemplate },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  storeName,
  slug,
  isPremium,
}: {
  storeName: string;
  slug: string;
  isPremium: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "press flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <a
        href={`/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
        View my store
      </a>
    </nav>
  );

  const planBadge = (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
        isPremium ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {isPremium ? "Premium plan" : "Free plan · 10 products"}
    </div>
  );

  return (
    <>
      {/* mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="press rounded-lg p-1.5 hover:bg-secondary">
          <Menu className="h-5 w-5" />
        </button>
        <p className="truncate font-display text-sm font-bold">{storeName}</p>
        <UserButton />
      </header>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <div
            className="flex h-full w-64 flex-col gap-4 bg-background p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold">
                shop<span className="text-primary">nest</span>
              </p>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {planBadge}
          </div>
        </div>
      )}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-5 border-r bg-card/50 p-4 md:flex">
        <p className="px-2 font-display text-lg font-bold">
          shop<span className="text-primary">nest</span>
        </p>
        <div className="px-2">
          <p className="truncate text-sm font-semibold">{storeName}</p>
          <p className="truncate text-xs text-muted-foreground">/{slug}</p>
        </div>
        {nav}
        <div className="space-y-3">
          {planBadge}
          <div className="px-2">
            <UserButton showName />
          </div>
        </div>
      </aside>
    </>
  );
}
