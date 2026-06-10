import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/actions/seller";
import { createAdminClient } from "@/utils/supabase/admin";
import { StoreBuilder } from "@/components/dashboard/store-builder";
import type { Product, StoreSection } from "@/lib/types";

export const metadata = { title: "Store Builder — Shopnest" };

export default async function StoreBuilderPage() {
  const seller = await getCurrentSeller();
  if (!seller?.slug) redirect("/onboarding");

  const supabase = createAdminClient();
  const [{ data: sections }, { data: products }] = await Promise.all([
    supabase.from("store_sections").select("*").eq("seller_id", seller.id).order("sort_order"),
    supabase.from("products").select("*").eq("seller_id", seller.id).order("sort_order"),
  ]);

  return (
    <StoreBuilder
      seller={seller}
      initialSections={(sections ?? []) as StoreSection[]}
      products={(products ?? []) as Product[]}
    />
  );
}
