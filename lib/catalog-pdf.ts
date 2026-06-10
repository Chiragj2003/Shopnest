"use client";

import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/whatsapp";

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadCatalogPdf({
  storeName,
  storeUrl,
  products,
}: {
  storeName: string;
  storeUrl: string;
  products: Product[];
}) {
  const inStock = products.filter((p) => p.in_stock);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;

  // Cover header
  doc.setFillColor(217, 91, 42);
  doc.rect(0, 0, W, 48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(storeName, 14, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Product Catalog — order on WhatsApp", 14, 31);
  doc.text(storeUrl, 14, 38);

  const qr = await QRCode.toDataURL(storeUrl, { width: 256, margin: 1 });
  doc.addImage(qr, "PNG", W - 42, 8, 32, 32);

  // Product grid: 2 cols x 3 rows per page
  const cardW = 88;
  const cardH = 72;
  const marginX = 14;
  const gapX = 6;
  const startY = 56;
  const gapY = 8;

  let col = 0;
  let row = 0;

  for (const p of inStock) {
    if (row === 3) {
      doc.addPage();
      row = 0;
      col = 0;
    }
    const x = marginX + col * (cardW + gapX);
    const y = (row === 0 && doc.getNumberOfPages() === 1 ? startY : 16) + row * (cardH + gapY);

    doc.setDrawColor(225, 218, 208);
    doc.roundedRect(x, y, cardW, cardH, 3, 3);

    const img = p.image_urls[0] ? await toDataUrl(p.image_urls[0]) : null;
    if (img) {
      try {
        doc.addImage(img, "JPEG", x + 3, y + 3, cardW - 6, 44, undefined, "FAST");
      } catch {
        // unsupported format — skip image
      }
    }

    doc.setTextColor(34, 28, 24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const name = doc.splitTextToSize(p.name, cardW - 8) as string[];
    doc.text(name.slice(0, 1), x + 4, y + 54);
    doc.setTextColor(217, 91, 42);
    doc.setFontSize(12);
    doc.text(`Rs. ${formatINR(p.price)}`, x + 4, y + 62);

    col++;
    if (col === 2) {
      col = 0;
      row++;
    }
  }

  doc.save(`${storeName.replace(/\s+/g, "-").toLowerCase()}-catalog.pdf`);
}
