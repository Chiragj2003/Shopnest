"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Copy, X } from "lucide-react";
import type { Seller } from "@/lib/types";
import type { Labels } from "@/lib/i18n";

export function UpiModal({
  seller,
  amount,
  labels,
  onClose,
}: {
  seller: Seller;
  amount?: number;
  labels: Labels;
  onClose: () => void;
}) {
  const [qr, setQr] = useState<string | null>(null);

  const upiUri = `upi://pay?pa=${encodeURIComponent(seller.upi_id ?? "")}&pn=${encodeURIComponent(
    seller.store_name
  )}${amount && amount > 0 ? `&am=${amount.toFixed(2)}&cu=INR` : ""}`;

  useEffect(() => {
    QRCode.toDataURL(upiUri, { width: 480, margin: 2 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [upiUri]);

  const copyUpi = async () => {
    await navigator.clipboard.writeText(seller.upi_id ?? "");
    toast.success(labels.copied);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-fade-up rounded-t-3xl bg-white p-6 text-neutral-900 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{labels.payUpi}</h3>
          <button onClick={onClose} aria-label={labels.close} className="rounded-full p-1.5 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          {qr ? (
            // QR data URL — plain img is intentional here
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="UPI QR code" className="h-56 w-56 rounded-2xl border" />
          ) : (
            <div className="skeleton h-56 w-56" />
          )}
          {amount != null && amount > 0 && (
            <p className="mt-3 text-2xl font-bold">₹{amount.toFixed(2)}</p>
          )}
          <p className="mt-1 text-center text-xs text-neutral-500">{labels.scanToPay}</p>

          <button
            onClick={copyUpi}
            className="press mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
          >
            <Copy className="h-4 w-4" /> {seller.upi_id}
          </button>
        </div>
      </div>
    </div>
  );
}
