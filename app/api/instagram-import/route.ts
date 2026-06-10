import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Best-effort: fetch an Instagram post's og:image + caption, mirror the image
// into our storage bucket (IG CDN URLs expire), and return draft product data.
// Instagram frequently blocks server-side fetches — the client falls back to
// guided manual upload on failure.

const ALLOWED_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Only instagram.com post URLs are supported" }, { status: 400 });
  }

  try {
    const page = await fetch(parsed.toString(), {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!page.ok) throw new Error(`IG responded ${page.status}`);
    const html = await page.text();

    const og = (prop: string) =>
      html.match(new RegExp(`<meta[^>]+property="og:${prop}"[^>]+content="([^"]+)"`, "i"))?.[1] ??
      html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="og:${prop}"`, "i"))?.[1];

    const imageUrl = og("image");
    if (!imageUrl) throw new Error("No og:image found");

    // Mirror image into our bucket so it doesn't expire.
    const imgRes = await fetch(imageUrl.replace(/&amp;/g, "&"), {
      signal: AbortSignal.timeout(8000),
    });
    if (!imgRes.ok) throw new Error("Could not download image");
    const buf = await imgRes.arrayBuffer();
    if (buf.byteLength > 5 * 1024 * 1024) throw new Error("Image too large");

    const supabase = createAdminClient();
    const path = `${userId}/ig-${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, buf, { contentType: imgRes.headers.get("content-type") ?? "image/jpeg" });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);

    const rawTitle = og("title") ?? "";
    const caption = rawTitle.split(":").slice(1).join(":").trim().replace(/^"|"$/g, "");

    return NextResponse.json({
      images: [data.publicUrl],
      caption: caption.slice(0, 200),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Instagram blocked the request" },
      { status: 422 }
    );
  }
}
