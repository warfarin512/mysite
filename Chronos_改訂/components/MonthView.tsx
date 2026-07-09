"use client";
import { motion } from "framer-motion";
import { useChronos, eventsOn } from "@/lib/store";
import { daysInMonth, iso, todayIso, MONTH_NAMES, YOUBI } from "@/lib/date";
import { HOLIDAYS } from "@/lib/holidays";

export default function MonthView() {
  const year = useChronos((s) => s.year);
  const focusDate = useChronos((s) => s.focusDate);
  const events = useChronos((s) => s.events);
  const zoomTo = useChronos((s) => s.zoomTo);
  const setNewEventDate = useChronos((s) => s.setNewEventDate);
  const today = todayIso();

  const m = Number(focusDate.slice(5, 7)) - 1;
  const lead = new Date(year, m, 1).getDay();
  const ndays = daysInMonth(year, m);

  return (
    <div className="flex h-full flex-col px-4 pb-24 pt-2 sm:px-8">
      <h2 className="mx-auto mb-2 font-display text-2xl font-semibold tracking-tight text-ink dark:text-white">
        {year}年 {MONTH_NAMES[m]}
      </h2>
      <div className="mx-auto grid w-full max-w-6xl flex-none grid-cols-7 px-1 text-center text-[11px] font-medium text-ink-soft/50 dark:text-white/40">
        {YOUBI.map((w, i) => (
          <span key={w} className={i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""}>{w}</span>
        ))}
      </div>
      <div className="mx-auto mt-1 grid w-full max-w-6xl flex-1 grid-cols-7 gap-1.5 overflow-y-auto sm:gap-2">
        {Array.from({ length: lead }).map((_, i) => <div key={"s" + i} />)}
        {Array.from({ length: ndays }).map((_, i) => {
          const date = iso(year, m, i + 1);
          const list = eventsOn(events, date);
          const dow = (lead + i) % 7;
          const holiday = HOLIDAYS[date];
          return (
            <motion.div
              key={date}
              whileHover={{ y: -2, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`group flex min-h-[88px] cursor-pointer flex-col rounded-2xl border border-white/40 bg-white/55 p-2 shadow-sm backdrop-blur-md
                          hover:shadow-float dark:border-white/10 dark:bg-white/[0.05]
                          ${date === today ? "ring-2 ring-orange-500/80" : ""}`}
              onClick={() => zoomTo(5, date)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-semibold tabular-nums
                  ${dow === 0 || holiday ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-ink dark:text-white/90"}`}>
                  {i + 1}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setNewEventDate(date); }}
                  className="rounded-full px-1.5 text-[13px] leading-none text-ink-soft/40 opacity-0 transition-opacity hover:bg-blue-500/10 hover:text-blue-500 group-hover:opacity-100 dark:text-white/40"
                  aria-label="予定を追加"
                >＋</button>
              </div>
              {holiday && <span className="truncate text-[9px] font-medium text-red-500">{holiday}</span>}
              <div className="mt-1 flex flex-col gap-1">
                {list.slice(0, 3).map((e) => (
                  <span key={e.id} className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ background: e.color }}>
                    {e.time ? e.time + " " : ""}{e.title}
                  </span>
                ))}
                {list.length > 3 && (
                  <span className="text-[9px] text-ink-soft/50 dark:text-white/40">ほか{list.length - 3}件</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
