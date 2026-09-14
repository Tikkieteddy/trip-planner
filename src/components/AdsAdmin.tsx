"use client";

import { Eye, EyeOff, LoaderCircle, LogOut, Save } from "lucide-react";
import { useEffect, useState } from "react";

type AdminAdResponse = {
  config: { enabled: boolean; mobileScript: string; desktopScript: string; updatedAt: string | null };
  storageReady: boolean;
};

type AdminSetup = { passwordReady: boolean; sessionReady: boolean; storageConfigured: boolean };

export function AdsAdmin({ setup }: { setup: AdminSetup }) {
  const loginReady = setup.passwordReady && setup.sessionReady;
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [mobileScript, setMobileScript] = useState("");
  const [desktopScript, setDesktopScript] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<"mobile" | "desktop">("mobile");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadConfig() {
    try {
      const response = await fetch("/api/admin/ads", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!response.ok) throw new Error("อ่านข้อมูลโฆษณาไม่สำเร็จ กรุณาลองใหม่");

      const result = (await response.json()) as AdminAdResponse;
      setAuthenticated(true);
      setMobileScript(result.config.mobileScript);
      setDesktopScript(result.config.desktopScript);
      setEnabled(result.config.enabled);
      setStorageReady(result.storageReady);
      setUpdatedAt(result.config.updatedAt);
    } catch {
      setAuthenticated(false);
      setMessage("อ่านข้อมูลโฆษณาไม่สำเร็จ กรุณาลองใหม่");
    }
  }

  useEffect(() => {
    void loadConfig();
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      setPassword("");
      await loadConfig();
    } catch {
      setMessage("เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  async function saveConfig() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, mobileScript, desktopScript }),
      });
      const result = (await response.json()) as { error?: string; config?: AdminAdResponse["config"] };

      if (!response.ok) {
        setMessage(result.error ?? "บันทึกไม่สำเร็จ");
        return;
      }

      setUpdatedAt(result.config?.updatedAt ?? null);
      setMessage(enabled ? "บันทึกและเผยแพร่โฆษณาแล้ว" : "บันทึกแล้ว โฆษณายังปิดอยู่");
    } catch {
      setMessage("เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
  }

  if (authenticated === null) {
    return <LoaderCircle className="size-7 animate-spin text-primary" aria-label="กำลังโหลด" />;
  }

  if (!authenticated) {
    return (
      <form onSubmit={login} className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase text-primary">Tikkie Trip CMS</p>
        <h1 className="mt-1 text-xl font-black text-primary-deep">เข้าสู่ระบบจัดการเว็บไซต์</h1>
        {!loginReady ? (
          <div role="status" className="mt-5 rounded-lg border border-warning/30 bg-yellow-50 p-3 text-sm font-bold leading-6 text-primary-deep">
            <p>CMS ยังไม่พร้อมใช้งาน กรุณาตั้งค่าใน Vercel Production แล้ว deploy ใหม่:</p>
            <ul className="mt-2 list-inside list-disc font-mono text-xs">
              {!setup.passwordReady ? <li>ADS_ADMIN_PASSWORD (อย่างน้อย 10 ตัวอักษร)</li> : null}
              {!setup.sessionReady ? <li>ADS_ADMIN_SESSION_SECRET (อย่างน้อย 32 ตัวอักษร)</li> : null}
            </ul>
          </div>
        ) : null}
        {!setup.storageConfigured ? (
          <p className="mt-3 text-xs font-semibold leading-5 text-muted">การบันทึกโฆษณายังต้องเชื่อม Upstash Redis กับโปรเจกต์นี้</p>
        ) : null}
        <label className="mt-5 block text-sm font-black text-primary-deep">
          รหัสผ่าน Admin
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!loginReady} autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-border px-3" />
        </label>
        {message ? <p className="mt-3 text-sm font-bold text-danger">{message}</p> : null}
        <button disabled={busy || !loginReady} title="เข้าสู่ระบบจัดการเว็บไซต์" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-black text-yellow disabled:opacity-60">
          {busy ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null} เข้าสู่ระบบ
        </button>
      </form>
    );
  }

  return (
    <section className="w-full max-w-4xl rounded-lg border border-border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-primary">Tikkie Trip CMS</p>
          <h1 className="mt-1 text-xl font-black text-primary-deep">จัดการโฆษณา</h1>
          <p className="mt-1 text-sm font-semibold text-muted">กำหนดโค้ดโฆษณาแยกตามขนาดหน้าจอ</p>
        </div>
        <button type="button" onClick={() => void logout()} title="ออกจากระบบ CMS" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-black text-primary">
          <LogOut className="size-4" /> ออกจากระบบ
        </button>
      </div>

      <div className={`mt-5 rounded-lg border p-3 text-sm font-bold ${storageReady ? "border-success/25 bg-green-50 text-success" : "border-warning/25 bg-yellow-50 text-warning"}`}>
        {storageReady ? "เชื่อมพื้นที่จัดเก็บแล้ว" : "ยังไม่ได้เชื่อม Upstash Redis จึงยังบันทึกการเปลี่ยนแปลงไม่ได้"}
      </div>

      <label className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3 font-black text-primary-deep">
        <span className="inline-flex items-center gap-2">{enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />} เปิดแสดงโฆษณา</span>
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-5 accent-primary" />
      </label>

      <div className="mt-5 grid gap-5">
        <label className="block text-sm font-black text-primary-deep">
          โค้ดโฆษณามือถือ (320 × 100 px)
          <textarea value={mobileScript} onChange={(event) => setMobileScript(event.target.value)} rows={7} spellCheck={false}
            placeholder={'<script async src="https://..."></script>'}
            className="mt-2 w-full resize-y rounded-lg border border-border p-3 font-mono text-sm font-normal leading-6" />
        </label>
        <label className="block text-sm font-black text-primary-deep">
          โค้ดโฆษณาเดสก์ท็อป (728 × 90 px)
          <textarea value={desktopScript} onChange={(event) => setDesktopScript(event.target.value)} rows={7} spellCheck={false}
            placeholder={'<script async src="https://..."></script>'}
            className="mt-2 w-full resize-y rounded-lg border border-border p-3 font-mono text-sm font-normal leading-6" />
        </label>
      </div>
      <p className="mt-2 text-xs font-semibold text-muted">เปิดแสดงผลได้เมื่อใส่โค้ดทั้งสองขนาด โค้ดจากผู้ให้บริการจะทำงานบนหน้าเว็บจริงเท่านั้น</p>
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black text-primary-deep">ตัวอย่างพื้นที่โฆษณา</h2>
          <div className="inline-flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="เลือกขนาดตัวอย่างโฆษณา">
            <button type="button" onClick={() => setPreviewSize("mobile")} title="ดูพื้นที่โฆษณาบนมือถือ" aria-pressed={previewSize === "mobile"} className={`rounded-md px-3 py-1 text-xs font-bold ${previewSize === "mobile" ? "bg-yellow text-primary-deep" : "text-muted"}`}>มือถือ</button>
            <button type="button" onClick={() => setPreviewSize("desktop")} title="ดูพื้นที่โฆษณาบนเดสก์ท็อป" aria-pressed={previewSize === "desktop"} className={`rounded-md px-3 py-1 text-xs font-bold ${previewSize === "desktop" ? "bg-yellow text-primary-deep" : "text-muted"}`}>เดสก์ท็อป</button>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <div className={`flex items-center justify-center border border-dashed border-border bg-background text-xs font-bold text-muted ${previewSize === "mobile" ? "h-[100px] w-[320px]" : "h-[90px] w-[728px]"}`}>
            {previewSize === "mobile" ? "320 × 100 px" : "728 × 90 px"} · {(previewSize === "mobile" ? mobileScript : desktopScript).trim() ? "มีโค้ดแล้ว" : "ยังไม่มีโค้ด"}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">ตัวอย่างแสดงขนาดเท่านั้น ไม่รันโค้ดโฆษณา</p>
      </div>
      {updatedAt ? <p className="mt-1 text-xs font-semibold text-muted">บันทึกล่าสุด: {new Date(updatedAt).toLocaleString("th-TH")}</p> : null}
      {message ? <p role="status" className={`mt-3 text-sm font-bold ${message.startsWith("บันทึก") ? "text-success" : "text-danger"}`}>{message}</p> : null}

      <button type="button" onClick={() => void saveConfig()} disabled={busy || !storageReady || (enabled && (!mobileScript.trim() || !desktopScript.trim()))} title="บันทึกและเผยแพร่การตั้งค่าโฆษณา"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-black text-yellow disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} บันทึกโฆษณา
      </button>
    </section>
  );
}
