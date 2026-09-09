export function metersToKm(meters: number) {
  return meters / 1000;
}

export function formatDistance(meters: number) {
  const km = metersToKm(meters);

  if (km < 1) {
    return `${Math.round(meters)} ม.`;
  }

  return `${km.toLocaleString("th-TH", { maximumFractionDigits: 1 })} กม.`;
}

export function durationToSeconds(duration?: string) {
  if (!duration) {
    return 0;
  }

  const value = Number(duration.replace("s", ""));
  return Number.isFinite(value) ? value : 0;
}

export function formatDuration(duration?: string) {
  const seconds = durationToSeconds(duration);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours <= 0) {
    return `${minutes} นาที`;
  }

  if (minutes <= 0) {
    return `${hours} ชม.`;
  }

  return `${hours} ชม. ${minutes} นาที`;
}

export function formatPercent(value: number) {
  return `${Math.max(0, value).toLocaleString("th-TH", { maximumFractionDigits: 1 })}%`;
}

export function formatKwh(value: number) {
  return `${value.toLocaleString("th-TH", { maximumFractionDigits: 1 })} kWh`;
}

export function getDepartureIso(date: string, time: string) {
  const localDate = new Date(`${date}T${time || "08:00"}:00`);

  if (Number.isNaN(localDate.getTime())) {
    return undefined;
  }

  const minimumDeparture = new Date(Date.now() + 10 * 60 * 1000);

  return (localDate > minimumDeparture ? localDate : minimumDeparture).toISOString();
}
