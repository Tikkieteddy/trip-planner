"use client";

import { useEffect, useRef, useState } from "react";

type PublicAdConfig = { enabled: boolean; mobileScript: string; desktopScript: string };

export function AdSlot() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [config, setConfig] = useState<PublicAdConfig | null>(null);
  const [screenSize, setScreenSize] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const updateSize = () => setScreenSize(query.matches ? "desktop" : "mobile");
    updateSize();
    query.addEventListener("change", updateSize);
    return () => query.removeEventListener("change", updateSize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/ads", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: PublicAdConfig | null) => setConfig(result))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setConfig(null);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    const script = screenSize === "mobile" ? config?.mobileScript : screenSize === "desktop" ? config?.desktopScript : "";
    if (!config?.enabled || !script) return;

    const template = document.createElement("template");
    template.innerHTML = script;
    template.content.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attribute) => newScript.setAttribute(attribute.name, attribute.value));
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
    container.append(template.content);

    return () => container.replaceChildren();
  }, [config, screenSize]);

  return (
    <aside aria-label="โฆษณา" className={`relative mx-auto flex h-[100px] w-[min(320px,100%)] shrink-0 items-center justify-center overflow-hidden bg-white sm:h-[90px] sm:w-[min(728px,100%)] ${config?.enabled ? "" : "border border-dashed border-border"}`}>
      <div ref={containerRef} className="flex size-full items-center justify-center" />
      {!config?.enabled ? <span className="absolute text-[10px] font-bold text-muted/60">พื้นที่โฆษณา</span> : null}
    </aside>
  );
}
