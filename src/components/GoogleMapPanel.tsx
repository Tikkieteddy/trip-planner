"use client";

import { AlertTriangle, ExternalLink, LocateFixed, MapPinned, Navigation, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadGoogleMaps, toGoogleLatLng } from "@/lib/maps";
import { decodePolyline } from "@/lib/polyline";
import type { PlannerPlace } from "@/types/trip";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";

type GoogleMapPanelProps = {
  browserKey: string;
  mapId?: string;
  className?: string;
  mapClassName?: string;
  origin: PlannerPlace | null;
  destination: PlannerPlace | null;
  waypoints: PlannerPlace[];
  chargers: PlannerPlace[];
  nearbyPlaces: PlannerPlace[];
  tourismCenter: PlannerPlace | null;
  tourismRadiusKm: number;
  routePolyline?: string;
  onMapCenterSelected: (place: PlannerPlace) => void;
  onAddWaypoint: (place: PlannerPlace) => void;
  onSetOrigin: (place: PlannerPlace) => void;
  onSetDestination: (place: PlannerPlace) => void;
  onSearchNearby: (place: PlannerPlace) => void;
};

type MarkerConfig = {
  place: PlannerPlace;
  label: string;
  color: string;
  canAdd: boolean;
};

const defaultCenter = { lat: 13.7563, lng: 100.5018 };

