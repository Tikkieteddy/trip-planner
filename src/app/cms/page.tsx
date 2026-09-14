import type { Metadata } from "next";
import { AdsAdmin } from "@/components/AdsAdmin";
import { isAdStorageConfigured } from "@/lib/ads";
import { getAdminSetupStatus } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CMS | Tikkie Trip",
  robots: { index: false, follow: false },
};

export default function CmsPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-4 sm:p-8">
      <AdsAdmin setup={{ ...getAdminSetupStatus(), storageConfigured: isAdStorageConfigured() }} />
    </main>
  );
}
