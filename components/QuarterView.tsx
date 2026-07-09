"use client";
import { motion } from "framer-motion";
import { useChronos, eventsOn } from "@/lib/store";
import { daysInMonth, iso, todayIso, MONTH_NAMES, YOUBI } from "@/lib/date";
import { HOLIDAYS } from "@/lib/holidays";

export default function QuarterView() {
  const year = useChronos((s) => s.year);
  const focusDate = useChronos((s) => s.focusDate);
  const events = useChronos((s) => s.events);
  const zoomTo = useChronos((s) => s.zoomTo);
  const today = todayIso();

  const focusMonth = Number(focusDate.slice(5, 7)) - 1;
  const qStart = Math.floor(focusMonth / 3) * 3;
  const months = [qStart, qStart + 1, qStart + 2];

  return (
    <div className="h-full overflow-y-auto px-4 pb-28 pt-3 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
        {months.map((m) => (
          <motion.div
            key={m}
            whileHover={{ y: -3 }}
            className="rounded-3xl border border-white/40 bg-white/55 p-5 shadow-float backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]"
          >
            <button
              onClick={() => zoomTo(3, iso(year, m, 1))}
              className="mb-3 font-display text-xl font-semibold tracking-tight text-ink hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
            >
              {year}年 {MONTH_NAMES[m]}
            </button>
            <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium text-ink-soft/50 dark:text-white/40">
              {YOUBI.map((w) => <span key={w}>{w}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(year, m, 1).getDay() }).map((_, i) => <div key={"s" + i} />)}
              {Array.from({ length: daysInMonth(year, m) }).map((_, i) => {
                const date = iso(year, m, i + 1);
                const list = eventsOn(events, date);
                const dow = new Date(year, m, i + 1).getDay();
                const holiday = !!HOLIDAYS[date];
                return (
                  <button
                    key={date}
                    onClick={() => zoomTo(4, date)}
                    className={`relative aspect-square rounded-lg text-[12px] tabular-nums transition-colors
                      hover:bg-blue-500/10
                      ${date === today ? "bg-orange-500 font-bold !text-white" : ""}
                      ${dow === 0 || holiday ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-ink dark:text-white/80"}`}
                  >
                    {i + 1}
                    {list.length > 0 && (
                      <span className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                        {list.slice(0, 3).map((e) => (
                          <span key={e.id} className="h-1 w-1 rounded-full" style={{ background: e.color }} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
