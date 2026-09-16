"use client";

import { ArrowLeft, ArrowRight, CircleHelp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const storageKey = "tikkie-trip-tutorial-v1";

const steps = [
  {
    id: "welcome",
    title: "เริ่มวางแผนทริป EV",
    description: "คู่มือนี้จะพาไปรู้จักปุ่มสำคัญทีละจุด ใช้เวลาไม่นาน และเปิดดูใหม่ได้เสมอ",
  },
  {
    id: "origin",
    title: "เลือกต้นทาง",
    description: "พิมพ์ชื่อสถานที่ แล้วแตะรายการที่แนะนำ เพื่อให้ระบบได้พิกัดที่ถูกต้อง",
  },
  {
    id: "destination",
    title: "เลือกปลายทาง",
    description: "เลือกสถานที่ที่จะไปจากรายการแนะนำเช่นเดียวกัน หากเดินทางไป-กลับ ระบบจะพากลับต้นทาง",
  },
  {
    id: "setup-menu",
    title: "ตั้งค่ารถและตัวกรอง",
    description: "แตะ รถ เพื่อใส่แบตเริ่มต้นและข้อมูลรถ หรือแตะ ตัวกรอง เพื่อเลือกเงื่อนไขจุดชาร์จ",
  },
  {
    id: "map",
    title: "ค้นหาบนแผนที่",
    description: "ค้นหาสถานที่บนแผนที่ หรือแตะตำแหน่งบนแผนที่เพื่อเลือกจุดแวะและพื้นที่ใกล้เคียง",
  },
  {
    id: "calculate",
    title: "คำนวณเส้นทาง",
    description: "เมื่อเลือกต้นทางและปลายทางแล้ว แตะปุ่มนี้เพื่อดูเส้นทาง เวลา แบตเตอรี่ และจุดชาร์จตามทาง",
  },
  {
    id: "results-menu",
    title: "ดูผลลัพธ์แต่ละหน้า",
    description: "ใช้เมนูนี้สลับระหว่างแผนการเดินทาง จุดชาร์จ สถานที่ใกล้เคียง และข้อมูลรถ",
  },
  {
    id: "save-actions",
    title: "บันทึกและนำทริปกลับมาใช้",
    description: "เลือก รถ/บันทึก แล้วกด บันทึก เพื่อเก็บทริปในเครื่อง หรือส่งออก JSON ไว้สำรอง",
  },
] as const;

type Spotlight = { top: number; left: number; width: number; height: number };

export function TutorialGuide({ onStepEnter, onClose }: { onStepEnter: (id: string) => void; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const [dialogAtTop, setDialogAtTop] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) !== "done") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const page = document.querySelector<HTMLElement>("main");
    page?.setAttribute("inert", "");
    return () => page?.removeAttribute("inert");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const step = steps[stepIndex];
    onStepEnter(step.id);
    dialogRef.current?.focus();

    if (step.id === "welcome") {
      setSpotlight(null);
      setDialogAtTop(false);
      return;
    }

    let frame = 0;
    function updateSpotlight() {
      const target = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`);
      if (!target || target.getClientRects().length === 0) return;
      const bounds = target.getBoundingClientRect();
      const left = Math.max(8, bounds.left - 5);
      const top = Math.max(8, bounds.top - 5);
      setDialogAtTop(bounds.top + bounds.height / 2 > window.innerHeight / 2);
      setSpotlight({
        left,
        top,
        width: Math.max(0, Math.min(window.innerWidth - 8, bounds.right + 5) - left),
        height: Math.max(0, Math.min(window.innerHeight - 8, bounds.bottom + 5) - top),
      });
    }

    function findTarget(attempt: number) {
      const target = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`);
      if (!target || target.getClientRects().length === 0) {
        if (attempt < 12) frame = requestAnimationFrame(() => findTarget(attempt + 1));
        return;
      }
      target.scrollIntoView({ block: "start", behavior: "instant" });
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start", behavior: "instant" });
          updateSpotlight();
        });
      });
    }

    setSpotlight(null);
    setDialogAtTop(false);
    frame = requestAnimationFrame(() => findTarget(0));
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [open, stepIndex, onStepEnter]);

  function closeGuide() {
    try {
      window.localStorage.setItem(storageKey, "done");
    } catch {
      // The guide still closes when browser storage is unavailable.
    }
    setOpen(false);
    setStepIndex(0);
    setSpotlight(null);
    setDialogAtTop(false);
    onClose();
  }

  function openGuide() {
    setStepIndex(0);
    setOpen(true);
  }

  const step = steps[stepIndex];

  return (
    <>
      <button type="button" onClick={openGuide} title="เปิดคู่มือแนะนำการใช้งาน" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/40 px-3 text-sm font-black text-white hover:bg-white/10">
        <CircleHelp className="size-4" aria-hidden="true" /> วิธีใช้
      </button>
      {open ? createPortal(
        <>
          <div className={`fixed inset-0 z-[80] ${spotlight ? "" : "bg-[#07102b]/75"}`} aria-hidden="true" />
          {spotlight ? (
            <div className="pointer-events-none fixed z-[81] rounded-lg border-[3px] border-yellow" aria-hidden="true"
              style={{ ...spotlight, boxShadow: "0 0 0 100vmax rgba(7, 16, 43, 0.75)" }} />
          ) : null}
          <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeGuide();
              if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex(stepIndex - 1);
              if (event.key === "ArrowRight" && stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
              if (event.key === "Tab") {
                const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
              }
            }}
            className={`fixed inset-x-3 z-[90] mx-auto max-h-[calc(100dvh-24px)] w-[min(420px,calc(100%-24px))] overflow-y-auto rounded-lg border border-yellow bg-white p-5 text-primary-deep shadow-2xl outline-none ${dialogAtTop ? "top-3 sm:top-5" : "bottom-3 sm:bottom-5"}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black text-primary">ขั้นที่ {stepIndex + 1} จาก {steps.length}</p>
              <button type="button" onClick={closeGuide} title="ปิดคู่มือ" aria-label="ปิดคู่มือ" className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-primary"><X className="size-5" /></button>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-soft" aria-hidden="true">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
            </div>
            <h2 id="tutorial-title" className="mt-4 text-xl font-black leading-7">{step.title}</h2>
            <p id="tutorial-description" className="mt-2 text-base font-semibold leading-7">{step.description}</p>
            <div className="mt-5 flex items-center justify-between gap-2">
              <button type="button" onClick={closeGuide} title="ข้ามคู่มือแนะนำ" className="min-h-11 px-2 text-sm font-black text-muted">ข้าม</button>
              <div className="flex gap-2">
                {stepIndex > 0 ? <button type="button" onClick={() => setStepIndex(stepIndex - 1)} title="ย้อนกลับขั้นก่อนหน้า" className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-3 text-sm font-black text-primary"><ArrowLeft className="size-4" /> ย้อนกลับ</button> : null}
                <button type="button" onClick={stepIndex === steps.length - 1 ? closeGuide : () => setStepIndex(stepIndex + 1)} title={stepIndex === steps.length - 1 ? "จบคู่มือ" : "ไปขั้นถัดไป"}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md bg-yellow px-4 text-sm font-black text-primary-deep">
                  {stepIndex === steps.length - 1 ? "เริ่มใช้งาน" : "ถัดไป"}{stepIndex === steps.length - 1 ? null : <ArrowRight className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </>, document.body) : null}
    </>
  );
}
