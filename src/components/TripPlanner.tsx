"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BatteryCharging,
  CalendarClock,
  Car,
  Download,
  Eraser,
  ExternalLink,
  FileJson,
  Info,
  LoaderCircle,
  MapPinned,
  Navigation,
  Plus,
  RotateCcw,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { connectorLabel, connectorOptions, nearbyActivityTypes, tourismCategories } from "@/data/place-types";
import { estimateBatteryByLegs, batterySummaryText } from "@/lib/battery";
import { postJson } from "@/lib/client-api";
import { formatDistance, formatDuration, formatKwh, formatPercent, getDepartureIso } from "@/lib/format";
import { decodePolyline, splitEncodedPolyline } from "@/lib/polyline";
import { savedTripSchema } from "@/lib/schemas";
import type { BatteryLegEstimate, LatLng, PlannerPlace, RouteResult, SavedTrip, TourismCategory, TripSettings } from "@/types/trip";
import { GoogleMapPanel } from "@/components/GoogleMapPanel";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { AdSlot } from "@/components/AdSlot";

type TripPlannerProps = {
  browserKey: string;
  mapId?: string;
};

type RouteResponse = {
  route: RouteResult;
};

type PlacesResponse = {
  places: PlannerPlace[];
};

type PlannerSetupKey = "trip" | "vehicle" | "filters";
type PlannerMenuKey = "route" | "itinerary" | "chargers" | "nearby" | "vehicle";
type ChargerSortKey = "route" | "speed" | "rating" | "origin-near" | "origin-far";

const chargerApps = [
  { pattern: /ev\s*station\s*plu[zส]|อีวี\s*สเตชั่น\s*พลัส/i, name: "EV Station PluZ", url: "https://evstationpluz.pttor.com/th/home" },
  { pattern: /pea\s*volta|พีอีเอ\s*โวลต้า/i, name: "PEA VOLTA", url: "https://peavoltaev.pea.co.th/วิธีใช้งาน-pea-volta/" },
  { pattern: /evolt|อีโวลท์/i, name: "EVolt", url: "https://applinks.evolt.co.th/" },
  { pattern: /ea\s*anywhere|อีเอ\s*เอนี่แวร์/i, name: "EA Anywhere", url: "https://www.eaanywhere.com/help/new/howtoregister" },
  { pattern: /reversharger|\bsharge\b/i, name: "ReverSharger", url: "https://sharge.co.th/mobile-app" },
];
type RecommendationBadge = {
  label: string;
  value: string;
};

const storageKey = "tikkie-trip-v1";
const routeChargerPolylineLimit = 18000;
const routeChargerMaxSegments = 10;
const earthRadiusMeters = 6371000;

const defaultSettings: TripSettings = {
  profileName: "BYD Dolphin Extended Range",
  travelDate: new Date().toISOString().slice(0, 10),
  departureTime: "08:00",
  tripType: "one-way",
  days: 2,
  batteryStartPercent: 90,
  reservePercent: 18,
  batteryCapacityKwh: 60.48,
  efficiencyKmPerKwh: 7.8,
  maxRangeKm: 470,
  minChargerKw: 50,
  connectorType: "EV_CONNECTOR_TYPE_CCS_COMBO_2",
  maxStops: 6,
  tourismRadiusKm: 10,
  avoidTolls: false,
  avoidHighways: false,
  avoidFerries: false,
  optimizeWaypointOrder: true,
  openNowOnly: false,
  minRating: 0,
};

function samePlace(a: PlannerPlace, b: PlannerPlace) {
  const sameId = Boolean((a.placeId && b.placeId && a.placeId === b.placeId) || a.id === b.id);
  const sameName = a.name.trim().toLocaleLowerCase("th-TH") === b.name.trim().toLocaleLowerCase("th-TH");
  const closeLatitude = Math.abs(a.location.latitude - b.location.latitude) < 0.0005;
  const closeLongitude = Math.abs(a.location.longitude - b.location.longitude) < 0.0005;

  return sameId || (sameName && closeLatitude && closeLongitude);
}

function uniquePlaces(places: PlannerPlace[]) {
  return places.filter((place, index) => places.findIndex((candidate) => samePlace(candidate, place)) === index);
}

