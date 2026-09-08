import { TripPlanner } from "@/components/TripPlanner";

export default function HomePage() {
  return (
    <TripPlanner
      browserKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? ""}
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? ""}
    />
  );
}
