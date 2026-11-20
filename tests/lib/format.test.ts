import { afterEach, describe, expect, it, vi } from "vitest";
import { durationToSeconds, formatDistance, formatDuration, formatKwh, formatPercent, getDepartureIso } from "@/lib/format";

describe("format helpers", () => {
  it("formats distance in metres below 1 km and kilometres above", () => {
    expect(formatDistance(499.6)).toBe("500 ม.");
    expect(formatDistance(1500)).toBe("1.5 กม.");
  });

  it("parses Google duration strings defensively", () => {
    expect(durationToSeconds("5400s")).toBe(5400);
    expect(durationToSeconds(undefined)).toBe(0);
    expect(durationToSeconds("abc")).toBe(0);
  });

  it("formats durations in hours and minutes", () => {
    expect(formatDuration("90s")).toBe("2 นาที");
    expect(formatDuration("3600s")).toBe("1 ชม.");
    expect(formatDuration("5400s")).toBe("1 ชม. 30 นาที");
    expect(formatDuration()).toBe("0 นาที");
  });

  it("clamps negative percentages and formats kWh", () => {
    expect(formatPercent(-5)).toBe("0%");
    expect(formatPercent(42.26)).toBe("42.3%");
    expect(formatKwh(12.34)).toBe("12.3 kWh");
  });
});

describe("getDepartureIso", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for an invalid date", () => {
    expect(getDepartureIso("not-a-date", "08:00")).toBeUndefined();
  });

  it("moves past departures to at least 10 minutes from now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T03:00:00.000Z"));
    expect(getDepartureIso("2026-01-01", "08:00")).toBe("2026-10-29T03:10:00.000Z");
  });

  it("keeps future departures and defaults the time to 08:00", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T03:00:00.000Z"));
    expect(getDepartureIso("2026-12-01", "")).toBe(new Date("2026-12-01T08:00:00").toISOString());
  });
});
