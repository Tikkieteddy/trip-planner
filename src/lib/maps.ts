export function loadGoogleMaps(apiKey: string, mapId?: string) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__tikkieTripMapsLoading) {
    return window.__tikkieTripMapsLoading;
  }

  window.__tikkieTripMapsLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      language: "th",
      region: "TH",
    });

    if (mapId) {
      params.set("map_ids", mapId);
    }

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("โหลด Google Maps JavaScript API ไม่สำเร็จ"));
    document.head.appendChild(script);
  });

  return window.__tikkieTripMapsLoading;
}

export function toGoogleLatLng(point: { latitude: number; longitude: number }) {
  return {
    lat: point.latitude,
    lng: point.longitude,
  };
}
