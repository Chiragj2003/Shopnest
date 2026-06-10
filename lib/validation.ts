import { z } from "zod";

export const RESERVED_SLUGS = [
  "dashboard", "onboarding", "api", "sign-in", "sign-up", "admin", "create",
  "app", "www", "about", "pricing", "terms", "privacy", "settings", "store",
];

export const slugSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(30, "At most 30 characters")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Lowercase letters, numbers and hyphens only")
  .refine((s) => !RESERVED_SLUGS.includes(s), "This name is reserved");

export const whatsappSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const upiSchema = z
  .string()
  .regex(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/, "Enter a valid UPI ID (e.g. name@upi)")
  .or(z.literal(""));

export const onboardingSchema = z.object({
  slug: slugSchema,
  storeName: z.string().min(2, "At least 2 characters").max(60),
  whatsapp: whatsappSchema,
  upiId: upiSchema.optional().or(z.literal("")),
  themePreset: z.string().min(1, "Pick a theme"),
});
export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.number().positive("Price must be greater than 0"),
  category: z.string().max(40).optional().or(z.literal("")),
  inStock: z.boolean(),
  imageUrls: z.array(z.string().url()).max(6),
});
export type ProductValues = z.infer<typeof productSchema>;

export const settingsSchema = z.object({
  slug: slugSchema,
  storeName: z.string().min(2).max(60),
  bio: z.string().max(240).optional().or(z.literal("")),
  whatsapp: whatsappSchema,
  upiId: upiSchema.optional().or(z.literal("")),
  waTemplate: z
    .string()
    .min(5)
    .max(300)
    .refine((t) => t.includes("{product}"), "Template must include {product}"),
});
export type SettingsValues = z.infer<typeof settingsSchema>;

export const FREE_PRODUCT_LIMIT = 10;
