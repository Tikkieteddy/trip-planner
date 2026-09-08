export {};

declare global {
  interface Window {
    google?: GoogleMapsRoot;
    __tikkieTripMapsLoading?: Promise<void>;
  }

  type GoogleLatLngLiteral = {
    lat: number;
    lng: number;
  };

  type GoogleMapClickEvent = {
    latLng?: {
      lat: () => number;
      lng: () => number;
    };
  };

  interface GoogleMapInstance {
    fitBounds(bounds: GoogleLatLngBounds): void;
    setCenter(center: GoogleLatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  interface GoogleLatLngBounds {
    extend(point: GoogleLatLngLiteral): void;
  }

  interface GoogleMapOverlay {
    setMap(map: GoogleMapInstance | null): void;
  }

  interface GoogleInfoWindow {
    setContent(content: string): void;
    open(options: { map: GoogleMapInstance; anchor?: GoogleMapOverlay }): void;
    close(): void;
  }

  interface GoogleEventApi {
    clearListeners(instance: unknown, eventName: string): void;
    addListener(instance: unknown, eventName: string, handler: (event?: GoogleMapClickEvent) => void): unknown;
  }

  interface GoogleMapsRoot {
    maps: {
      Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
      Marker: new (options: Record<string, unknown>) => GoogleMapOverlay;
      Polyline: new (options: Record<string, unknown>) => GoogleMapOverlay;
      Circle: new (options: Record<string, unknown>) => GoogleMapOverlay;
      LatLngBounds: new () => GoogleLatLngBounds;
      InfoWindow: new (options?: Record<string, unknown>) => GoogleInfoWindow;
      SymbolPath: {
        CIRCLE: number;
      };
      event: GoogleEventApi;
    };
  }
}
