import { Webhook } from "svix";
import { headers } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";

type ClerkEvent = { type: string; data: { id: string } };

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret || secret.includes("REPLACE_ME")) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const hdrs = await headers();
  const svixId = hdrs.get("svix-id");
  const svixTimestamp = hdrs.get("svix-timestamp");
  const svixSignature = hdrs.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  let evt: ClerkEvent;
  try {
    evt = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const supabase = createAdminClient();
    // Skeleton row; onboarding fills in the rest (it upserts, so this webhook
    // being unconfigured in dev is not fatal).
    const { error } = await supabase
      .from("sellers")
      .upsert({ id: evt.data.id }, { onConflict: "id", ignoreDuplicates: true });
    if (error) return new Response(error.message, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
