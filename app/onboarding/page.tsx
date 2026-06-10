import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/actions/seller";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata = { title: "Set up your store — Shopnest" };

export default async function OnboardingPage() {
  const seller = await getCurrentSeller();
  if (seller?.slug) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold">
            shop<span className="text-primary">nest</span>
          </p>
          <h1 className="mt-3 text-3xl font-bold">Set up your store</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Five quick steps and your WhatsApp storefront is live.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
