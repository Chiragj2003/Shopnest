"use server";

import { createPublicClient } from "@/utils/supabase/public";

// Public actions — RLS allows anonymous INSERT on orders_log only.

export async function logWaClick(sellerId: string, productId?: string) {
  try {
    const supabase = createPublicClient();
    await supabase.from("orders_log").insert({
      seller_id: sellerId,
      product_id: productId ?? null,
      event_type: "wa_click",
    });
  } catch {
    // Logging must never block an order.
  }
}

export async function logPageView(sellerId: string) {
  try {
    const supabase = createPublicClient();
    await supabase.from("orders_log").insert({
      seller_id: sellerId,
      product_id: null,
      event_type: "page_view",
    });
  } catch {
    // Best-effort only.
  }
}
