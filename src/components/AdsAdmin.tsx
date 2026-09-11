"use client";

import { Eye, EyeOff, LoaderCircle, LogOut, Save } from "lucide-react";
import { useEffect, useState } from "react";

type AdminAdResponse = {
  config: { enabled: boolean; script: string; updatedAt: string | null };
  storageReady: boolean;
};

export function AdsAdmin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [script, setScript] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadConfig() {
    const response = await fetch("/api/admin/ads", { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }

    const result = (await response.json()) as AdminAdResponse;
    setAuthenticated(true);
    setScript(result.config.script);
    setEnabled(result.config.enabled);
    setStorageReady(result.storageReady);
    setUpdatedAt(result.config.updatedAt);
  }

  useEffect(() => {
    void loadConfig();
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setMessage(result.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    setPassword("");
    await loadConfig();
  }

  async function saveConfig() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/ads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, script }),
    });
    const result = (await response.json()) as { error?: string; config?: AdminAdResponse["config"] };
    setBusy(false);

    if (!response.ok) {
      setMessage(result.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    setUpdatedAt(result.config?.updatedAt ?? null);
    setMessage("บันทึกและเผยแพร่สคริปต์โฆษณาแล้ว");
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
        <h1 className="text-xl font-black text-primary-deep">เข้าสู่ระบบจัดการโฆษณา</h1>
        <label className="mt-5 block text-sm font-black text-primary-deep">
          รหัสผ่าน Admin
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-border px-3" />
        </label>
        {message ? <p className="mt-3 text-sm font-bold text-danger">{message}</p> : null}
        <button disabled={busy} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-black text-yellow disabled:opacity-60">
          {busy ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null} เข้าสู่ระบบ
        </button>
      </form>
    );
  }

  return (
    <section className="w-full max-w-4xl rounded-lg border border-border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-primary-deep">จัดการโฆษณา</h1>
          <p className="mt-1 text-sm font-semibold text-muted">รองรับโค้ดจาก Ads Network ที่มี HTML และ script</p>
        </div>
        <button type="button" onClick={() => void logout()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-black text-primary">
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

      <label className="mt-5 block text-sm font-black text-primary-deep">
        Script จาก Ads Network
        <textarea value={script} onChange={(event) => setScript(event.target.value)} rows={14} spellCheck={false}
          placeholder={'<script async src="https://..."></script>'}
          className="mt-2 w-full resize-y rounded-lg border border-border p-3 font-mono text-sm font-normal leading-6" />
      </label>
      <p className="mt-2 text-xs font-semibold text-muted">พื้นที่หน้าเว็บ: มือถือ 320 × 100 px และเดสก์ท็อป 728 × 90 px</p>
      {updatedAt ? <p className="mt-1 text-xs font-semibold text-muted">บันทึกล่าสุด: {new Date(updatedAt).toLocaleString("th-TH")}</p> : null}
      {message ? <p className={`mt-3 text-sm font-bold ${message.includes("แล้ว") ? "text-success" : "text-danger"}`}>{message}</p> : null}

      <button type="button" onClick={() => void saveConfig()} disabled={busy || !storageReady}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-black text-yellow disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} บันทึกโฆษณา
      </button>
    </section>
  );
}
