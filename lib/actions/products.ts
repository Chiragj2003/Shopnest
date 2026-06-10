"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { productSchema, FREE_PRODUCT_LIMIT, type ProductValues } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/seller";
import type { Product } from "@/lib/types";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

async function revalidateStore(supabase: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await supabase.from("sellers").select("slug").eq("id", userId).single();
  if (data?.slug) revalidatePath(`/${data.slug}`);
  revalidatePath("/dashboard/products");
}

export async function addProduct(values: ProductValues): Promise<ActionResult<Product>> {
  const userId = await requireUser();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createAdminClient();

  const [{ count }, { data: seller }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("seller_id", userId),
    supabase.from("sellers").select("is_premium").eq("id", userId).single(),
  ]);
  if ((count ?? 0) >= FREE_PRODUCT_LIMIT && !seller?.is_premium) {
    return { ok: false, error: "FREE_LIMIT" };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: userId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      category: parsed.data.category || null,
      in_stock: parsed.data.inStock,
      image_urls: parsed.data.imageUrls,
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  await revalidateStore(supabase, userId);
  return { ok: true, data: data as Product };
}

export async function updateProduct(id: string, values: ProductValues): Promise<ActionResult<Product>> {
  const userId = await requireUser();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      category: parsed.data.category || null,
      in_stock: parsed.data.inStock,
      image_urls: parsed.data.imageUrls,
    })
    .eq("id", id)
    .eq("seller_id", userId)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  await revalidateStore(supabase, userId);
  return { ok: true, data: data as Product };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const userId = await requireUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id).eq("seller_id", userId);
  if (error) return { ok: false, error: error.message };
  await revalidateStore(supabase, userId);
  return { ok: true };
}

export async function reorderProducts(orderedIds: string[]): Promise<ActionResult> {
  const userId = await requireUser();
  const supabase = createAdminClient();
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("products").update({ sort_order: i }).eq("id", id).eq("seller_id", userId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  await revalidateStore(supabase, userId);
  return { ok: true };
}
