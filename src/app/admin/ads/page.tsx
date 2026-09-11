import type { Metadata } from "next";
import { AdsAdmin } from "@/components/AdsAdmin";

export const metadata: Metadata = { title: "จัดการโฆษณา | Tikkie Trip", robots: { index: false, follow: false } };

export default function AdsAdminPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-4 sm:p-8">
      <AdsAdmin />
    </main>
  );
}
