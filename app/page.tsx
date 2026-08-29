"use client";
import { useEffect } from "react";
import { useChronos } from "@/lib/store";
import ZoomCanvas from "@/components/ZoomCanvas";
import Chrome from "@/components/Chrome";
import Dashboard from "@/components/Dashboard";
import EventPageModal from "@/components/EventPageModal";
import SearchPalette from "@/components/SearchPalette";
import AuthGate from "@/components/AuthGate";

export default function Home() {
  const initAuth = useChronos((s) => s.initAuth);
  const authReady = useChronos((s) => s.authReady);
  const user = useChronos((s) => s.user);
  const loaded = useChronos((s) => s.loaded);

  useEffect(() => {
    initAuth();
    try {
      const t = localStorage.getItem("chronos-theme");
      if (t === "dark") useChronos.setState({ theme: "dark" });
    } catch {}
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }, [initAuth]);

  if (!authReady) {
    return (
      <main className="flex h-[100dvh] w-full items-center justify-center bg-paper text-ink dark:bg-[#0B0E14] dark:text-white">
        <span className="text-sm text-ink-soft/50 dark:text-white/40">読み込み中…</span>
      </main>
    );
  }

  if (!user) return <AuthGate />;

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-paper text-ink transition-colors dark:bg-[#0B0E14] dark:text-white">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-600/15" />
      <div className="pointer-events-none absolute -bottom-40 right-1/5 h-[420px] w-[420px] rounded-full bg-orange-300/20 blur-[120px] dark:bg-purple-600/10" />

      <Chrome />
      <div className="h-full pt-16">
        {loaded ? <ZoomCanvas /> : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft/50 dark:text-white/40">
            読み込み中…
          </div>
        )}
      </div>
      <Dashboard />
      <EventPageModal />
      <SearchPalette />
    </main>
  );
}
