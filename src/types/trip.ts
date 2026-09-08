export type LatLng = {
  latitude: number;
  longitude: number;
};

export type PlaceSource = "google" | "map_click";

export type EVConnectorType =
  | "EV_CONNECTOR_TYPE_CCS_COMBO_2"
  | "EV_CONNECTOR_TYPE_CCS_COMBO_1"
  | "EV_CONNECTOR_TYPE_CHADEMO"
  | "EV_CONNECTOR_TYPE_TYPE_2"
  | "EV_CONNECTOR_TYPE_TESLA"
  | "EV_CONNECTOR_TYPE_NACS"
  | "EV_CONNECTOR_TYPE_J1772"
  | "EV_CONNECTOR_TYPE_OTHER";

export type ConnectorAggregation = {
  type?: EVConnectorType | string;
  maxChargeRateKw?: number;
  count?: number;
  availabilityLastUpdateTime?: string;
  availableCount?: number;
  outOfServiceCount?: number;
};

export type EVChargeOptions = {
  connectorCount?: number;
  connectorAggregation?: ConnectorAggregation[];
};

export type PlannerPlace = {
  id: string;
  placeId?: string;
  name: string;
  address?: string;
  location: LatLng;
  googleMapsUri?: string;
  primaryType?: string;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean | null;
  evChargeOptions?: EVChargeOptions;
  source: PlaceSource;
  note?: string;
  stopMinutes?: number;
  chargeTargetPercent?: number;
};

export type PlacePrediction = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText?: string;
  types?: string[];
  distanceMeters?: number;
};

export type TripSettings = {
  profileName: string;
  travelDate: string;
  departureTime: string;
  tripType: "one-way" | "round-trip";
  days: number;
  batteryStartPercent: number;
  reservePercent: number;
  batteryCapacityKwh: number;
  efficiencyKmPerKwh: number;
  maxRangeKm: number;
  minChargerKw: number;
  connectorType: EVConnectorType | "ANY";
  maxStops: number;
  tourismRadiusKm: number;
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidFerries: boolean;
  optimizeWaypointOrder: boolean;
  openNowOnly: boolean;
  minRating: number;
};

export type RouteLeg = {
  distanceMeters: number;
  duration: string;
  staticDuration?: string;
};

export type RouteResult = {
  distanceMeters: number;
  duration: string;
  encodedPolyline: string;
  legs: RouteLeg[];
  optimizedWaypointOrder: number[];
  warnings: string[];
};

export type BatteryRisk =
  | "ปลอดภัย"
  | "ควรวางแผนชาร์จ"
  | "ต่ำกว่าแบตเตอรี่สำรอง"
  | "ไม่สามารถเดินทางช่วงนี้ได้ตามค่าที่ตั้งไว้";

export type BatteryLegEstimate = {
  index: number;
  fromName: string;
  toName: string;
  distanceKm: number;
  durationText: string;
  energyUsedKwh: number;
  batteryBeforePercent: number;
  batteryArrivalPercent: number;
  batteryAfterChargePercent: number;
  risk: BatteryRisk;
  recommendation: string;
};

export type TourismCategory = {
  id: string;
  label: string;
  includedTypes: string[];
};

export type SavedTrip = {
  version: 1;
  savedAt: string;
  settings: TripSettings;
  origin: PlannerPlace | null;
  destination: PlannerPlace | null;
  waypoints: PlannerPlace[];
  tourismCenter: PlannerPlace | null;
};

export type ApiErrorResponse = {
  error: string;
  detail?: string;
};
