import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/actions/seller";
import { createAdminClient } from "@/utils/supabase/admin";
import { AnalyticsView, type DailyPoint, type ProductClicks } from "@/components/dashboard/analytics-view";

export const metadata = { title: "Analytics — Shopnest" };

const DAYS = 30;

export default async function AnalyticsPage() {
  const seller = await getCurrentSeller();
  if (!seller?.slug) redirect("/onboarding");

  const supabase = createAdminClient();
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: logs }, { data: products }] = await Promise.all([
    supabase
      .from("orders_log")
      .select("product_id, event_type, clicked_at")
      .eq("seller_id", seller.id)
      .gte("clicked_at", since),
    supabase.from("products").select("id, name").eq("seller_id", seller.id),
  ]);

  const productName = new Map((products ?? []).map((p) => [p.id as string, p.name as string]));

  // daily series
  const days: DailyPoint[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push({
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      key: d.toISOString().slice(0, 10),
      views: 0,
      clicks: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  const clicksByProduct = new Map<string, number>();

  for (const log of logs ?? []) {
    const key = (log.clicked_at as string).slice(0, 10);
    const day = byKey.get(key);
    if (day) {
      if (log.event_type === "page_view") day.views++;
      else day.clicks++;
    }
    if (log.event_type === "wa_click" && log.product_id) {
      clicksByProduct.set(
        log.product_id as string,
        (clicksByProduct.get(log.product_id as string) ?? 0) + 1
      );
    }
  }

  const perProduct: ProductClicks[] = [...clicksByProduct.entries()]
    .map(([id, clicks]) => ({ name: productName.get(id) ?? "Deleted product", clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);

  const totals = {
    views: days.reduce((n, d) => n + d.views, 0),
    clicks: days.reduce((n, d) => n + d.clicks, 0),
  };

  return (
    <AnalyticsView
      daily={days}
      perProduct={perProduct}
      totals={totals}
      isPremium={seller.is_premium}
    />
  );
}
