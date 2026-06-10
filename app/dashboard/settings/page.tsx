import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/actions/seller";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata = { title: "Settings — Shopnest" };

export default async function SettingsPage() {
  const seller = await getCurrentSeller();
  if (!seller?.slug) redirect("/onboarding");

  return <SettingsForm seller={seller} />;
}
