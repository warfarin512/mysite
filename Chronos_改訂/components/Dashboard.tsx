"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useChronos } from "@/lib/store";
import { todayIso, daysInMonth, fromIso } from "@/lib/date";

export default function Dashboard() {
  const events = useChronos((s) => s.events);
  const zoom = useChronos((s) => s.targetZoom);
  const setOpenEvent = useChronos((s) => s.setOpenEvent);
  const today = todayIso();

  const stats = useMemo(() => {
    const all = Object.values(events);
    const ym = today.slice(0, 7);
    const monthEvents = all.filter((e) => e.date.startsWith(ym));
    const upcoming = all
      .filter((e) => e.date >= today)
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    const next = upcoming[0] || null;
    const important = upcoming.filter((e) => e.important).slice(0, 3);
    const t = fromIso(today);
    const busyDays = new Set(monthEvents.map((e) => e.date)).size;
    const freeRate = Math.round((1 - busyDays / daysInMonth(t.getFullYear(), t.getMonth())) * 100);
    return { monthCount: monthEvents.length, next, freeRate, important };
  }, [events, today]);

  if (zoom > 1.4) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 26 }}
      className="pointer-events-auto fixed bottom-20 left-1/2 z-30 flex w-[min(94vw,800px)] -translate-x-1/2 gap-3 overflow-x-auto rounded-3xl border border-white/40 bg-white/55 p-3 shadow-float-lg backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] sm:bottom-24"
    >
      <Stat label="今月の予定" value={`${stats.monthCount}`} unit="件" />
      <Stat label="今月の空き時間率" value={`${stats.freeRate}`} unit="%" />
      <div className="min-w-[180px] flex-1 rounded-2xl bg-white/60 p-3 dark:bg-white/[0.05]">
        <div className="text-[10px] font-medium uppercase tracking-wider text-ink-soft/50 dark:text-white/40">次の予定</div>
        {stats.next ? (
          <button onClick={() => setOpenEvent(stats.next!.id)} className="mt-1 block w-full text-left">
            <div className="truncate text-[14px] font-semibold text-ink hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
              {stats.next.title}
            </div>
            <div className="text-[11px] tabular-nums text-ink-soft/60 dark:text-white/50">
              {Number(stats.next.date.slice(5, 7))}/{Number(stats.next.date.slice(8))} {stats.next.time || ""}
            </div>
          </button>
        ) : (
          <div className="mt-1 text-[13px] text-ink-soft/40 dark:text-white/30">予定なし</div>
        )}
      </div>
      <div className="min-w-[170px] flex-1 rounded-2xl bg-white/60 p-3 dark:bg-white/[0.05]">
        <div className="text-[10px] font-medium uppercase tracking-wider text-ink-soft/50 dark:text-white/40">重要イベント</div>
        {stats.important.length ? stats.important.map((e) => (
          <button key={e.id} onClick={() => setOpenEvent(e.id)}
            className="mt-1 flex w-full items-center gap-1.5 truncate text-left text-[12px] font-medium text-orange-600 hover:underline dark:text-orange-400">
            ★ {e.title}
          </button>
        )) : <div className="mt-1 text-[13px] text-ink-soft/40 dark:text-white/30">なし</div>}
      </div>
    </motion.aside>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="min-w-[120px] rounded-2xl bg-white/60 p-3 dark:bg-white/[0.05]">
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-soft/50 dark:text-white/40">{label}</div>
      <div className="mt-0.5 font-display text-2xl font-bold tabular-nums tracking-tight text-ink dark:text-white">
        {value}<span className="ml-0.5 text-[12px] font-medium text-ink-soft/50 dark:text-white/40">{unit}</span>
      </div>
    </div>
  );
}
