"use client";

import { ArrowLeft, ArrowRight, CircleHelp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const storageKey = "tikkie-trip-tutorial-v2";

const steps = [
  {
    id: "welcome",
    title: "เริ่มวางแผนทริป EV",
    details: [
      "คู่มือนี้พาไล่ดูการตั้งค่าทริป แผนที่ และแผงผลลัพธ์ที่อยู่ถัดลงมาด้านล่าง",
      "กด ถัดไป/ย้อนกลับ เพื่อเดินทีละขั้น หรือกด ข้าม เพื่อเริ่มใช้งานทันที",
      "เปิดคู่มือซ้ำได้จากปุ่ม วิธีใช้บนแถบด้านบน",
    ],
  },
  {
    id: "hero-summary",
    title: "สรุปทริป",
    details: [
      "ระยะทาง แสดงระยะรวมของเส้นทางที่คำนวณแล้ว",
      "เวลา แสดงเวลาขับโดยประมาณ ยังไม่รวมเวลาพัก ชาร์จ หรือรถติด",
      "แบต แสดงผลประเมินแบตเตอรี่และจำนวนช่วงที่ควรวางแผนชาร์จ",
      "แตะตัวเลขในแถบด้านบนเมื่ออยู่จอใหญ่เพื่ออ่านคำอธิบายเพิ่มเติม",
    ],
  },
  {
    id: "account",
    title: "เข้าสู่ระบบและบัญชี",
    details: [
      "วางแผนและคำนวณเส้นทางได้โดยไม่ต้องเข้าสู่ระบบ",
      "ต้องเข้าสู่ระบบก่อนตั้งชื่อ บันทึก เปิด ลบ นำเข้า หรือส่งออก Route",
      "เมื่อเข้าสู่ระบบ ปุ่มบัญชีด้านบนใช้เปิดหน้า Route ที่บันทึกและ Cloud Sync",
    ],
  },
  {
    id: "setup-menu",
    title: "เมนูตั้งค่าฝั่งซ้าย",
    details: [
      "ทริป ใช้กำหนดต้นทาง ปลายทาง วันเวลา และรูปแบบการเดินทาง",
      "รถ ใช้ใส่แบตเตอรี่ ระยะทางต่อการชาร์จ และชนิดหัวชาร์จ",
      "ตัวกรอง ใช้จำกัดสถานีชาร์จและปรับเงื่อนไขการค้นหาเส้นทาง",
      "เลือกเมนูแล้วเนื้อหาด้านล่างจะเปลี่ยนตามหัวข้อนั้น",
    ],
  },
  {
    id: "trip-settings",
    title: "ตั้งค่าทริป",
    details: [
      "กำหนดต้นทาง ปลายทาง วันที่เดินทาง และเวลาออก",
      "เที่ยวเดียวคำนวณจากต้นทางไปปลายทาง ส่วน ไป-กลับคำนวณไปปลายทางหลักแล้วกลับต้นทาง",
      "จำนวนวันเป็นข้อมูลประกอบของทริปในปัจจุบัน ไม่ได้สร้างแผนรายวันแยกให้อัตโนมัติ",
    ],
  },
  {
    id: "origin",
    title: "เลือกต้นทาง",
    details: [
      "พิมพ์ชื่อบ้าน เมือง สถานที่ หรือสถานี แล้วเลือกผลแนะนำจาก Google Places",
      "การเลือกผลแนะนำช่วยให้ระบบใช้พิกัดจริง ไม่ใช่ข้อความที่พิมพ์อย่างเดียว",
      "ปุ่มกากบาทล้างต้นทางและข้อมูลเส้นทางที่คำนวณไว้",
    ],
  },
  {
    id: "destination",
    title: "เลือกปลายทาง",
    details: [
      "ค้นหาแล้วเลือกสถานที่จากผลแนะนำเช่นเดียวกับต้นทาง",
      "ปลายทางเป็นจุดหมายหลัก ส่วนสถานที่ระหว่างทางเพิ่มได้จากแผนที่หรือผลค้นหาจุดชาร์จ",
      "ถ้าเลือกโหมดไป-กลับ ระบบจะเพิ่มปลายทางหลักก่อนคำนวณย้อนกลับต้นทาง",
    ],
  },
  {
    id: "trip-schedule",
    title: "วัน เวลา และรูปแบบทริป",
    details: [
      "วันที่และเวลาออกจะถูกส่งไปใช้คำนวณเส้นทางและบันทึกไว้กับทริป",
      "เลือกเที่ยวเดียวหรือไป-กลับ และระบุจำนวนวันของทริปได้ที่นี่",
      "จำนวนวันยังไม่แบ่ง Route เป็นรายการรายวันโดยอัตโนมัติ",
    ],
  },
  {
    id: "setup-vehicle-tab",
    title: "เมนูรถ",
    details: [
      "เปิด Vehicle Profile เพื่อปรับข้อมูลรถและแบตเตอรี่ให้ตรงกับรถที่ใช้",
      "ค่าเหล่านี้มีผลต่อการประเมินพลังงานและการแนะนำจุดชาร์จ",
    ],
  },
  {
    id: "vehicle-profile",
    title: "Vehicle Profile",
    details: [
      "ระบุแบตเริ่มต้นเป็นเปอร์เซ็นต์หรือระยะทางคงเหลือ ระบบคำนวณอีกค่าให้อัตโนมัติ",
      "ตั้งแบตสำรองขั้นต่ำ ความจุแบต ประสิทธิภาพ km/kWh และระยะสูงสุดต่อการชาร์จ",
      "เลือกกำลังชาร์จขั้นต่ำและประเภทหัวชาร์จ เพื่อกรองสถานีที่ไม่ตรงเงื่อนไขออก",
      "ผลทั้งหมดเป็นค่าประมาณ ควรปรับประสิทธิภาพให้ใกล้กับการใช้งานจริง",
    ],
  },
  {
    id: "setup-filters-tab",
    title: "เมนูตัวกรอง",
    details: [
      "ใช้กำหนดข้อจำกัดก่อนคำนวณ ไม่ใช่ตัวเลือกเปลี่ยนหน้าผลลัพธ์",
      "ถ้าผลค้นหาน้อยเกินไป ลองผ่อนคะแนนขั้นต่ำหรือเปิดเงื่อนไขค้นหาสถานีเพิ่มเติม",
    ],
  },
  {
    id: "filter-settings",
    title: "ตัวกรองและข้อจำกัด",
    details: [
      "กำหนดจำนวนจุดแวะสูงสุด คะแนนขั้นต่ำ และรัศมีค้นหาสถานที่ท่องเที่ยว",
      "เปิดอยู่ตอนนี้เท่านั้นและค้นหา EV Station PluZ เพิ่มเติมเป็นตัวเลือกการค้นหา",
      "เลือกเลี่ยงค่าผ่านทาง ทางด่วน หรือเรือข้ามฟากได้",
      "ให้ Google จัดลำดับจุดแวะช่วยจัดลำดับจุดแวะที่เพิ่มไว้ จากนั้นกดคำนวณใหม่เพื่อใช้ค่า",
    ],
  },
  {
    id: "map",
    title: "แผนที่และสัญลักษณ์",
    details: [
      "แผนที่แสดงต้นทาง ปลายทาง จุดแวะ สถานีชาร์จ และสถานที่ใกล้เคียงคนละสี",
      "คลิกตำแหน่งบนแผนที่เพื่อกำหนดศูนย์กลางสำหรับค้นหาสถานที่ใกล้เคียง",
      "ใช้ปุ่มขยายแผนที่เพื่อดูพื้นที่กว้างขึ้น หรือเปิด Google Maps แยกต่างหาก",
    ],
  },
  {
    id: "map-search",
    title: "ค้นหาและเพิ่มจุดจากแผนที่",
    details: [
      "ค้นหาสถานที่แล้วเลือกผลลัพธ์ เพื่อดูตำแหน่งและเมนูการทำงาน",
      "ตั้งต้นทาง/ปลายทาง ใช้เปลี่ยนจุดของทริป; เพิ่มจุดแวะ ใช้เพิ่มจุดกลางเส้นทาง",
      "ค้นหารอบจุดนี้ จะพาไปค้นหาร้านอาหาร ที่พัก และสถานที่ใกล้เคียง",
      "ปุ่มค้นหาสถานที่บนแถบแผนที่ใช้พับหรือเปิดกล่องนี้ได้",
    ],
  },
  {
    id: "calculate",
    title: "คำนวณเส้นทาง",
    details: [
      "กดหลังเลือกต้นทางและปลายทางแล้ว ระบบขอเส้นทางจาก Google และค้นหาสถานีชาร์จตามแนวทาง",
      "หากเปลี่ยนจุดแวะหรือค่ารถ/ตัวกรอง ให้คำนวณใหม่เพื่ออัปเดตผล",
      "หากมีข้อความผิดพลาดสีแดง ให้อ่านสาเหตุและแก้ข้อมูลจุดหรือการตั้งค่าก่อนลองอีกครั้ง",
    ],
  },
  {
    id: "results-menu",
    title: "เมนูผลลัพธ์ใต้แผนที่",
    details: [
      "วางแผน แสดงต้นทาง จุดแวะ ปลายทาง และปุ่มคำนวณใหม่",
      "รายการเดินทาง แสดง Timeline เชื่อมแต่ละจุด พร้อมระยะและเวลาในแต่ละช่วง",
      "จุดชาร์จ แสดงสถานีแนะนำตามเส้นทาง; ที่แวะใกล้เคียงใช้ค้นหาสถานที่รอบจุดที่เลือก",
      "รถ/บันทึก รวมผลประเมินแบตเตอรี่ การบันทึก Route และการตั้งค่า Cloud Sync",
      "เลือกเมนูจากแถบ dropdown นี้ เนื้อหาผลลัพธ์ด้านล่างจะเปลี่ยนตามหัวข้อ",
    ],
  },
  {
    id: "route-panel",
    title: "วางแผนเส้นทาง",
    details: [
      "ตรวจลำดับต้นทาง จุดแวะ และปลายทางก่อนออกเดินทาง",
      "ใช้ปุ่มลูกศรเพื่อเลื่อนจุดแวะขึ้น/ลง หรือปุ่มถังขยะเพื่อนำจุดแวะออก",
      "เปิด Route ใช้ส่งเส้นทางไป Google Maps; คำนวณเส้นทางใหม่เพื่ออัปเดตหลังแก้จุดแวะ",
    ],
  },
  {
    id: "itinerary-panel",
    title: "รายการเดินทางแบบ Timeline",
    details: [
      "ดูจุดเริ่มต้น จุดแวะ และปลายทางตามลำดับที่ระบบจะเดินทาง",
      "เมื่อคำนวณแล้ว แต่ละช่วงจะแสดงระยะทางและเวลาขับจากจุดก่อนหน้า",
      "ถ้ายังไม่คำนวณ รายการจะแสดงลำดับคร่าวๆ เท่านั้น",
    ],
  },
  {
    id: "chargers-panel",
    title: "สถานีชาร์จตามเส้นทาง",
    details: [
      "ระบบค้นหาสถานีตามแนว Route และแบ่งเส้นทางยาวเป็นช่วงเพื่อค้นหา",
      "เลือกพื้นที่อ้างอิงเป็นต้นทาง ปลายทาง หรือจุดแวะที่ต้องการ แล้วเรียงสถานีใกล้/ไกลพื้นที่นั้นได้",
      "ระยะใกล้/ไกลเป็นระยะเส้นตรงโดยประมาณของสถานีที่ค้นพบ ไม่ใช่ระยะขับตามถนน",
      "ยังเรียงตามใกล้เส้นทาง ชาร์จเร็ว หรือคะแนนสูงได้เช่นเดิม",
      "Badge แสดงเหตุผลแนะนำ เช่น ระยะห่างจากเส้นทาง กำลังชาร์จ และคะแนน เมื่อมีข้อมูล",
      "เพิ่มเป็นจุดชาร์จจะเพิ่มสถานีนั้นไว้ในจุดแวะ โดยรายการสถานีแนะนำยังอยู่ครบ",
      "ค้นหาสถานที่ใกล้สถานีเพื่อหาร้านหรือที่พักระหว่างชาร์จได้",
    ],
  },
  {
    id: "nearby-panel",
    title: "ที่แวะใกล้เคียง",
    details: [
      "เลือกศูนย์กลางจากช่องค้นหาหรือจากแผนที่ แล้วเลือกประเภทสถานที่",
      "กำหนดรัศมีค้นหาและกดค้นหาที่แวะใกล้เคียง",
      "เพิ่มผลที่สนใจเป็นจุดแวะในทริปได้ โดยจุดที่เพิ่มจะไม่ทำให้รายการแนะนำหายไป",
    ],
  },
  {
    id: "battery-panel",
    title: "ประเมินแบตเตอรี่",
    details: [
      "ดูพลังงานที่ใช้และแบตโดยประมาณในแต่ละช่วงของเส้นทาง",
      "คำแนะนำอ้างอิงจากค่าแบตเริ่มต้น ประสิทธิภาพรถ และระยะทางที่คำนวณ",
      "เป็นการประมาณการ ไม่ใช่ข้อมูลจากรถจริง; ความเร็ว อากาศ น้ำหนักบรรทุก และสภาพแบตทำให้ผลต่างได้",
    ],
  },
  {
    id: "route-name",
    title: "ตั้งชื่อ Route",
    details: [
      "ตั้งชื่อให้จำง่ายก่อนบันทึก เช่น ชื่อทริปหรือวันที่เดินทาง",
      "ถ้ายังไม่เข้าสู่ระบบ ช่องนี้จะแจ้งให้เข้าสู่ระบบก่อนจัดการ Route",
    ],
  },
  {
    id: "save-actions",
    title: "บันทึกและล้างทริป",
    details: [
      "บันทึก Route เพิ่มรายการใหม่ไว้ในรายการ Route ที่บันทึก",
      "ล้าง จะล้างทริปปัจจุบันและผลคำนวณจากอุปกรณ์นี้ ไม่ได้ลบรายการ Route ที่บันทึก",
      "ต้องเข้าสู่ระบบก่อนกดบันทึก; การคำนวณเส้นทางยังใช้งานได้โดยไม่เข้าสู่ระบบ",
    ],
  },
  {
    id: "share-route",
    title: "แชร์ Route",
    details: [
      "แชร์ข้อความชื่อ Route พร้อมลิงก์เส้นทาง Google Maps และลิงก์กลับเข้า Tikkie Trip",
      "ถ้าอุปกรณ์รองรับ จะเปิดเมนูแชร์ของระบบ; มิฉะนั้นจะคัดลอกข้อความให้",
      "ลิงก์แชร์เป็นทางลัดไปยังเว็บและ Google Maps ไม่ใช่ไฟล์สำรอง Route",
    ],
  },
  {
    id: "saved-routes",
    title: "เปิดหรือลบ Route ที่บันทึก",
    details: [
      "รายการแสดงชื่อ ต้นทาง ปลายทาง และสถานะว่ามีเส้นทางที่คำนวณไว้หรือไม่",
      "เปิด จะนำ Route นั้นกลับมาเป็นแผนปัจจุบัน; ลบ จะนำรายการออกหลังยืนยัน",
      "ต้องเข้าสู่ระบบก่อนเปิดหรือลบรายการ; Cloud Sync ช่วยใช้รายการเดียวกันข้ามอุปกรณ์",
    ],
  },
  {
    id: "route-files",
    title: "นำเข้าและส่งออก JSON",
    details: [
      "ส่งออก JSON ดาวน์โหลดไฟล์ข้อมูลทริปเพื่อสำรองหรือย้ายข้อมูล",
      "นำเข้า JSON ใช้ไฟล์สำรองที่ระบบสร้างไว้เพื่อเรียกข้อมูลกลับมา",
      "ทั้งสองคำสั่งต้องเข้าสู่ระบบก่อน และไฟล์นี้ไม่เก็บ API key",
    ],
  },
  {
    id: "cloud-sync",
    title: "Cloud Sync",
    details: [
      "Cloud Sync ต้องเข้าสู่ระบบ แล้วเลือกเปิดการซิงก์และยืนยันการเก็บ Route ในบัญชีของคุณ",
      "เมื่อเปิดแล้ว Route จะเก็บสำเนาในเบราว์เซอร์และซิงก์กับ Cloud; กด ซิงก์ตอนนี้ เพื่อรวมข้อมูลล่าสุด",
      "ถ้าเลือกเก็บเฉพาะเครื่อง ข้อมูลจะไม่ซิงก์ไปมือถือหรือคอมพิวเตอร์เครื่องอื่น",
    ],
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
      <button type="button" onClick={openGuide} title="เปิดคู่มือแนะนำการใช้งาน" aria-label="เปิดคู่มือแนะนำการใช้งาน" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface-container-low px-2 text-sm font-black text-primary-deep hover:bg-secondary-container sm:px-3">
        <CircleHelp className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">วิธีใช้</span>
      </button>
      {open ? createPortal(
        <>
          <div className={`fixed inset-0 z-[80] ${spotlight ? "" : "bg-primary/75"}`} aria-hidden="true" />
          {spotlight ? (
            <div className="pointer-events-none fixed z-[81] rounded-lg border-[3px] border-yellow" aria-hidden="true"
              style={{ ...spotlight, boxShadow: "0 0 0 100vmax rgba(3, 55, 45, 0.75)" }} />
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
            <ul id="tutorial-description" className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold leading-6">
              {step.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
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
