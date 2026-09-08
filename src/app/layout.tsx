import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tikkie Trip – EV Travel Planner",
  description: "วางแผนเที่ยวด้วยรถ EV ค้นหาสถานีชาร์จและสถานที่แวะตามเส้นทาง",
  applicationName: "Tikkie Trip – EV Travel Planner",
  metadataBase: new URL("https://tikkiecenter-trip.vercel.app"),
  openGraph: {
    title: "Tikkie Trip – EV Travel Planner",
    description: "วางแผนเที่ยวด้วยรถ EV ค้นหาสถานีชาร์จและสถานที่แวะตามเส้นทาง",
    url: "https://tikkiecenter-trip.vercel.app",
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
  themeColor: "#1700C7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
