"use client";

import QRCode from "qrcode";
import type { Seller } from "@/lib/types";
import { DEFAULT_THEME } from "@/lib/themes";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// 1080x1920 Instagram-story card with theme gradient, logo, store QR.
export async function downloadShareCard(seller: Seller, storeUrl: string) {
  const theme = seller.theme ?? DEFAULT_THEME;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  // gradient background from theme colors
  const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
  grad.addColorStop(0, theme.accent);
  grad.addColorStop(1, theme.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // soft card panel
  const panel = { x: 90, y: 360, w: 900, h: 1200, r: 48 };
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.w, panel.h, panel.r);
  ctx.fill();

  // logo
  if (seller.logo_url) {
    const logo = await loadImage(seller.logo_url);
    if (logo) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 520, 110, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, 430, 410, 220, 220);
      ctx.restore();
    }
  }

  // store name
  ctx.fillStyle = "#221C18";
  ctx.textAlign = "center";
  ctx.font = "bold 84px system-ui, sans-serif";
  ctx.fillText(seller.store_name, 540, 760, 800);

  if (seller.bio) {
    ctx.fillStyle = "#8A7F75";
    ctx.font = "40px system-ui, sans-serif";
    ctx.fillText(seller.bio.slice(0, 50), 540, 830, 800);
  }

  // QR code
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, storeUrl, { width: 520, margin: 2 });
  ctx.drawImage(qrCanvas, 280, 900, 520, 520);

  // CTA
  ctx.fillStyle = theme.accent;
  ctx.font = "bold 52px system-ui, sans-serif";
  ctx.fillText("Scan to Shop on WhatsApp!", 540, 1500, 820);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText(storeUrl.replace(/^https?:\/\//, ""), 540, 1680, 900);

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${seller.slug ?? "store"}-story.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }
      resolve();
    }, "image/png");
  });
}
