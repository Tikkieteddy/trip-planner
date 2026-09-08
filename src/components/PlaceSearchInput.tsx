"use client";

import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { postJson } from "@/lib/client-api";
import type { LatLng, PlacePrediction, PlannerPlace } from "@/types/trip";

type PredictionResponse = {
  predictions: PlacePrediction[];
};

type PlaceDetailsResponse = {
  place: PlannerPlace;
};

type PlaceSearchInputProps = {
  label: string;
  value: PlannerPlace | null;
  placeholder: string;
  helperText?: string;
  center?: LatLng;
  onSelect: (place: PlannerPlace) => void;
  onClear?: () => void;
};

function newSessionToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function PlaceSearchInput({ label, value, placeholder, helperText, center, onSelect, onClear }: PlaceSearchInputProps) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const [query, setQuery] = useState(value?.name ?? "");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoadingPlaceId, setDetailsLoadingPlaceId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const sessionTokenRef = useRef(newSessionToken());

  const showPredictions = useMemo(() => predictions.length > 0 && query.trim().length >= 2, [predictions.length, query]);

  useEffect(() => {
    setQuery(value?.name ?? "");
  }, [value?.name]);

  useEffect(() => {
    const trimmed = query.trim();

    if (value?.name === trimmed) {
      setPredictions([]);
      return;
    }

    if (trimmed.length < 2) {
      setPredictions([]);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await postJson<PredictionResponse>(
          "/api/places",
          {
            mode: "autocomplete",
            input: trimmed,
            sessionToken: sessionTokenRef.current,
            center,
          },
          controller.signal,
        );
        setPredictions(response.predictions);

        if (response.predictions.length === 0) {
          setError("ไม่พบ suggestion จาก Google Places");
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setPredictions([]);
          setError(fetchError instanceof Error ? fetchError.message : "ค้นหาสถานที่ไม่สำเร็จ");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 480);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [center, query, value?.name]);

  async function selectPrediction(prediction: PlacePrediction) {
    setDetailsLoadingPlaceId(prediction.placeId);
    setError("");

    try {
      const response = await postJson<PlaceDetailsResponse>("/api/place-details", {
        placeId: prediction.placeId,
      });
      onSelect(response.place);
      setQuery(response.place.name);
      setPredictions([]);
      sessionTokenRef.current = newSessionToken();
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "โหลดรายละเอียดสถานที่ไม่สำเร็จ");
    } finally {
      setDetailsLoadingPlaceId(null);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className="text-sm font-black text-primary-deep">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-white px-3 shadow-sm focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20">
        <Search className="size-4 shrink-0 text-cyan-deep" aria-hidden="true" />
        <input
          id={inputId}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-11 w-full border-0 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted"
        />
        {loading ? <LoaderCircle className="size-4 shrink-0 animate-spin text-cyan-deep" aria-hidden="true" /> : null}
        {value && onClear ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setQuery("");
              setPredictions([]);
            }}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-primary-soft hover:text-primary"
            aria-label={`ล้าง${label}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {helperText ? <p className="mt-1 text-xs font-semibold text-muted">{helperText}</p> : null}
      {error ? <p className="mt-2 text-xs font-bold text-danger">{error}</p> : null}

      {showPredictions ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border bg-white p-2 shadow-[0_24px_70px_rgba(13,18,56,0.18)]"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              role="option"
              onClick={() => void selectPrediction(prediction)}
              className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-primary-soft focus:bg-primary-soft"
            >
              <MapPin className="mt-1 size-4 shrink-0 text-cyan-deep" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-primary-deep">{prediction.mainText}</span>
                <span className="mt-0.5 block text-xs font-semibold leading-5 text-muted">
                  {prediction.secondaryText ?? prediction.text}
                </span>
              </span>
              {detailsLoadingPlaceId === prediction.placeId ? (
                <LoaderCircle className="mt-1 size-4 shrink-0 animate-spin text-cyan-deep" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
