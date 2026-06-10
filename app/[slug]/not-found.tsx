import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StoreNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl">🏪</p>
      <h1 className="text-3xl font-bold">This store doesn&apos;t exist… yet</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The link may be wrong, or this name is still up for grabs. Want it for your own shop?
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Claim this store name</Link>
      </Button>
    </main>
  );
}
