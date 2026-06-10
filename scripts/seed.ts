/**
 * Seeds the demo store: "Demo Bakery" at /demobakery.
 * Usage: npm run seed   (requires SUPABASE_SECRET_KEY in .env.local)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// minimal .env.local loader (no dotenv dependency)
for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret || secret.includes("REPLACE_ME")) {
  console.error("❌ Set SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });

const SELLER_ID = "seed_demo_bakery";
const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80&fit=crop`;

async function main() {
  console.log("Seeding Demo Bakery…");

  const { error: sellerError } = await supabase.from("sellers").upsert({
    id: SELLER_ID,
    slug: "demobakery",
    store_name: "Demo Bakery",
    bio: "Fresh bakes, delivered in Indiranagar 🧁",
    whatsapp_number: "919876543210",
    upi_id: "demobakery@okhdfcbank",
    wa_template: "Hi! I want to order {product} (₹{price}) from {store}",
    theme: {
      preset: "Editorial Cream",
      background: "solid",
      bg: "#FAF6F0",
      bgGradient: "linear-gradient(165deg, #FAF6F0 0%, #F3E9DC 100%)",
      card: "#FFFFFF",
      text: "#221C18",
      muted: "#8A7F75",
      accent: "#D95B2A",
      accentText: "#FFFFFF",
      fontPair: "fraunces-inter",
      buttonShape: "pill",
    },
  });
  if (sellerError) throw sellerError;

  await supabase.from("products").delete().eq("seller_id", SELLER_ID);
  const { error: productsError } = await supabase.from("products").insert(
    [
      { name: "Chocolate Fudge Cake", price: 499, category: "Cakes", description: "Rich, dense, triple-chocolate. Serves 6. Order a day ahead.", image: "photo-1578985545062-69928b1d9587" },
      { name: "Sourdough Bread", price: 220, category: "Breads", description: "48-hour fermented country loaf with a crackly crust.", image: "photo-1585478259715-876acc5be8eb" },
      { name: "Butter Croissants (4)", price: 180, category: "Pastries", description: "Flaky, 27-layer laminated croissants. Baked every morning.", image: "photo-1555507036-ab1f4038808a" },
      { name: "Blueberry Cheesecake", price: 549, category: "Cakes", description: "Baked New York style with a fresh blueberry compote.", image: "photo-1533134242443-d4fd215305ad" },
      { name: "Masala Cookies (250g)", price: 150, category: "Cookies", description: "Sweet-spicy ajwain shortbread — chai's best friend.", image: "photo-1499636136210-6f4ee915583e" },
      { name: "Cinnamon Rolls (2)", price: 240, category: "Pastries", description: "Gooey centres, cream-cheese frosting. Sold out most weekends!", image: "photo-1509365465985-25d11c17e812", in_stock: false },
    ].map((p, i) => ({
      seller_id: SELLER_ID,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      in_stock: p.in_stock ?? true,
      sort_order: i,
      image_urls: [img(p.image)],
    }))
  );
  if (productsError) throw productsError;

  await supabase.from("store_sections").delete().eq("seller_id", SELLER_ID);
  const { error: sectionsError } = await supabase.from("store_sections").insert([
    {
      seller_id: SELLER_ID,
      type: "hero",
      sort_order: 0,
      content: { title: "Demo Bakery", subtitle: "Small-batch bakes made with Amul butter & lots of love. Order before 6pm for next-day delivery." },
    },
    {
      seller_id: SELLER_ID,
      type: "products",
      sort_order: 1,
      content: { title: "This week's menu" },
    },
    {
      seller_id: SELLER_ID,
      type: "faq",
      sort_order: 2,
      content: {
        title: "FAQ",
        items: [
          { q: "Do you deliver?", a: "Yes! Free delivery within 5km of Indiranagar, ₹40 beyond." },
          { q: "How do I pay?", a: "UPI on delivery, or scan the QR on this page after ordering." },
          { q: "Custom cakes?", a: "Absolutely — message us on WhatsApp with your idea 3 days ahead." },
        ],
      },
    },
  ]);
  if (sectionsError) throw sectionsError;

  console.log("✅ Done — visit /demobakery");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message ?? e);
  process.exit(1);
});
