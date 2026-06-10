"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Download, Loader2, Store, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { setLogo, updateSettings, uploadImage } from "@/lib/actions/seller";
import { settingsSchema, type SettingsValues } from "@/lib/validation";
import { fillTemplate } from "@/lib/whatsapp";
import { downloadShareCard } from "@/lib/share-kit";
import type { Seller } from "@/lib/types";

export function SettingsForm({ seller }: { seller: Seller }) {
  const [saving, setSaving] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [logoUrl, setLogoUrl] = useState(seller.logo_url);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      slug: seller.slug ?? "",
      storeName: seller.store_name,
      bio: seller.bio ?? "",
      whatsapp: seller.whatsapp_number.replace(/^91/, ""),
      upiId: seller.upi_id ?? "",
      waTemplate: seller.wa_template,
    },
  });

  const template = form.watch("waTemplate");
  const storeName = form.watch("storeName");

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    const res = await updateSettings(values);
    setSaving(false);
    if (res.ok) toast.success("Settings saved");
    else toast.error(res.error);
  });

  const uploadLogo = async (file: File) => {
    setLogoBusy(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });
      const fd = new FormData();
      fd.append("file", new File([compressed], file.name, { type: compressed.type }));
      const res = await uploadImage(fd);
      if (res.ok && res.data) {
        const set = await setLogo(res.data);
        if (set.ok) {
          setLogoUrl(res.data);
          toast.success("Logo updated");
        } else toast.error(set.error);
      } else toast.error(res.ok ? "Upload failed" : res.error);
    } finally {
      setLogoBusy(false);
    }
  };

  const err = form.formState.errors;

  return (
    <div className="mx-auto max-w-2xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Store identity, contact, and order message.</p>
      </div>

      {/* logo */}
      <div className="card-soft flex items-center gap-4 p-5">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border bg-muted">
          {logoUrl ? (
            <Image src={logoUrl} alt="Logo" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/40">
              <Store className="h-6 w-6" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">Store logo</p>
          <p className="text-xs text-muted-foreground">Shown on your storefront and share card.</p>
          <label className="press mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary">
            {logoBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={logoBusy}
              onChange={(e) => e.target.files?.[0] && void uploadLogo(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card-soft space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Store name</Label>
            <Input id="s-name" {...form.register("storeName")} />
            {err.storeName && <p className="text-xs text-destructive">{err.storeName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-slug">Store link</Label>
            <div className="flex items-center overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring">
              <span className="select-none pl-3 text-xs text-muted-foreground">/</span>
              <Input id="s-slug" className="border-0 pl-1 shadow-none focus-visible:ring-0" {...form.register("slug")} />
            </div>
            {err.slug && <p className="text-xs text-destructive">{err.slug.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-wa">WhatsApp number</Label>
            <div className="flex items-center overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring">
              <span className="select-none pl-3 text-xs text-muted-foreground">+91</span>
              <Input
                id="s-wa"
                inputMode="numeric"
                maxLength={10}
                className="border-0 pl-2 shadow-none focus-visible:ring-0"
                {...form.register("whatsapp", {
                  setValueAs: (v: string) => v.replace(/\D/g, "").slice(0, 10),
                })}
              />
            </div>
            {err.whatsapp && <p className="text-xs text-destructive">{err.whatsapp.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-upi">UPI ID</Label>
            <Input id="s-upi" placeholder="yourname@okhdfcbank" {...form.register("upiId")} />
            {err.upiId && <p className="text-xs text-destructive">{err.upiId.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="s-bio">Bio</Label>
          <Textarea id="s-bio" rows={2} placeholder="Home-baked happiness, delivered." {...form.register("bio")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="s-template">WhatsApp order message</Label>
          <Textarea id="s-template" rows={2} {...form.register("waTemplate")} />
          {err.waTemplate && <p className="text-xs text-destructive">{err.waTemplate.message}</p>}
          <p className="text-xs text-muted-foreground">
            Tokens: <code className="rounded bg-muted px-1">{"{product}"}</code>{" "}
            <code className="rounded bg-muted px-1">{"{price}"}</code>{" "}
            <code className="rounded bg-muted px-1">{"{store}"}</code>
          </p>
          <div className="rounded-xl bg-[#e7ffdb] p-3 text-xs text-neutral-800 shadow-inner">
            <p className="mb-1 font-bold text-green-700">Preview</p>
            {fillTemplate(template || "", {
              product: "Chocolate Fudge Cake",
              price: "499",
              store: storeName || "your store",
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save settings
          </Button>
        </div>
      </form>

      {/* share kit */}
      <div className="card-soft flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-semibold">Share kit</p>
          <p className="text-xs text-muted-foreground">
            A 1080×1920 Instagram-story card with your QR — post it and let buyers scan to shop.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={shareBusy}
          onClick={async () => {
            setShareBusy(true);
            try {
              await downloadShareCard(seller, `${window.location.origin}/${seller.slug}`);
              toast.success("Story card downloaded");
            } finally {
              setShareBusy(false);
            }
          }}
        >
          {shareBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download story card
        </Button>
      </div>
    </div>
  );
}
