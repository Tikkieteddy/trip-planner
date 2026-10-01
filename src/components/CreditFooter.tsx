"use client";

import { useEffect, useRef, useState } from "react";
import { versionMetadata } from "@/version";

const COPYRIGHT_START_YEAR = 2026;

export function CreditFooter() {
  const [currentYear, setCurrentYear] = useState(COPYRIGHT_START_YEAR);
  const [tooltipPinned, setTooltipPinned] = useState(false);
  const [tooltipHovered, setTooltipHovered] = useState(false);
  const [tooltipFocused, setTooltipFocused] = useState(false);
  const versionControlRef = useRef<HTMLSpanElement>(null);
  const majorVersion = versionMetadata.version.split(".")[0] ?? "1";
  const fullVersion = `V.${versionMetadata.version}+${versionMetadata.build}`;
  const tooltipOpen = tooltipPinned || tooltipHovered || tooltipFocused;

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!tooltipOpen) return;

    const closeOnOutsideTap = (event: PointerEvent) => {
      if (!versionControlRef.current?.contains(event.target as Node)) {
        setTooltipPinned(false);
        setTooltipHovered(false);
        setTooltipFocused(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTooltipPinned(false);
        setTooltipHovered(false);
        setTooltipFocused(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideTap);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideTap);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [tooltipOpen]);

  const copyright =
    currentYear > COPYRIGHT_START_YEAR
      ? `© ${COPYRIGHT_START_YEAR}-${currentYear}`
      : `© ${COPYRIGHT_START_YEAR}`;

  return (
    <footer className="w-full px-4 pt-5 pb-28 text-center text-xs text-muted lg:pb-5">
      <span>{copyright} ttdLab | </span>
      <span ref={versionControlRef} className="relative inline-flex">
        <button
          type="button"
          aria-label={`เวอร์ชันหลัก ${majorVersion}; แตะเพื่อดูเวอร์ชันเต็ม`}
          aria-describedby={tooltipOpen ? "app-full-version" : undefined}
          aria-expanded={tooltipOpen}
          className="rounded-sm underline decoration-dotted underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setTooltipHovered(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setTooltipHovered(false);
          }}
          onClick={() => setTooltipPinned((open) => !open)}
          onFocus={() => setTooltipFocused(true)}
          onBlur={() => setTooltipFocused(false)}
        >
          V.{majorVersion}
        </button>
        {tooltipOpen && (
          <span
            id="app-full-version"
            role="tooltip"
            className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-3 py-2 text-[11px] text-foreground shadow-lg"
          >
            {fullVersion}
          </span>
        )}
      </span>
    </footer>
  );
}
