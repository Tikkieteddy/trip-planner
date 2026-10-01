import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { CreditFooter } from "@/components/CreditFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tikkie Trip – EV Travel Planner",
  description: "วางแผนเที่ยวด้วยรถ EV ค้นหาสถานีชาร์จและสถานที่แวะตามเส้นทาง",
  applicationName: "Tikkie Trip – EV Travel Planner",
  metadataBase: new URL("https://trip-ev-plan.vercel.app"),
  openGraph: {
    title: "Tikkie Trip – EV Travel Planner",
    description: "วางแผนเที่ยวด้วยรถ EV ค้นหาสถานีชาร์จและสถานที่แวะตามเส้นทาง",
    url: "https://trip-ev-plan.vercel.app",
    siteName: "Tikkie Trip",
    locale: "th_TH",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f2fcf2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <ClerkProvider dynamic>
          <div className="flex min-h-dvh flex-col">
            <div className="flex-1">{children}</div>
            <CreditFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
