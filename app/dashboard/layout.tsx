import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/actions/seller";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const metadata = { title: "Dashboard — Shopnest" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seller = await getCurrentSeller();
  if (!seller?.slug) redirect("/onboarding");

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[240px_1fr]">
      <DashboardSidebar
        storeName={seller.store_name}
        slug={seller.slug}
        isPremium={seller.is_premium}
      />
      <main className="min-w-0 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
    </div>
  );
}
