import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/utils/supabase/public";
import { StorefrontView } from "@/components/storefront/storefront-view";
import type { Product, Seller, StoreSection } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function fetchStore(slug: string) {
  const supabase = createPublicClient();
  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!seller) return null;

  const [{ data: sections }, { data: products }] = await Promise.all([
    supabase
      .from("store_sections")
      .select("*")
      .eq("seller_id", seller.id)
      .order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("seller_id", seller.id)
      .order("sort_order"),
  ]);

  return {
    seller: seller as Seller,
    sections: (sections ?? []) as StoreSection[],
    products: (products ?? []) as Product[],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStore(slug);
  if (!store) return { title: "Store not found" };
  const { seller } = store;
  const title = `${seller.store_name} — Order on WhatsApp`;
  const description = seller.bio ?? `Shop from ${seller.store_name}. Browse products and order directly on WhatsApp.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: seller.logo_url ? [seller.logo_url] : undefined,
    },
  };
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params;
  const store = await fetchStore(slug);
  if (!store) notFound();

  return (
    <StorefrontView
      seller={store.seller}
      sections={store.sections}
      products={store.products}
    />
  );
}
