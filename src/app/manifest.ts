import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tikkie Trip – EV Travel Planner",
    short_name: "Tikkie Trip",
    description: "วางแผนเที่ยวด้วยรถ EV ค้นหาสถานีชาร์จและสถานที่แวะตามเส้นทาง",
    start_url: "/",
    display: "standalone",
    background_color: "#f2fcf2",
    theme_color: "#f2fcf2",
    lang: "th",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
