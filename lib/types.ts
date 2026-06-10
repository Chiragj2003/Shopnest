export type ButtonShape = "rounded" | "square" | "pill";

export type StoreTheme = {
  preset: string;
  background: "solid" | "gradient";
  bg: string;
  bgGradient: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  fontPair: string;
  buttonShape: ButtonShape;
};

export type Seller = {
  id: string;
  slug: string | null;
  store_name: string;
  bio: string | null;
  whatsapp_number: string;
  upi_id: string | null;
  theme: StoreTheme | null;
  logo_url: string | null;
  wa_template: string;
  is_premium: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[];
  category: string | null;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
};

export type SectionType =
  | "hero"
  | "text"
  | "image"
  | "products"
  | "testimonials"
  | "faq"
  | "socials";

export type SectionContent = {
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  caption?: string;
  // testimonials: [{ name, text }], faq: [{ q, a }], socials: [{ platform, url }]
  items?: Array<Record<string, string>>;
};

export type StoreSection = {
  id: string;
  seller_id: string;
  type: SectionType;
  content: SectionContent;
  sort_order: number;
};
