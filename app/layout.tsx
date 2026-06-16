import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopnest — Your WhatsApp Storefront",
  description:
    "Turn your Instagram shop into a beautiful one-page store. Buyers browse, tap, and order straight on WhatsApp.",
  openGraph: {
    title: "Shopnest — Your WhatsApp Storefront",
    description:
      "Shopnest is the storefront builder for Instagram sellers in India. One link, every product, orders on WhatsApp.",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>
        <ClerkProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ClerkProvider>
      </body>
    </html>
  );
}