function mapsUrlForPlace(place: PlannerPlace) {
  if (place.googleMapsUri) {
    return place.googleMapsUri;
  }

  return `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markerInfoHtml(place: PlannerPlace, label: string, buttonId: string) {
  const mapsUrl = mapsUrlForPlace(place);

  return `
    <div class="google-map-info">
      <strong>${escapeHtml(label)}: ${escapeHtml(place.name)}</strong>
      <div style="margin-top:4px;font-size:12px;line-height:1.5">${escapeHtml(place.address ?? "ไม่มีที่อยู่จาก Google")}</div>
      <a href="${mapsUrl}" target="_blank" rel="noreferrer">เปิดใน Google Maps</a>
      <button type="button" id="${buttonId}">เพิ่มเป็นจุดแวะ</button>
    </div>
  `;
}

function mapClickPlace(latitude: number, longitude: number): PlannerPlace {
  return {
    id: `map-click-${latitude.toFixed(5)}-${longitude.toFixed(5)}`,
    name: "ตำแหน่งที่เลือกจากแผนที่",
    address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    location: { latitude, longitude },
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    source: "map_click",
    stopMinutes: 30,
  };
}

export function GoogleMapPanel({
  browserKey,
  mapId,
  className = "",
  mapClassName = "h-[540px] min-h-[420px]",
  origin,
  destination,
  waypoints,
  chargers,
  nearbyPlaces,
  tourismCenter,
  tourismRadiusKm,
  routePolyline,
  onMapCenterSelected,
  onAddWaypoint,
  onSetOrigin,
  onSetDestination,
  onSearchNearby,
}: GoogleMapPanelProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const infoWindowRef = useRef<GoogleInfoWindow | null>(null);
  const overlaysRef = useRef<GoogleMapOverlay[]>([]);
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(false);
  const [mapSearchPlace, setMapSearchPlace] = useState<PlannerPlace | null>(null);

  const markerConfigs = useMemo(() => {
    const configs: MarkerConfig[] = [];

    if (origin) {
      configs.push({ place: origin, label: "ต้นทาง", color: "#16803c", canAdd: false });
    }

    waypoints.forEach((place, index) => {
      configs.push({ place, label: `จุดแวะ ${index + 1}`, color: "#b77900", canAdd: false });
    });

    if (destination) {
      configs.push({ place: destination, label: "ปลายทาง", color: "#c52828", canAdd: false });
    }

    chargers.forEach((place) => {
      configs.push({ place, label: "สถานีชาร์จ", color: "#006dff", canAdd: true });
    });

    nearbyPlaces.forEach((place) => {
      configs.push({ place, label: "สถานที่ใกล้เคียง", color: "#7c3aed", canAdd: true });
    });

    if (tourismCenter) {
      configs.push({ place: tourismCenter, label: "ศูนย์กลางค้นหา", color: "#0f766e", canAdd: false });
    }

    return configs;
  }, [chargers, destination, nearbyPlaces, origin, tourismCenter, waypoints]);

  useEffect(() => {
    if (!browserKey) {
      setReady(false);
      return;
    }

    let cancelled = false;

    loadGoogleMaps(browserKey, mapId)
      .then(() => {
        if (cancelled || !mapElementRef.current || !window.google?.maps) {
          return;
        }

        if (!mapRef.current) {
          mapRef.current = new window.google.maps.Map(mapElementRef.current, {
            center: defaultCenter,
            zoom: 6,
            mapId: mapId || undefined,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
          infoWindowRef.current = new window.google.maps.InfoWindow();
          window.google.maps.event.addListener(mapRef.current, "click", (event?: GoogleMapClickEvent) => {
            const latLng = event?.latLng;

            if (!latLng) {
              return;
            }

            const place = mapClickPlace(latLng.lat(), latLng.lng());
            setMapSearchPlace(place);
            onMapCenterSelected(place);
          });
        }

        setReady(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "โหลด Google Maps ไม่สำเร็จ");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [browserKey, mapId, onMapCenterSelected]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) {
      return;
    }

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    let hasBounds = false;

    if (routePolyline) {
      const path = decodePolyline(routePolyline).map(toGoogleLatLng);
      const polyline = new window.google.maps.Polyline({
        path,
        strokeColor: "#1700c7",
        strokeOpacity: 0.92,
        strokeWeight: 5,
        map: mapRef.current,
      });
      overlaysRef.current.push(polyline);
      path.forEach((point) => {
        bounds.extend(point);
        hasBounds = true;
      });
    }

    markerConfigs.forEach(({ place, label, color, canAdd }) => {
      const marker = new window.google!.maps.Marker({
        position: toGoogleLatLng(place.location),
        map: mapRef.current,
        title: place.name,
        icon: {
          path: window.google!.maps.SymbolPath.CIRCLE,
          scale: label === "ศูนย์กลางค้นหา" ? 9 : 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      overlaysRef.current.push(marker);
      bounds.extend(toGoogleLatLng(place.location));
      hasBounds = true;

      window.google!.maps.event.addListener(marker, "click", () => {
        const buttonId = `add-${place.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
        infoWindowRef.current?.setContent(markerInfoHtml(place, label, buttonId));
        infoWindowRef.current?.open({ map: mapRef.current!, anchor: marker });

        window.setTimeout(() => {
          const button = document.getElementById(buttonId);
          button?.toggleAttribute("disabled", !canAdd);
          button?.addEventListener("click", () => onAddWaypoint(place), { once: true });
        }, 0);
      });
    });

    if (tourismCenter) {
      const circle = new window.google.maps.Circle({
        center: toGoogleLatLng(tourismCenter.location),
        radius: tourismRadiusKm * 1000,
        fillColor: "#00a5ff",
        fillOpacity: 0.08,
        strokeColor: "#00a5ff",
        strokeOpacity: 0.7,
        strokeWeight: 2,
        map: mapRef.current,
      });
      overlaysRef.current.push(circle);
    }

    if (hasBounds) {
      mapRef.current.fitBounds(bounds);
    }
  }, [markerConfigs, onAddWaypoint, ready, routePolyline, tourismCenter, tourismRadiusKm]);

  if (!browserKey) {
    return (
      <section className={`flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-dashed border-cyan/50 bg-white p-6 text-center shadow-sm ${className}`}>
        <AlertTriangle className="size-10 text-warning" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-black text-primary-deep">ยังไม่ได้ตั้งค่า Browser API Key</h2>
        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-muted">
          ตั้งค่า `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` เพื่อแสดง Google Map จริง ระบบจะไม่แสดงพิกัดหรือข้อมูลจำลองแทน Google Maps
        </p>
      </section>
    );
  }

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-black text-primary-deep">แผนที่และเส้นทาง</p>
          <p className="text-xs font-semibold text-muted">คลิกบนแผนที่เพื่อเลือกศูนย์กลางค้นหาพื้นที่ท่องเที่ยว</p>
        </div>
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-primary hover:border-cyan"
        >
          Google Maps
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
      {loadError ? (
        <div className="flex min-h-[460px] flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="size-10 text-danger" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-danger">{loadError}</p>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          <div ref={mapElementRef} className={`${mapClassName} w-full bg-primary-soft`} />
          <div className="absolute left-3 right-3 top-3 z-10 max-w-2xl sm:left-4 sm:right-auto sm:w-[min(560px,calc(100%-2rem))]">
            <div className="rounded-lg border border-border bg-white/95 p-3 shadow-[0_18px_55px_rgba(13,18,56,0.22)] backdrop-blur">
              <PlaceSearchInput
                label="ค้นหาบนแผนที่"
                placeholder="พิมพ์ชื่อสถานที่ เช่น บ้าน ร้านอาหาร สถานีชาร์จ"
                value={mapSearchPlace}
                center={origin?.location ?? tourismCenter?.location}
                onSelect={(place) => {
                  setMapSearchPlace(place);
                  onMapCenterSelected(place);
                }}
                onClear={() => setMapSearchPlace(null)}
              />
              {mapSearchPlace ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSetOrigin(mapSearchPlace)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-success px-3 text-xs font-black text-white"
                  >
                    <LocateFixed className="size-4" aria-hidden="true" />
                    ตั้งต้นทาง
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetDestination(mapSearchPlace)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-danger px-3 text-xs font-black text-white"
                  >
                    <MapPinned className="size-4" aria-hidden="true" />
                    ตั้งปลายทาง
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddWaypoint(mapSearchPlace)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-warning px-3 text-xs font-black text-white"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    เพิ่มจุดแวะ
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchNearby(mapSearchPlace)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-black text-yellow"
                  >
                    <Navigation className="size-4" aria-hidden="true" />
                    ค้นหารอบจุดนี้
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs font-semibold leading-5 text-muted">ค้นหาสถานที่แล้วเลือกผลลัพธ์ก่อน จากนั้นเลือกว่าจะตั้งเป็นจุดใดหรือค้นหารอบจุดนั้น</p>
              )}
            </div>
          </div>
          {!ready ? (
            <div className="absolute inset-0 grid place-items-center bg-white/80">
              <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-black text-primary-deep shadow-sm">
                กำลังโหลด Google Map
              </div>
            </div>
          ) : null}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 rounded-lg border border-white/60 bg-white/95 p-2 text-xs font-bold text-primary-deep shadow-lg backdrop-blur">
            <span className="inline-flex items-center gap-1"><LocateFixed className="size-3 text-success" /> ต้นทาง</span>
            <span className="inline-flex items-center gap-1"><MapPinned className="size-3 text-danger" /> ปลายทาง</span>
            <span className="inline-flex items-center gap-1"><MapPinned className="size-3 text-warning" /> จุดแวะ</span>
            <span className="inline-flex items-center gap-1"><MapPinned className="size-3 text-cyan-deep" /> สถานีชาร์จ</span>
            <span className="inline-flex items-center gap-1"><MapPinned className="size-3 text-violet-700" /> สถานที่ใกล้เคียง</span>
          </div>
        </div>
      )}
    </section>
  );
}
