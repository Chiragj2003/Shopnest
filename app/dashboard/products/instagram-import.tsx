"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Instagram, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductDraft } from "@/components/dashboard/product-form-dialog";

export function InstagramImport({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (draft: ProductDraft) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const importPost = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/instagram-import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      toast.success("Post imported — review the draft");
      onOpenChange(false);
      onImport({ imageUrls: json.images, name: json.caption?.slice(0, 60) ?? "", description: json.caption ?? "" });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Instagram className="h-5 w-5" /> Import from Instagram
          </DialogTitle>
          <DialogDescription>
            Paste a post URL — we&apos;ll pull the photo and caption into a product draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="ig-url">Post URL</Label>
          <Input
            id="ig-url"
            placeholder="https://www.instagram.com/p/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {failed && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              Instagram blocked the import (it happens often). No worries — add the
              product manually and upload the photos from your gallery instead.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  onOpenChange(false);
                  onImport({});
                }}
              >
                Add manually with photos
              </Button>
            </div>
          )}
        </div>

        <Button onClick={importPost} disabled={loading || !url.includes("instagram.com")} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import post
        </Button>
      </DialogContent>
    </Dialog>
  );
}
