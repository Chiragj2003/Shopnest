"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ActionResult } from "@/lib/actions/seller";
import type { SectionContent, SectionType } from "@/lib/types";

export type SectionInput = {
  type: SectionType;
  content: SectionContent;
};

const VALID_TYPES: SectionType[] = ["hero", "text", "image", "products", "testimonials", "faq", "socials"];

// Replace-all save: the builder owns the full ordered list.
export async function saveSections(sections: SectionInput[]): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Not signed in" };
  if (sections.length > 20) return { ok: false, error: "Too many sections" };
  if (sections.some((s) => !VALID_TYPES.includes(s.type))) {
    return { ok: false, error: "Invalid section type" };
  }

  const supabase = createAdminClient();
  const { error: delError } = await supabase.from("store_sections").delete().eq("seller_id", userId);
  if (delError) return { ok: false, error: delError.message };

  if (sections.length > 0) {
    const { error } = await supabase.from("store_sections").insert(
      sections.map((s, i) => ({
        seller_id: userId,
        type: s.type,
        content: s.content,
        sort_order: i,
      }))
    );
    if (error) return { ok: false, error: error.message };
  }

  const { data: seller } = await supabase.from("sellers").select("slug").eq("id", userId).single();
  if (seller?.slug) revalidatePath(`/${seller.slug}`);
  revalidatePath("/dashboard/store-builder");
  return { ok: true };
}
