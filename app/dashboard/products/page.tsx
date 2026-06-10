import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/actions/seller";
import { createAdminClient } from "@/utils/supabase/admin";
import { ProductsManager } from "@/components/dashboard/products-manager";
import type { Product } from "@/lib/types";

export const metadata = { title: "Products — Shopnest" };

export default async function ProductsPage() {
  const seller = await getCurrentSeller();
  if (!seller?.slug) redirect("/onboarding");

  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", seller.id)
    .order("sort_order");

  return (
    <ProductsManager
      initialProducts={(products ?? []) as Product[]}
      seller={seller}
    />
  );
}
