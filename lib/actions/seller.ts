"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { onboardingSchema, settingsSchema, type OnboardingValues, type SettingsValues } from "@/lib/validation";
import { THEME_PRESETS } from "@/lib/themes";
import type { Seller, StoreTheme } from "@/lib/types";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function getCurrentSeller(): Promise<Seller | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = createAdminClient();
  const { data } = await supabase.from("sellers").select("*").eq("id", userId).maybeSingle();
  return data as Seller | null;
}

export async function completeOnboarding(values: OnboardingValues): Promise<ActionResult> {
  const userId = await requireUser();
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { data: taken } = await supabase
    .from("sellers")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", userId)
    .maybeSingle();
  if (taken) return { ok: false, error: "That store link is already taken" };

  const theme =
    THEME_PRESETS.find((t) => t.preset === parsed.data.themePreset) ?? THEME_PRESETS[0];

  const { error } = await supabase.from("sellers").upsert({
    id: userId,
    slug: parsed.data.slug,
    store_name: parsed.data.storeName,
    whatsapp_number: `91${parsed.data.whatsapp}`,
    theme,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateSettings(values: SettingsValues): Promise<ActionResult> {
  const userId = await requireUser();
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { data: taken } = await supabase
    .from("sellers")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", userId)
    .maybeSingle();
  if (taken) return { ok: false, error: "That store link is already taken" };

  const { error } = await supabase
    .from("sellers")
    .update({
      slug: parsed.data.slug,
      store_name: parsed.data.storeName,
      bio: parsed.data.bio || null,
      whatsapp_number: `91${parsed.data.whatsapp}`,
      wa_template: parsed.data.waTemplate,
    })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/${parsed.data.slug}`);
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function saveTheme(theme: StoreTheme): Promise<ActionResult> {
  const userId = await requireUser();
  const supabase = createAdminClient();
  const { data: seller, error } = await supabase
    .from("sellers")
    .update({ theme })
    .eq("id", userId)
    .select("slug")
    .single();
  if (error) return { ok: false, error: error.message };
  if (seller?.slug) revalidatePath(`/${seller.slug}`);
  return { ok: true };
}

export async function uploadImage(formData: FormData): Promise<ActionResult<string>> {
  const userId = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: "Image must be under 2MB" };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Not an image" };

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { ok: true, data: data.publicUrl };
}

export async function setLogo(url: string): Promise<ActionResult> {
  const userId = await requireUser();
  const supabase = createAdminClient();
  const { data: seller, error } = await supabase
    .from("sellers")
    .update({ logo_url: url })
    .eq("id", userId)
    .select("slug")
    .single();
  if (error) return { ok: false, error: error.message };
  if (seller?.slug) revalidatePath(`/${seller.slug}`);
  return { ok: true };
}
