"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { WhatsAppGlyph } from "@/components/ui/whatsapp";
import { WHATSAPP_GREEN } from "@/lib/whatsapp";
import { toast } from "sonner";

export type DailyPoint = { date: string; key: string; views: number; clicks: number };
export type ProductClicks = { name: string; clicks: number };

export function AnalyticsView({
  daily,
  perProduct,
  totals,
  isPremium,
}: {
  daily: DailyPoint[];
  perProduct: ProductClicks[];
  totals: { views: number; clicks: number };
  isPremium: boolean;
}) {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days, straight from your storefront.</p>
      </div>

      {!isPremium && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Get deeper insights with Premium</p>
              <p className="text-xs text-muted-foreground">90-day history, hourly breakdowns & buyer trends.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => toast.info("Premium is coming soon — stay tuned!")}>
            Upgrade
          </Button>
        </div>
      )}

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card-soft card-hover p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" /> <span className="text-xs font-medium">Page views</span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold">{totals.views}</p>
        </div>
        <div className="card-soft card-hover p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <WhatsAppGlyph className="h-4 w-4" style={{ color: WHATSAPP_GREEN }} />{" "}
            <span className="text-xs font-medium">WhatsApp clicks</span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold">{totals.clicks}</p>
        </div>
        <div className="card-soft col-span-2 p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> <span className="text-xs font-medium">Click rate</span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold">
            {totals.views > 0 ? `${Math.round((totals.clicks / totals.views) * 100)}%` : "—"}
          </p>
        </div>
      </div>

      {/* daily chart */}
      <div className="card-soft p-5">
        <h2 className="mb-4 text-sm font-bold">Views & order clicks per day</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ left: -22, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(17 70% 51%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(17 70% 51%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={WHATSAPP_GREEN} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={WHATSAPP_GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(32 22% 90%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(32 22% 88%)", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="views" name="Views" stroke="hsl(17 70% 51%)" fill="url(#views)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks" name="WhatsApp clicks" stroke={WHATSAPP_GREEN} fill="url(#clicks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* top products */}
      <div className="card-soft p-5">
        <h2 className="mb-4 text-sm font-bold">Top products by WhatsApp clicks</h2>
        {perProduct.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No clicks yet"
            description="Share your store link to land your first order clicks."
            className="py-8"
          />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perProduct} layout="vertical" margin={{ left: 30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(32 22% 90%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(32 22% 88%)", fontSize: 12 }}
                />
                <Bar dataKey="clicks" name="Clicks" fill="hsl(17 70% 51%)" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
