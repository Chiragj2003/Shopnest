"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productSchema, type ProductValues } from "@/lib/validation";
import { addProduct, updateProduct } from "@/lib/actions/products";
import { uploadImage } from "@/lib/actions/seller";
import type { Product } from "@/lib/types";

export type ProductDraft = Partial<ProductValues>;

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  draft,
  onSaved,
  onLimit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null; // editing target, null = create
  draft?: ProductDraft; // prefill (e.g. Instagram import)
  onSaved: (p: Product, isNew: boolean) => void;
  onLimit: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      inStock: true,
      imageUrls: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: product?.name ?? draft?.name ?? "",
      description: product?.description ?? draft?.description ?? "",
      price: product?.price ?? draft?.price ?? 0,
      category: product?.category ?? draft?.category ?? "",
      inStock: product?.in_stock ?? true,
      imageUrls: product?.image_urls ?? draft?.imageUrls ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product, draft]);

  const images = form.watch("imageUrls");

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    if (images.length + list.length > 6) {
      toast.error("Up to 6 images per product");
      return;
    }
    setUploading(true);
    try {
      for (const file of list) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.9,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const fd = new FormData();
        fd.append("file", new File([compressed], file.name, { type: compressed.type }));
        const res = await uploadImage(fd);
        if (res.ok && res.data) {
          form.setValue("imageUrls", [...form.getValues("imageUrls"), res.data]);
        } else {
          toast.error(res.ok ? "Upload failed" : res.error);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const arr = [...images];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    form.setValue("imageUrls", arr);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    const res = product ? await updateProduct(product.id, values) : await addProduct(values);
    setSaving(false);
    if (res.ok && res.data) {
      toast.success(product ? "Product updated" : "Product added");
      onSaved(res.data, !product);
      onOpenChange(false);
    } else if (!res.ok && res.error === "FREE_LIMIT") {
      onOpenChange(false);
      onLimit();
    } else if (!res.ok) {
      toast.error(res.error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto scroll-thin sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {product ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* images */}
          <div>
            <Label>Photos</Label>
            <div
              className="mt-1.5 grid grid-cols-3 gap-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFiles(e.dataTransfer.files);
              }}
            >
              {images.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border">
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                  <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-black/45 group-hover:flex">
                    <button type="button" onClick={() => moveImage(i, -1)} className="rounded-md bg-white/90 p-1" aria-label="Move left">
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        form.setValue("imageUrls", images.filter((_, j) => j !== i))
                      }
                      className="rounded-md bg-white/90 p-1"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} className="rounded-md bg-white/90 p-1" aria-label="Move right">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      COVER
                    </span>
                  )}
                </div>
              ))}
              {images.length < 6 && (
                <label className="press flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Add / drop</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files && void handleFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Compressed automatically — first photo is the cover.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" placeholder="Chocolate Fudge Cake" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Price (₹)</Label>
              <Input id="p-price" type="number" step="0.01" min="0" inputMode="decimal" {...form.register("price", { valueAsNumber: true })} />
              {form.formState.errors.price && (
                <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-category">Category</Label>
              <Input id="p-category" placeholder="Cakes" {...form.register("category")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" rows={3} placeholder="Rich, moist, made to order…" {...form.register("description")} />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3">
            <span className="text-sm font-medium">In stock</span>
            <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" {...form.register("inStock")} />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