function mapsSearchUrl(place: PlannerPlace) {
  return place.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`;
}

function buildDirectionsUrl(origin: PlannerPlace | null, destination: PlannerPlace | null, waypoints: PlannerPlace[], settings: TripSettings) {
  if (!origin || !destination) {
    return "https://www.google.com/maps";
  }

  const isRoundTrip = settings.tripType === "round-trip";
  const terminalDestination = isRoundTrip ? origin : destination;
  const routeWaypoints = isRoundTrip ? [...waypoints, destination] : waypoints;
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.location.latitude},${origin.location.longitude}`,
    destination: `${terminalDestination.location.latitude},${terminalDestination.location.longitude}`,
    travelmode: "driving",
  });

  if (routeWaypoints.length > 0) {
    params.set("waypoints", routeWaypoints.map((place) => `${place.location.latitude},${place.location.longitude}`).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function getRiskClass(risk: BatteryLegEstimate["risk"]) {
  if (risk === "ปลอดภัย") {
    return "border-success/25 bg-green-50 text-success";
  }

  if (risk === "ควรวางแผนชาร์จ") {
    return "border-warning/25 bg-yellow-50 text-warning";
  }

  return "border-danger/25 bg-red-50 text-danger";
}

function getMaxChargeRateKw(place: PlannerPlace) {
  return Math.max(0, ...(place.evChargeOptions?.connectorAggregation?.map((item) => item.maxChargeRateKw ?? 0) ?? [0]));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(from: LatLng, to: LatLng) {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const halfChord =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord));
}

function sampleRoutePoints(points: LatLng[], maxPoints = 800) {
  if (points.length <= maxPoints) {
    return points;
  }

  const step = Math.ceil(points.length / maxPoints);

  return points.filter((_, index) => index % step === 0 || index === points.length - 1);
}

function getDistanceToRouteMeters(place: PlannerPlace, routePoints: LatLng[]) {
  if (routePoints.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return routePoints.reduce((nearest, point) => Math.min(nearest, getDistanceMeters(place.location, point)), Number.POSITIVE_INFINITY);
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-primary-deep">{label}</span>
      <span className="mt-1 flex items-center overflow-hidden rounded-lg border border-border bg-white shadow-sm focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-h-10 w-full border-0 bg-transparent px-3 text-sm font-bold text-foreground outline-none"
        />
        {unit ? <span className="shrink-0 border-l border-border px-3 text-xs font-black text-muted">{unit}</span> : null}
      </span>
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 text-sm font-bold text-primary-deep">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
}

function PlaceListCard({
  place,
  actionLabel,
  onAction,
  onNearby,
  metricLabel,
  metricValue,
  recommendationBadges,
}: {
  place: PlannerPlace;
  actionLabel: string;
  onAction: () => void;
  onNearby?: () => void;
  metricLabel?: string;
  metricValue?: string;
  recommendationBadges?: RecommendationBadge[];
}) {
  const connectorInfo = place.evChargeOptions?.connectorAggregation?.[0];
  const provider = recommendationBadges ? chargerApps.find((app) => app.pattern.test(place.name)) : undefined;

  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black leading-5 text-primary-deep">{place.name}</p>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-muted">{place.address ?? "ไม่มีที่อยู่จาก Google"}</p>
        </div>
        <span className="shrink-0 rounded-md bg-primary-soft px-2 py-1 text-xs font-black text-primary">
          {place.rating ? `${place.rating.toFixed(1)} ★` : "ไม่มีคะแนน"}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-xs font-semibold text-muted sm:grid-cols-2">
        {metricLabel && metricValue ? (
          <div>
            <dt className="font-black text-primary-deep">{metricLabel}</dt>
            <dd>{metricValue}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-black text-primary-deep">สถานะ</dt>
          <dd>{place.openNow === null || place.openNow === undefined ? "ไม่มีข้อมูลจากผู้ให้บริการ" : place.openNow ? "เปิดอยู่" : "ปิดอยู่"}</dd>
        </div>
        <div>
          <dt className="font-black text-primary-deep">จำนวนรีวิว</dt>
          <dd>{place.userRatingCount?.toLocaleString("th-TH") ?? "ไม่มีข้อมูลจากผู้ให้บริการ"}</dd>
        </div>
        <div>
          <dt className="font-black text-primary-deep">หัวชาร์จ</dt>
          <dd>{connectorLabel(connectorInfo?.type)}</dd>
        </div>
        <div>
          <dt className="font-black text-primary-deep">กำลังสูงสุด</dt>
          <dd>{connectorInfo?.maxChargeRateKw ? `${connectorInfo.maxChargeRateKw} kW` : "ไม่มีข้อมูลจากผู้ให้บริการ"}</dd>
        </div>
      </dl>
      {recommendationBadges?.length ? (
        <div className="mt-3 rounded-lg border border-yellow/60 bg-yellow/20 p-2">
          <p className="px-1 pb-2 text-xs font-black text-primary-deep">เหตุผลแนะนำ</p>
          <div className="grid grid-cols-3 gap-2">
            {recommendationBadges.map((badge) => (
              <div key={badge.label} className="min-w-0 rounded-md border border-yellow/70 bg-white px-2 py-2 text-center shadow-sm">
                <p className="truncate text-[10px] font-black text-muted">{badge.label}</p>
                <p className="mt-1 break-words text-[11px] font-black leading-4 text-primary-deep">{badge.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {provider ? (
          <a href={provider.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-yellow bg-yellow px-3 text-xs font-black text-black">
            แอป {provider.name}
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-black text-yellow shadow-sm hover:bg-primary-deep"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {actionLabel}
        </button>
        {onNearby ? (
          <button
            type="button"
            onClick={onNearby}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-primary hover:border-cyan"
          >
            <Search className="size-3.5" aria-hidden="true" />
            ใกล้จุดนี้
          </button>
        ) : null}
        <a
          href={mapsSearchUrl(place)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-primary hover:border-cyan"
        >
          เปิดแผนที่
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function TripPlanner({ browserKey, mapId }: TripPlannerProps) {
  const [settings, setSettings] = useState<TripSettings>(defaultSettings);
  const [origin, setOrigin] = useState<PlannerPlace | null>(null);
  const [destination, setDestination] = useState<PlannerPlace | null>(null);
  const [waypoints, setWaypoints] = useState<PlannerPlace[]>([]);
  const [routeStops, setRouteStops] = useState<PlannerPlace[]>([]);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [chargers, setChargers] = useState<PlannerPlace[]>([]);
  const [chargerNotice, setChargerNotice] = useState("");
  const [chargerSort, setChargerSort] = useState<ChargerSortKey>("route");
  const [nearbyPlaces, setNearbyPlaces] = useState<PlannerPlace[]>([]);
  const [tourismCenter, setTourismCenter] = useState<PlannerPlace | null>(null);
  const [tourismCategory, setTourismCategory] = useState<TourismCategory>(tourismCategories[0]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [activeSetupPanel, setActiveSetupPanel] = useState<PlannerSetupKey>("trip");
  const [activePanel, setActivePanel] = useState<PlannerMenuKey>("route");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const setupScrollRef = useRef<HTMLDivElement | null>(null);
  const resultsScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    resultsScrollRef.current?.scrollTo({ top: 0 });
  }, [activePanel]);

  useEffect(() => {
    setupScrollRef.current?.scrollTo({ top: 0 });
  }, [activeSetupPanel]);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    const parsed = savedTripSchema.safeParse(JSON.parse(raw) as unknown);

    if (parsed.success) {
      setSettings(parsed.data.settings as TripSettings);
      setOrigin(parsed.data.origin as PlannerPlace | null);
      setDestination(parsed.data.destination as PlannerPlace | null);
      setWaypoints(parsed.data.waypoints as PlannerPlace[]);
      setTourismCenter(parsed.data.tourismCenter as PlannerPlace | null);
      setStatus("โหลดทริปที่บันทึกไว้ในเครื่องแล้ว");
    }
  }, []);

  const routeWaypoints = useMemo(() => {
    if (settings.tripType === "round-trip" && destination) {
      return [...waypoints, destination];
    }

    return waypoints;
  }, [destination, settings.tripType, waypoints]);

  const terminalDestination = settings.tripType === "round-trip" ? origin : destination;

  const estimates = useMemo(
    () =>
      route
        ? estimateBatteryByLegs({
            legs: route.legs,
            stops: routeStops.length > 0 ? routeStops : [origin, ...routeWaypoints, terminalDestination].filter(
              (place): place is PlannerPlace => Boolean(place),
            ),
            settings,
          })
        : [],
    [origin, route, routeStops, routeWaypoints, settings, terminalDestination],
  );

  const itineraryStops = useMemo(
    () =>
      routeStops.length > 0
        ? routeStops
        : [origin, ...routeWaypoints, terminalDestination].filter((place): place is PlannerPlace => Boolean(place)),
    [origin, routeStops, routeWaypoints, terminalDestination],
  );

  const routeInputError = useMemo(() => {
    if (origin && destination && samePlace(origin, destination)) {
      return "ต้นทางและปลายทางเป็นที่เดียวกัน กรุณาเลือกปลายทางใหม่";
    }

    return "";
  }, [destination, origin]);
  const routeActionDisabled = routeLoading || Boolean(routeInputError);
  const directionsUrl = buildDirectionsUrl(origin, destination, waypoints, settings);
  const setupMenuItems = [
    { key: "trip" as const, label: "ทริป", icon: Car },
    { key: "vehicle" as const, label: "รถ", icon: Zap },
    { key: "filters" as const, label: "ตัวกรอง", icon: Search },
  ];
  const panelMenuItems = [
    { key: "route" as const, label: "วางแผน", icon: Navigation, count: waypoints.length },
    { key: "itinerary" as const, label: "รายการเดินทาง", icon: CalendarClock, count: routeStops.length },
    { key: "chargers" as const, label: "จุดชาร์จ", icon: BatteryCharging, count: chargers.length },
    { key: "nearby" as const, label: "ที่แวะใกล้เคียง", icon: MapPinned, count: nearbyPlaces.length },
    { key: "vehicle" as const, label: "รถ/บันทึก", icon: Car, count: null },
  ];
  const activePanelItem = panelMenuItems.find((item) => item.key === activePanel) ?? panelMenuItems[0];
  const ActivePanelIcon = activePanelItem.icon;
  const chargerSortItems = [
    { key: "origin-near" as const, label: "ใกล้ต้นทางสุด", icon: ArrowUp },
    { key: "origin-far" as const, label: "ไกลต้นทางสุด", icon: ArrowDown },
    { key: "route" as const, label: "ใกล้เส้นทาง", icon: MapPinned },
    { key: "speed" as const, label: "ชาร์จเร็ว", icon: Zap },
    { key: "rating" as const, label: "คะแนนสูง", icon: Star },
  ];
  const routeSamplePoints = useMemo(() => (route?.encodedPolyline ? sampleRoutePoints(decodePolyline(route.encodedPolyline)) : []), [route?.encodedPolyline]);
  const sortedChargers = useMemo(() => {
    return [...chargers].sort((first, second) => {
      if (chargerSort === "origin-near" || chargerSort === "origin-far") {
        if (!origin) return 0;
        const difference = getDistanceMeters(origin.location, first.location) - getDistanceMeters(origin.location, second.location);
        return difference * (chargerSort === "origin-far" ? -1 : 1) || first.name.localeCompare(second.name, "th");
      }
      if (chargerSort === "speed") {
        return getMaxChargeRateKw(second) - getMaxChargeRateKw(first) || (second.rating ?? 0) - (first.rating ?? 0);
      }

      if (chargerSort === "rating") {
        return (
          (second.rating ?? 0) - (first.rating ?? 0) ||
          (second.userRatingCount ?? 0) - (first.userRatingCount ?? 0) ||
          getMaxChargeRateKw(second) - getMaxChargeRateKw(first)
        );
      }

      return (
        getDistanceToRouteMeters(first, routeSamplePoints) - getDistanceToRouteMeters(second, routeSamplePoints) ||
        getMaxChargeRateKw(second) - getMaxChargeRateKw(first) ||
        (second.rating ?? 0) - (first.rating ?? 0)
      );
    });
  }, [chargerSort, chargers, routeSamplePoints, origin]);

  function getChargerMetric(place: PlannerPlace) {
    if (chargerSort === "origin-near" || chargerSort === "origin-far") {
      return { label: "จากต้นทาง (ทางตรงโดยประมาณ)", value: origin ? formatDistance(getDistanceMeters(origin.location, place.location)) : "ยังไม่ได้เลือกต้นทาง" };
    }
    if (chargerSort === "speed") {
      const maxChargeRate = getMaxChargeRateKw(place);

      return {
        label: "กำลังชาร์จ",
        value: maxChargeRate > 0 ? `${maxChargeRate} kW` : "ไม่มีข้อมูลจากผู้ให้บริการ",
      };
    }

    if (chargerSort === "rating") {
      return {
        label: "คะแนน",
        value: place.rating ? `${place.rating.toFixed(1)} ดาว / ${place.userRatingCount?.toLocaleString("th-TH") ?? 0} รีวิว` : "ไม่มีคะแนน",
      };
    }

    const distanceToRoute = getDistanceToRouteMeters(place, routeSamplePoints);

    return {
      label: "ใกล้เส้นทาง",
      value: Number.isFinite(distanceToRoute) ? formatDistance(distanceToRoute) : "ยังไม่มีเส้นทาง",
    };
  }

  function getChargerRecommendationBadges(place: PlannerPlace): RecommendationBadge[] {
    const distanceToRoute = getDistanceToRouteMeters(place, routeSamplePoints);
    const distanceText = Number.isFinite(distanceToRoute) ? formatDistance(distanceToRoute) : "ยังไม่มีเส้นทาง";
    const maxChargeRate = getMaxChargeRateKw(place);
    const speedText = maxChargeRate > 0 ? `${maxChargeRate} kW` : "ไม่มีข้อมูล kW";
    const ratingText = place.rating ? `${place.rating.toFixed(1)} ดาว` : "ไม่มีคะแนน";

    return [
      { label: "ใกล้ทาง", value: distanceText },
      { label: "kW", value: speedText },
      { label: "คะแนน", value: ratingText },
    ];
  }

  function updateSetting<TKey extends keyof TripSettings>(key: TKey, value: TripSettings[TKey]) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateStartingRangeKm(remainingRangeKm: number) {
    const safeRangeKm = Math.min(Math.max(remainingRangeKm, 0), settings.maxRangeKm);
    const batteryStartPercent = settings.maxRangeKm > 0 ? (safeRangeKm / settings.maxRangeKm) * 100 : 0;

    updateSetting("batteryStartPercent", Math.round(batteryStartPercent * 10) / 10);
  }

  function clearComputedData() {
    setRoute(null);
    setRouteStops([]);
    setChargers([]);
    setChargerNotice("");
    setNearbyPlaces([]);
  }

  function addWaypoint(place: PlannerPlace) {
    setError("");

    if (
      waypoints.some((waypoint) => samePlace(waypoint, place)) ||
      Boolean(origin && samePlace(origin, place)) ||
      Boolean(destination && samePlace(destination, place))
    ) {
      setStatus("สถานที่นี้อยู่ในแผนทริปแล้ว");
      return;
    }

    if (waypoints.length >= settings.maxStops) {
      setError(`เพิ่มจุดแวะได้สูงสุด ${settings.maxStops} จุดตามค่าที่ตั้งไว้`);
      return;
    }

    const isCharger = Boolean(place.evChargeOptions || place.types?.includes("electric_vehicle_charging_station"));
    setWaypoints((current) => [
      ...current,
      {
        ...place,
        stopMinutes: place.stopMinutes ?? (isCharger ? 35 : 45),
        chargeTargetPercent: isCharger ? (place.chargeTargetPercent ?? 85) : place.chargeTargetPercent,
      },
    ]);
    clearComputedData();
    setStatus(`เพิ่ม ${place.name} เป็นจุดแวะแล้ว`);
  }

  function removeWaypoint(index: number) {
    setWaypoints((current) => current.filter((_, currentIndex) => currentIndex !== index));
    clearComputedData();
  }

  function moveWaypoint(index: number, direction: -1 | 1) {
    setWaypoints((current) => {
      const next = [...current];
      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return current;
      }

      const item = next[index];
      next[index] = next[target];
      next[target] = item;
      return next;
    });
    clearComputedData();
  }

  function selectOrigin(place: PlannerPlace) {
    setOrigin(place);
    if (destination && samePlace(place, destination)) {
      setDestination(null);
      setError("ต้นทางซ้ำกับปลายทางเดิม กรุณาเลือกปลายทางใหม่");
      setStatus("");
    } else {
      setError("");
    }
    setWaypoints((current) => current.filter((waypoint) => !samePlace(waypoint, place) && !Boolean(destination && samePlace(waypoint, destination))));
    clearComputedData();
  }

  function selectDestination(place: PlannerPlace) {
    if (origin && samePlace(origin, place)) {
      setError("ปลายทางซ้ำกับต้นทาง กรุณาเลือกสถานที่อื่นเป็นปลายทาง");
      setStatus("");
      return;
    }

    setDestination(place);
    setError("");
    setWaypoints((current) => current.filter((waypoint) => !samePlace(waypoint, place) && !Boolean(origin && samePlace(waypoint, origin))));
    clearComputedData();
  }

  function getFallbackChargerCenters(stops: PlannerPlace[]) {
    if (stops.length <= 4) {
      return uniquePlaces(stops);
    }

    return uniquePlaces([stops[0], stops[Math.floor(stops.length / 2)], stops[stops.length - 1]].filter(Boolean));
  }

  async function searchNearbyChargersFallback(centers: PlannerPlace[]) {
    const results = await Promise.allSettled(
      centers.map((center) =>
        postJson<PlacesResponse>("/api/places", {
          mode: "nearby",
          center: center.location,
          radiusKm: 30,
          includedTypes: ["electric_vehicle_charging_station"],
          maxResultCount: 6,
          rankPreference: "DISTANCE",
        }),
      ),
    );
    const places = results.flatMap((result) => (result.status === "fulfilled" ? result.value.places : []));

    return uniquePlaces(places).slice(0, Math.max(1, Math.min(20, settings.maxStops + 4)));
  }

  async function searchRouteChargersByPolyline(encodedPolyline: string) {
    const maxResultCount = Math.max(1, Math.min(20, settings.maxStops + 4));
    const segments = splitEncodedPolyline(encodedPolyline, routeChargerPolylineLimit, routeChargerMaxSegments);
    const perSegmentResultCount = Math.max(3, Math.min(10, Math.ceil(maxResultCount / segments.length) + 2));
    const results = await Promise.allSettled(
      segments.map((segment) =>
        postJson<PlacesResponse>("/api/places", {
          mode: "route-chargers",
          encodedPolyline: segment,
          connectorType: settings.connectorType,
          minChargerKw: settings.minChargerKw,
          openNowOnly: settings.openNowOnly,
          minRating: settings.minRating,
          maxResultCount: perSegmentResultCount,
        }),
      ),
    );
    const places = results.flatMap((result) => (result.status === "fulfilled" ? result.value.places : []));
    const failedCount = results.filter((result) => result.status === "rejected").length;

    return {
      places: uniquePlaces(places).slice(0, maxResultCount),
      segmentCount: segments.length,
      failedCount,
    };
  }

  async function searchChargingStations(encodedPolyline: string, stops: PlannerPlace[]) {
    setPlacesLoading(true);
    setChargerNotice("");

    try {
      const routeChargerResult = await searchRouteChargersByPolyline(encodedPolyline);

      if (routeChargerResult.places.length > 0) {
        const segmentedNotice =
          routeChargerResult.segmentCount > 1
            ? `เส้นทางยาว ระบบแบ่งค้นหาสถานีชาร์จตามแนวเส้นทางเป็น ${routeChargerResult.segmentCount} ช่วง`
            : "";
        const partialNotice =
          routeChargerResult.failedCount > 0 ? ` บางช่วงค้นหาไม่สำเร็จ ${routeChargerResult.failedCount} ช่วง` : "";

        setChargers(routeChargerResult.places);
        setChargerNotice(`${segmentedNotice}${partialNotice}`.trim());
        setStatus(`พบสถานีชาร์จตามแนวเส้นทาง ${routeChargerResult.places.length} แห่ง`);
        return;
      }

      if (encodedPolyline.length > routeChargerPolylineLimit) {
        const fallbackChargers = await searchNearbyChargersFallback(getFallbackChargerCenters(stops));
        const notice =
          "แบ่งเส้นทางค้นหาตามแนวถนนแล้ว แต่ยังไม่พบสถานีชาร์จ ระบบจึงค้นหาใกล้ต้นทาง จุดแวะ และปลายทางแทน";

        setChargers(fallbackChargers);
        setChargerNotice(notice);
        setStatus(
          fallbackChargers.length > 0
            ? `พบสถานีชาร์จสำรอง ${fallbackChargers.length} แห่งใกล้จุดสำคัญของทริป`
            : "คำนวณเส้นทางสำเร็จ แต่ยังไม่พบสถานีชาร์จใกล้จุดสำคัญของทริป",
        );
        return;
      }

      setChargers([]);
      setStatus("Google Places ไม่พบสถานีชาร์จตามแนวเส้นทางนี้");
    } catch (fetchError) {
      setChargers([]);
      setChargerNotice(fetchError instanceof Error ? fetchError.message : "ค้นหาสถานีชาร์จไม่สำเร็จ");
      setStatus("คำนวณเส้นทางสำเร็จ แต่ค้นหาสถานีชาร์จตามเส้นทางไม่สำเร็จ");
    } finally {
      setPlacesLoading(false);
    }
  }

  async function calculateRoute() {
    if (!origin || !destination) {
      setError("กรุณาเลือกต้นทางและปลายทางจาก Google Places ก่อน");
      return;
    }

    if (samePlace(origin, destination)) {
      setError("ต้นทางและปลายทางเป็นสถานที่เดียวกัน กรุณาเลือกปลายทางใหม่");
      return;
    }

    setRouteLoading(true);
    setError("");
    setStatus("");

    try {
      const isRoundTrip = settings.tripType === "round-trip";
      const requestDestination = isRoundTrip ? origin : destination;
      const cleanWaypoints = uniquePlaces(
        waypoints.filter((waypoint) => !samePlace(waypoint, origin) && !samePlace(waypoint, destination)),
      );
      const requestWaypoints = isRoundTrip ? [...cleanWaypoints, destination] : cleanWaypoints;
      const response = await postJson<RouteResponse>("/api/routes", {
        origin,
        destination: requestDestination,
        waypoints: requestWaypoints,
        departureTime: getDepartureIso(settings.travelDate, settings.departureTime),
        avoidTolls: settings.avoidTolls,
        avoidHighways: settings.avoidHighways,
        avoidFerries: settings.avoidFerries,
        optimizeWaypointOrder: !isRoundTrip && settings.optimizeWaypointOrder,
      });
      let orderedWaypoints = requestWaypoints;

      if (cleanWaypoints.length !== waypoints.length) {
        setWaypoints(cleanWaypoints);
      }

      if (!isRoundTrip && response.route.optimizedWaypointOrder.length === requestWaypoints.length) {
        orderedWaypoints = response.route.optimizedWaypointOrder.map((index) => requestWaypoints[index]);
        setWaypoints(orderedWaypoints);
        setStatus("Google Routes API จัดลำดับจุดแวะใหม่ให้แล้ว");
      }

      const computedStops = [origin, ...orderedWaypoints, requestDestination];
      setRoute(response.route);
      setRouteStops(computedStops);
      await searchChargingStations(response.route.encodedPolyline, computedStops);
    } catch (fetchError) {
      setRoute(null);
      setRouteStops([]);
      setChargers([]);
      setError(fetchError instanceof Error ? fetchError.message : "คำนวณเส้นทางไม่สำเร็จ");
    } finally {
      setRouteLoading(false);
    }
  }

  async function searchNearby(center: PlannerPlace, types = tourismCategory.includedTypes, radiusKm = settings.tourismRadiusKm) {
    setPlacesLoading(true);
    setError("");
    setTourismCenter(center);

    try {
      const response = await postJson<PlacesResponse>("/api/places", {
        mode: "nearby",
        center: center.location,
        radiusKm,
        includedTypes: types,
        maxResultCount: 12,
        rankPreference: "POPULARITY",
      });
      setNearbyPlaces(response.places);

      if (response.places.length === 0) {
        setStatus("Google Places ไม่พบสถานที่ในรัศมีที่เลือก");
      } else {
        setStatus(`พบสถานที่ใกล้เคียง ${response.places.length} แห่ง`);
      }
    } catch (fetchError) {
      setNearbyPlaces([]);
      setError(fetchError instanceof Error ? fetchError.message : "ค้นหาสถานที่ใกล้เคียงไม่สำเร็จ");
    } finally {
      setPlacesLoading(false);
    }
  }

  function saveTrip() {
    const snapshot: SavedTrip = {
      version: 1,
      savedAt: new Date().toISOString(),
      settings,
      origin,
      destination,
      waypoints,
      tourismCenter,
    };
    const parsed = savedTripSchema.safeParse(snapshot);

    if (!parsed.success) {
      setError("ข้อมูลทริปไม่ผ่าน schema จึงยังไม่บันทึก");
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(parsed.data));
    setStatus("บันทึกทริปไว้ในเครื่องแล้ว");
  }

  function clearTrip() {
    window.localStorage.removeItem(storageKey);
    setOrigin(null);
    setDestination(null);
    setWaypoints([]);
    setTourismCenter(null);
    clearComputedData();
    setStatus("ล้างข้อมูลทริปแล้ว");
  }

  function exportTrip() {
    const snapshot: SavedTrip = {
      version: 1,
      savedAt: new Date().toISOString(),
      settings,
      origin,
      destination,
      waypoints,
      tourismCenter,
    };
    const parsed = savedTripSchema.safeParse(snapshot);

    if (!parsed.success) {
      setError("ข้อมูลทริปไม่ผ่าน schema จึงยังไม่ส่งออก");
      return;
    }

    const blob = new Blob([JSON.stringify(parsed.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tikkie-trip-${settings.travelDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importTrip(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = savedTripSchema.safeParse(JSON.parse(raw) as unknown);

      if (!parsed.success) {
        setError("ไฟล์ JSON ไม่ตรง schema ของ Tikkie Trip");
        return;
      }

      setSettings(parsed.data.settings as TripSettings);
      setOrigin(parsed.data.origin as PlannerPlace | null);
      setDestination(parsed.data.destination as PlannerPlace | null);
      setWaypoints(parsed.data.waypoints as PlannerPlace[]);
      setTourismCenter(parsed.data.tourismCenter as PlannerPlace | null);
      clearComputedData();
      setStatus("นำเข้าทริปจาก JSON แล้ว");
    } catch {
      setError("อ่านไฟล์ JSON ไม่สำเร็จ");
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-white/35 bg-[linear-gradient(135deg,#070044_0%,#1700c7_72%,#006dff_100%)] text-yellow shadow-sm">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-3 py-2.5 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] flex-1 items-center gap-2">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-yellow text-primary shadow-lg">
                <MapPinned className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase leading-none text-yellow-soft">Tikkie Travel</p>
                <h1 className="truncate text-lg font-black leading-tight tracking-normal sm:text-xl">Tikkie Trip – EV Planner</h1>
              </div>
            </div>

            <div className="trip-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto lg:justify-center">
              <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/95 px-3 text-xs font-black text-primary-deep shadow-sm">
                <Navigation className="size-4 text-cyan-deep" aria-hidden="true" />
                ระยะทาง
                <strong className="text-sm">{route ? formatDistance(route.distanceMeters) : "รอคำนวณ"}</strong>
              </span>
              <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/95 px-3 text-xs font-black text-primary-deep shadow-sm">
                <CalendarClock className="size-4 text-cyan-deep" aria-hidden="true" />
                เวลา
                <strong className="text-sm">{route ? formatDuration(route.duration) : "รอคำนวณ"}</strong>
              </span>
              <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/95 px-3 text-xs font-black text-primary-deep shadow-sm">
                <BatteryCharging className="size-4 text-cyan-deep" aria-hidden="true" />
                แบต
                <strong className="max-w-40 truncate text-sm">{estimates.length ? batterySummaryText(estimates) : "ยังไม่ประเมิน"}</strong>
              </span>
            </div>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => void calculateRoute()}
                disabled={routeActionDisabled}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-yellow px-4 text-sm font-black text-primary shadow-lg hover:bg-yellow-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {routeLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Navigation className="size-4" aria-hidden="true" />}
                คำนวณเส้นทาง
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex justify-center px-3 py-2 sm:px-4">
        <AdSlot />
      </div>

      <div className="mx-auto grid max-w-[1800px] gap-3 px-3 pb-3 sm:px-4 lg:h-[calc(100dvh-180px)] lg:grid-cols-[360px_minmax(0,1fr)_390px] lg:overflow-hidden lg:px-6">
        <aside className="grid h-[80dvh] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden lg:h-full">
          <nav className="grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-white p-1.5 shadow-sm" aria-label="เมนูตั้งค่าทริป">
            {setupMenuItems.map((item) => {
              const Icon = item.icon;
              const selected = activeSetupPanel === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSetupPanel(item.key)}
                  className={`inline-flex min-h-8 min-w-0 items-center justify-center gap-1 rounded-md border px-1.5 text-[7px] font-black text-primary-deep transition ${
                    selected ? "border-primary bg-yellow shadow-sm" : "border-yellow/60 bg-yellow/70 hover:bg-yellow"
                  }`}
                >
                  <Icon className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div ref={setupScrollRef} tabIndex={0} role="region" aria-label="รายละเอียดการตั้งค่าทริป" className="trip-scrollbar min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1 pb-1">
          <section className={`${activeSetupPanel === "trip" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <div className="flex items-center gap-2">
              <Car className="size-5 text-cyan-deep" aria-hidden="true" />
              <h2 className="text-lg font-black text-primary-deep">ตั้งค่าทริป</h2>
            </div>
            <div className="mt-4 space-y-4">
              <PlaceSearchInput
                label="ต้นทาง"
                placeholder="เช่น กรุงเทพฯ, บ้าน, สถานที่ทำงาน"
                value={origin}
                onSelect={(place) => {
                  selectOrigin(place);
                }}
                onClear={() => {
                  setOrigin(null);
                  clearComputedData();
                }}
                helperText="ใช้ suggestion จาก Google Places และโหลดพิกัดจาก Place Details"
              />
              <PlaceSearchInput
                label="ปลายทาง"
                placeholder="เช่น เขาใหญ่, เชียงใหม่, ระยอง"
                value={destination}
                center={origin?.location}
                onSelect={(place) => {
                  selectDestination(place);
                }}
                onClear={() => {
                  setDestination(null);
                  clearComputedData();
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-black text-primary-deep">วันที่เดินทาง</span>
                  <input
                    type="date"
                    value={settings.travelDate}
                    onChange={(event) => updateSetting("travelDate", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-primary-deep">เวลาออก</span>
                  <input
                    type="time"
                    value={settings.departureTime}
                    onChange={(event) => updateSetting("departureTime", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-foreground"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-black text-primary-deep">รูปแบบทริป</span>
                  <select
                    value={settings.tripType}
                    onChange={(event) => updateSetting("tripType", event.target.value as TripSettings["tripType"])}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold"
                  >
                    <option value="one-way">เที่ยวเดียว</option>
                    <option value="round-trip">ไป-กลับ</option>
                  </select>
                </label>
                <NumberField label="จำนวนวัน" value={settings.days} min={1} max={7} unit="วัน" onChange={(value) => updateSetting("days", value)} />
              </div>
            </div>
          </section>

          <section className={`${activeSetupPanel === "vehicle" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-warning" aria-hidden="true" />
              <h2 className="text-lg font-black text-primary-deep">Vehicle Profile</h2>
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-black text-primary-deep">ชื่อโปรไฟล์รถ</span>
              <input
                value={settings.profileName}
                onChange={(event) => updateSetting("profileName", event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-foreground"
              />
            </label>
            <p className="mt-2 rounded-lg bg-yellow/30 px-3 py-2 text-xs font-bold leading-5 text-primary-deep">
              ค่า 7.8 km/kWh เป็นค่าประมาณสำหรับใช้งานส่วนบุคคล ผู้ใช้ควรแก้ให้ตรงกับรถ น้ำหนักบรรทุก และพฤติกรรมขับขี่จริง
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberField label="แบตเริ่มต้น" value={settings.batteryStartPercent} min={0} max={100} step={0.1} unit="%" onChange={(value) => updateSetting("batteryStartPercent", value)} />
              <NumberField
                label="ระยะคงเหลือ"
                value={Math.round((settings.batteryStartPercent / 100) * settings.maxRangeKm * 10) / 10}
                min={0}
                max={settings.maxRangeKm}
                step={0.1}
                unit="กม."
                onChange={updateStartingRangeKm}
              />
              <NumberField label="แบตสำรองขั้นต่ำ" value={settings.reservePercent} min={0} max={80} unit="%" onChange={(value) => updateSetting("reservePercent", value)} />
              <NumberField label="ความจุแบต" value={settings.batteryCapacityKwh} min={10} max={250} step={0.1} unit="kWh" onChange={(value) => updateSetting("batteryCapacityKwh", value)} />
              <NumberField label="ประสิทธิภาพ" value={settings.efficiencyKmPerKwh} min={1} max={15} step={0.1} unit="km/kWh" onChange={(value) => updateSetting("efficiencyKmPerKwh", value)} />
              <NumberField label="ระยะสูงสุด/ชาร์จ" value={settings.maxRangeKm} min={50} max={1200} unit="กม." onChange={(value) => updateSetting("maxRangeKm", value)} />
              <NumberField label="กำลังชาร์จขั้นต่ำ" value={settings.minChargerKw} min={0} max={500} unit="kW" onChange={(value) => updateSetting("minChargerKw", value)} />
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-muted">
              ใส่ได้ทั้งเปอร์เซ็นต์หรือจำนวนกิโลเมตรคงเหลือ ระบบจะคำนวณอีกค่าให้อัตโนมัติจากระยะสูงสุดต่อการชาร์จ
            </p>
            <label className="mt-3 block">
              <span className="text-xs font-black text-primary-deep">ประเภทหัวชาร์จ</span>
              <select
                value={settings.connectorType}
                onChange={(event) => updateSetting("connectorType", event.target.value as TripSettings["connectorType"])}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold"
              >
                {connectorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className={`${activeSetupPanel === "filters" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <h2 className="text-lg font-black text-primary-deep">ตัวกรองและข้อจำกัด</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberField label="จุดแวะสูงสุด" value={settings.maxStops} min={0} max={10} unit="จุด" onChange={(value) => updateSetting("maxStops", value)} />
              <NumberField label="คะแนนขั้นต่ำ" value={settings.minRating} min={0} max={5} step={0.1} unit="★" onChange={(value) => updateSetting("minRating", value)} />
              <NumberField label="รัศมีท่องเที่ยว" value={settings.tourismRadiusKm} min={1} max={50} unit="กม." onChange={(value) => updateSetting("tourismRadiusKm", value)} />
            </div>
            <div className="mt-3 space-y-2">
              <ToggleRow label="เปิดอยู่ตอนนี้เท่านั้น" checked={settings.openNowOnly} onChange={(value) => updateSetting("openNowOnly", value)} />
              <ToggleRow label="เลี่ยงค่าผ่านทาง" checked={settings.avoidTolls} onChange={(value) => updateSetting("avoidTolls", value)} />
              <ToggleRow label="เลี่ยงทางด่วน" checked={settings.avoidHighways} onChange={(value) => updateSetting("avoidHighways", value)} />
              <ToggleRow label="เลี่ยงเรือข้ามฟาก" checked={settings.avoidFerries} onChange={(value) => updateSetting("avoidFerries", value)} />
              <ToggleRow label="ให้ Google จัดลำดับจุดแวะ" checked={settings.optimizeWaypointOrder} onChange={(value) => updateSetting("optimizeWaypointOrder", value)} />
            </div>
            <button
              type="button"
              onClick={() => void calculateRoute()}
              disabled={routeActionDisabled}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-yellow shadow-lg hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {routeLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Navigation className="size-4" aria-hidden="true" />}
              คำนวณเส้นทางและค้นหาสถานีชาร์จ
            </button>
          </section>
          </div>
        </aside>

        <div className="flex min-h-[680px] flex-col gap-3 lg:h-full lg:min-h-0">
          {(error || status) && (
            <div
              className={`rounded-lg border p-3 text-sm font-bold leading-6 ${
                error ? "border-danger/25 bg-red-50 text-danger" : "border-cyan/25 bg-blue-50 text-primary"
              }`}
            >
              {error ? <AlertTriangle className="mr-2 inline size-4" aria-hidden="true" /> : <Info className="mr-2 inline size-4" aria-hidden="true" />}
              {error || status}
            </div>
          )}
          <GoogleMapPanel
            browserKey={browserKey}
            mapId={mapId}
            className="min-h-[560px] flex-1 lg:min-h-0"
            mapClassName="h-full min-h-[560px] lg:min-h-0"
            origin={origin}
            destination={destination}
            waypoints={waypoints}
            chargers={chargers}
            nearbyPlaces={nearbyPlaces}
            tourismCenter={tourismCenter}
            tourismRadiusKm={settings.tourismRadiusKm}
            routePolyline={route?.encodedPolyline}
            onMapCenterSelected={(place) => {
              setTourismCenter(place);
              setStatus("เลือกศูนย์กลางค้นหาจากแผนที่แล้ว");
            }}
            onAddWaypoint={addWaypoint}
            onSetOrigin={(place) => {
              selectOrigin(place);
              setStatus(`ตั้ง ${place.name} เป็นต้นทางแล้ว`);
            }}
            onSetDestination={(place) => {
              selectDestination(place);
              setStatus(`ตั้ง ${place.name} เป็นปลายทางแล้ว`);
            }}
            onSearchNearby={(place) => void searchNearby(place)}
          />

          <section className="rounded-lg border border-border bg-white p-4 shadow-sm lg:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-primary-deep">ค้นหาพื้นที่ท่องเที่ยว</h2>
                <p className="text-xs font-semibold text-muted">เลือกศูนย์กลางจากช่องค้นหาหรือคลิกบนแผนที่ แล้วค้นหาด้วย Places API (New)</p>
              </div>
              <button
                type="button"
                onClick={() => tourismCenter && void searchNearby(tourismCenter)}
                disabled={!tourismCenter || placesLoading}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-yellow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placesLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
                ค้นหา
              </button>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
              <PlaceSearchInput
                label="ศูนย์กลางพื้นที่"
                placeholder="ค้นหาเมือง ร้าน หรือสถานที่เพื่อใช้เป็นจุดศูนย์กลาง"
                value={tourismCenter}
                onSelect={setTourismCenter}
                onClear={() => setTourismCenter(null)}
              />
              <label className="block">
                <span className="text-xs font-black text-primary-deep">ประเภทสถานที่</span>
                <select
                  value={tourismCategory.id}
                  onChange={(event) => {
                    const category = tourismCategories.find((item) => item.id === event.target.value) ?? tourismCategories[0];
                    setTourismCategory(category);
                  }}
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold"
                >
                  {tourismCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[5, 10, 20, 30, 50].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => updateSetting("tourismRadiusKm", radius)}
                  className={`min-h-9 rounded-lg border px-3 text-xs font-black ${
                    settings.tourismRadiusKm === radius ? "border-primary bg-primary text-yellow" : "border-border text-primary"
                  }`}
                >
                  {radius} กม.
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid h-[80dvh] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden lg:h-full">
          <nav className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-white p-1.5 shadow-sm" aria-label="เมนูผลลัพธ์ทริป">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-yellow text-primary-deep">
              <ActivePanelIcon className="size-4" aria-hidden="true" />
            </span>
            <label className="min-w-0 flex-1">
              <span className="sr-only">เลือกเมนูผลลัพธ์</span>
              <select
                value={activePanel}
                onChange={(event) => setActivePanel(event.target.value as PlannerMenuKey)}
                className="min-h-9 w-full rounded-md border border-yellow bg-yellow/70 px-3 text-sm font-black text-primary-deep outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {panelMenuItems.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}{typeof item.count === "number" ? ` (${item.count})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </nav>

          <div ref={resultsScrollRef} tabIndex={0} role="region" aria-label="รายละเอียดผลลัพธ์ทริป" className="trip-scrollbar min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1 pb-1">
          <section className={`${activePanel === "route" || activePanel === "itinerary" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-primary-deep">{activePanel === "itinerary" ? "รายการเดินทาง" : "วางแผนเส้นทาง"}</h2>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-primary hover:border-cyan"
              >
                เปิด Route
                <ExternalLink className="size-3.5" />
              </a>
            </div>
            {routeInputError ? (
              <p className="mt-3 rounded-lg border border-danger/25 bg-red-50 p-3 text-sm font-bold leading-6 text-danger">
                <AlertTriangle className="mr-2 inline size-4" aria-hidden="true" />
                {routeInputError}
              </p>
            ) : null}
            {settings.tripType === "round-trip" ? (
              <p className="mt-3 rounded-lg border border-cyan/25 bg-blue-50 p-3 text-sm font-bold leading-6 text-primary">
                <Info className="mr-2 inline size-4" aria-hidden="true" />
                ระบบจะคำนวณไปปลายทางหลักแล้วกลับต้นทาง
              </p>
            ) : null}
            {activePanel === "route" ? (
              <>
                <div className="mt-4 space-y-3">
                  {origin ? (
                    <div className="rounded-lg border border-success/20 bg-green-50 p-3">
                      <p className="text-xs font-black text-success">เริ่มต้น</p>
                      <p className="mt-1 text-sm font-black text-primary-deep">{origin.name}</p>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-border p-3 text-sm font-bold text-muted">ยังไม่ได้เลือกต้นทาง</p>
                  )}

                  {waypoints.map((place, index) => (
                    <div key={`${place.id}-${index}`} className="rounded-lg border border-border bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-black text-warning">จุดแวะ {index + 1}</p>
                          <p className="mt-1 text-sm font-black leading-5 text-primary-deep">{place.name}</p>
                          <p className="mt-1 text-xs font-semibold text-muted">
                            พัก {place.stopMinutes ?? 45} นาที
                            {place.chargeTargetPercent ? ` / ชาร์จถึง ${place.chargeTargetPercent}%` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button type="button" onClick={() => moveWaypoint(index, -1)} className="grid size-8 place-items-center rounded-md border border-border text-primary" aria-label="เลื่อนขึ้น">
                            <ArrowUp className="size-4" />
                          </button>
                          <button type="button" onClick={() => moveWaypoint(index, 1)} className="grid size-8 place-items-center rounded-md border border-border text-primary" aria-label="เลื่อนลง">
                            <ArrowDown className="size-4" />
                          </button>
                          <button type="button" onClick={() => removeWaypoint(index)} className="grid size-8 place-items-center rounded-md border border-border text-danger" aria-label="ลบจุดแวะ">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {destination ? (
                    <div className="rounded-lg border border-danger/20 bg-red-50 p-3">
                      <p className="text-xs font-black text-danger">{settings.tripType === "round-trip" ? "ปลายทางหลักก่อนกลับต้นทาง" : "ปลายทาง"}</p>
                      <p className="mt-1 text-sm font-black text-primary-deep">{destination.name}</p>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-border p-3 text-sm font-bold text-muted">ยังไม่ได้เลือกปลายทาง</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void calculateRoute()}
                  disabled={routeActionDisabled}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 text-sm font-black text-primary hover:bg-primary-soft disabled:opacity-60"
                >
                  <RotateCcw className="size-4" />
                  คำนวณเส้นทางใหม่
                </button>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                {itineraryStops.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm font-bold leading-6 text-muted">
                    เลือกต้นทางและปลายทางก่อน ระบบจะแสดงลำดับการเดินทางในหน้านี้
                  </p>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute bottom-6 left-[9px] top-6 w-0.5 rounded-full bg-border" aria-hidden="true" />
                    {itineraryStops.map((place, index) => {
                      const leg = route?.legs[index - 1];
                      const isFirst = index === 0;
                      const isLast = index === itineraryStops.length - 1;
                      const stepLabel = isFirst ? "เริ่มต้น" : isLast ? "ปลายทาง" : `จุดแวะ ${index}`;

                      return (
                        <div key={`${place.id}-itinerary-${index}`} className="relative pb-3 last:pb-0">
                          <span
                            className={`absolute -left-6 top-4 grid size-5 place-items-center rounded-full border-2 border-white text-[9px] font-black shadow-sm ${
                              isFirst ? "bg-success text-white" : isLast ? "bg-danger text-white" : "bg-yellow text-primary-deep"
                            }`}
                            aria-hidden="true"
                          >
                            {index + 1}
                          </span>
                          <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-xs font-black ${isFirst ? "text-success" : isLast ? "text-danger" : "text-warning"}`}>{stepLabel}</p>
                                <p className="mt-1 text-sm font-black leading-5 text-primary-deep">{place.name}</p>
                              </div>
                              <span className="shrink-0 rounded-md bg-primary-soft px-2 py-1 text-[10px] font-black text-primary">ลำดับ {index + 1}</span>
                            </div>
                            {place.address ? <p className="mt-1 text-xs font-semibold leading-5 text-muted">{place.address}</p> : null}
                            {leg ? (
                              <p className="mt-2 rounded-md bg-primary-soft px-2 py-1 text-xs font-black text-primary">
                                จากจุดก่อนหน้า {formatDistance(leg.distanceMeters)} / {formatDuration(leg.duration)}
                              </p>
                            ) : isFirst ? (
                              <p className="mt-2 rounded-md bg-green-50 px-2 py-1 text-xs font-black text-success">จุดเริ่มต้นของทริป</p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {!route && itineraryStops.length > 1 ? (
                  <p className="rounded-lg border border-dashed border-border p-3 text-xs font-bold leading-5 text-muted">
                    รายการนี้เป็นลำดับแผนคร่าวๆ กดคำนวณเส้นทางเพื่อเติมระยะทางและเวลาแต่ละช่วง
                  </p>
                ) : null}
              </div>
            )}
          </section>

          <section className={`${activePanel === "chargers" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <h2 className="text-lg font-black text-primary-deep">สถานีชาร์จตามเส้นทาง</h2>
            <div className="mt-3 space-y-3">
              {chargers.length > 1 ? (
                <div className="rounded-lg border border-border bg-surface-strong p-2">
                  <p className="px-1 pb-2 text-xs font-black text-primary-deep">จัดอันดับจุดชาร์จ</p>
                  <div className="grid grid-cols-3 gap-2">
                    {chargerSortItems.map((item) => {
                      const SortIcon = item.icon;
                      const active = chargerSort === item.key;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          aria-pressed={active}
                          disabled={!origin && (item.key === "origin-near" || item.key === "origin-far")}
                          onClick={() => setChargerSort(item.key)}
                          className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-black ${
                            active ? "border-primary bg-yellow text-primary-deep" : "border-yellow/80 bg-yellow/70 text-primary-deep hover:border-primary"
                          }`}
                        >
                          <SortIcon className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="whitespace-normal break-words">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {chargerNotice ? (
                <div className="rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-sm font-bold leading-6 text-primary-deep">
                  <Info className="mr-2 inline size-4 text-primary" aria-hidden="true" />
                  {chargerNotice}
                </div>
              ) : null}
              {placesLoading && chargers.length === 0 ? (
                <div className="rounded-lg border border-border bg-primary-soft p-4 text-sm font-black text-primary">
                  <LoaderCircle className="mr-2 inline size-4 animate-spin" />
                  กำลังค้นหาจาก Google Places
                </div>
              ) : chargers.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm font-bold leading-6 text-muted">
                  หลังคำนวณเส้นทาง ระบบจะค้นหาสถานีชาร์จตามเส้นทาง หรือค้นหาใกล้จุดสำคัญของทริปเมื่อเส้นทางยาวมาก
                </p>
              ) : (
                sortedChargers.map((place) => {
                  const metric = getChargerMetric(place);

                  return (
                    <PlaceListCard
                      key={place.id}
                      place={place}
                      actionLabel="เพิ่มเป็นจุดชาร์จ"
                      metricLabel={metric.label}
                      metricValue={metric.value}
                      recommendationBadges={getChargerRecommendationBadges(place)}
                      onAction={() => addWaypoint(place)}
                      onNearby={() => void searchNearby(place, nearbyActivityTypes, 2)}
                    />
                  );
                })
              )}
            </div>
          </section>

          <section className={`${activePanel === "nearby" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <h2 className="text-lg font-black text-primary-deep">สถานที่ใกล้เคียง</h2>
            <div className="mt-3 rounded-lg border border-border bg-surface-strong p-3">
              <PlaceSearchInput
                label="ศูนย์กลางพื้นที่"
                placeholder="ค้นหาเมือง ร้าน หรือสถานที่"
                value={tourismCenter}
                onSelect={setTourismCenter}
                onClear={() => setTourismCenter(null)}
              />
              <label className="mt-3 block">
                <span className="text-xs font-black text-primary-deep">ประเภทสถานที่</span>
                <select
                  value={tourismCategory.id}
                  onChange={(event) => {
                    const category = tourismCategories.find((item) => item.id === event.target.value) ?? tourismCategories[0];
                    setTourismCategory(category);
                  }}
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold"
                >
                  {tourismCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[5, 10, 20, 30, 50].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => updateSetting("tourismRadiusKm", radius)}
                    className={`min-h-10 rounded-lg border px-3 text-xs font-black ${
                      settings.tourismRadiusKm === radius ? "border-primary bg-primary text-yellow" : "border-border bg-white text-primary"
                    }`}
                  >
                    {radius} กม.
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => tourismCenter && void searchNearby(tourismCenter)}
                disabled={!tourismCenter || placesLoading}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-yellow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placesLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
                ค้นหาที่แวะใกล้เคียง
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {nearbyPlaces.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm font-bold leading-6 text-muted">
                  เลือกสถานีชาร์จหรือค้นหาพื้นที่ท่องเที่ยวเพื่อแสดงร้านอาหาร คาเฟ่ โรงแรม แหล่งช้อปปิ้ง และสถานที่แวะ
                </p>
              ) : (
                nearbyPlaces.map((place) => (
                  <PlaceListCard
                    key={place.id}
                    place={place}
                    actionLabel="เพิ่มเป็นกิจกรรม"
                    onAction={() => addWaypoint(place)}
                  />
                ))
              )}
            </div>
          </section>

          <section className={`${activePanel === "vehicle" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <h2 className="text-lg font-black text-primary-deep">ประเมินแบตเตอรี่</h2>
            <p className="mt-2 text-xs font-bold leading-5 text-muted">
              เป็นการประมาณการจากระยะทางและค่า km/kWh เท่านั้น ผลจริงขึ้นกับความเร็ว อากาศ จราจร น้ำหนักบรรทุก แอร์ ความลาดชัน และสภาพแบตเตอรี่
            </p>
            <div className="mt-3 space-y-3">
              {estimates.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm font-bold text-muted">ยังไม่มี route leg สำหรับคำนวณ</p>
              ) : (
                estimates.map((estimate) => (
                  <div key={estimate.index} className="rounded-lg border border-border bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-muted">
                          ช่วง {estimate.index + 1}: {estimate.fromName} → {estimate.toName}
                        </p>
                        <p className="mt-1 text-sm font-black text-primary-deep">
                          {estimate.distanceKm.toLocaleString("th-TH", { maximumFractionDigits: 1 })} กม. / {estimate.durationText}
                        </p>
                      </div>
                      <span className={`rounded-md border px-2 py-1 text-xs font-black ${getRiskClass(estimate.risk)}`}>{estimate.risk}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-muted">
                      <span>ก่อนออก: {formatPercent(estimate.batteryBeforePercent)}</span>
                      <span>เมื่อถึง: {formatPercent(estimate.batteryArrivalPercent)}</span>
                      <span>หลังชาร์จ: {formatPercent(estimate.batteryAfterChargePercent)}</span>
                      <span>ใช้พลังงาน: {formatKwh(estimate.energyUsedKwh)}</span>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-primary-deep">{estimate.recommendation}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={`${activePanel === "vehicle" ? "" : "hidden"} rounded-lg border border-border bg-white p-4 shadow-sm`}>
            <h2 className="text-lg font-black text-primary-deep">บันทึกในเครื่อง</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={saveTrip} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-black text-yellow">
                <Save className="size-4" />
                บันทึก
              </button>
              <button type="button" onClick={clearTrip} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-danger">
                <Eraser className="size-4" />
                ล้าง
              </button>
              <button type="button" onClick={exportTrip} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-primary">
                <Download className="size-4" />
                ส่งออก JSON
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-primary">
                <Upload className="size-4" />
                นำเข้า
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => void importTrip(event.target.files?.[0])}
            />
            <p className="mt-3 flex gap-2 rounded-lg bg-primary-soft p-3 text-xs font-bold leading-5 text-primary-deep">
              <FileJson className="mt-0.5 size-4 shrink-0" />
              ระบบบันทึกเฉพาะสถานที่ที่ผู้ใช้เลือกและค่าทริป ไม่บันทึก API key และไม่บันทึกผล Google Places จำนวนมากแบบถาวร
            </p>
          </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
