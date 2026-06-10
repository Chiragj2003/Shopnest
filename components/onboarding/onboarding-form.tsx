"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { completeOnboarding } from "@/lib/actions/seller";
import { onboardingSchema, slugSchema, type OnboardingValues } from "@/lib/validation";
import { THEME_PRESETS } from "@/lib/themes";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const STEPS = ["Link", "Name", "WhatsApp", "UPI", "Theme"] as const;

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      slug: "",
      storeName: "",
      whatsapp: "",
      upiId: "",
      themePreset: THEME_PRESETS[0].preset,
    },
  });

  const slug = form.watch("slug");

  useEffect(() => {
    if (!slug) return setSlugStatus("idle");
    if (!slugSchema.safeParse(slug).success) return setSlugStatus("invalid");
    setSlugStatus("checking");
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.from("sellers").select("id").eq("slug", slug).maybeSingle();
      setSlugStatus(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(t);
  }, [slug]);

  const canNext = () => {
    if (step === 0) return slugStatus === "available";
    if (step === 1) return form.watch("storeName").trim().length >= 2;
    if (step === 2) return /^[6-9]\d{9}$/.test(form.watch("whatsapp"));
    return true; // UPI optional, theme has a default
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    const res = await completeOnboarding(values);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Your store is ready! 🎉");
      router.push("/dashboard");
    } else {
      toast.error(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="card-soft p-6 sm:p-8">
      {/* progress */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
            <p className={`mt-1.5 text-[10px] font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-2 animate-fade-up">
          <Label htmlFor="slug">Choose your store link</Label>
          <div className="flex items-center overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring">
            <span className="select-none pl-3 text-sm text-muted-foreground">shopnest.store/</span>
            <Input
              id="slug"
              autoFocus
              placeholder="mystore"
              className="border-0 pl-1 shadow-none focus-visible:ring-0"
              {...form.register("slug", {
                setValueAs: (v: string) => v.toLowerCase().trim(),
              })}
            />
            <span className="pr-3">
              {slugStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {slugStatus === "available" && <Check className="h-4 w-4 text-green-600" />}
              {(slugStatus === "taken" || slugStatus === "invalid") && <X className="h-4 w-4 text-destructive" />}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {slugStatus === "taken" && "Already taken — try another."}
            {slugStatus === "invalid" && slug && "3–30 chars, lowercase letters, numbers, hyphens."}
            {slugStatus === "available" && "Available ✓"}
            {(slugStatus === "idle" || !slug) && "This becomes your shareable store URL."}
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2 animate-fade-up">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" autoFocus placeholder="Ria's Bakes" {...form.register("storeName")} />
          <p className="text-xs text-muted-foreground">Shown at the top of your storefront.</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2 animate-fade-up">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <div className="flex items-center overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring">
            <span className="select-none pl-3 text-sm text-muted-foreground">+91</span>
            <Input
              id="whatsapp"
              autoFocus
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              className="border-0 pl-2 shadow-none focus-visible:ring-0"
              {...form.register("whatsapp", {
                setValueAs: (v: string) => v.replace(/\D/g, "").slice(0, 10),
              })}
            />
          </div>
          <p className="text-xs text-muted-foreground">Buyers&apos; orders arrive here as WhatsApp messages.</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2 animate-fade-up">
          <Label htmlFor="upiId">UPI ID <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="upiId" autoFocus placeholder="yourname@okhdfcbank" {...form.register("upiId")} />
          <p className="text-xs text-muted-foreground">
            Buyers see a scannable UPI QR for payment. You can add this later.
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 animate-fade-up">
          <Label>Pick a look</Label>
          <div className="grid grid-cols-1 gap-2">
            {THEME_PRESETS.map((t) => {
              const selected = form.watch("themePreset") === t.preset;
              return (
                <button
                  key={t.preset}
                  type="button"
                  onClick={() => form.setValue("themePreset", t.preset)}
                  className={`press flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected ? "border-primary ring-2 ring-primary/30" : "hover:border-foreground/20"
                  }`}
                >
                  <span
                    className="h-10 w-10 shrink-0 rounded-lg border"
                    style={{ background: t.background === "gradient" ? t.bgGradient : t.bg }}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{t.preset}</span>
                  </span>
                  <span className="h-5 w-5 rounded-full border" style={{ background: t.accent }} />
                  {selected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={step === 0 ? "invisible" : ""}
          onClick={() => setStep((s) => s - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Launch my store
          </Button>
        )}
      </div>
    </form>
  );
}
