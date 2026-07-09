"use client";
import { motion } from "framer-motion";
import { useChronos, densityOf } from "@/lib/store";
import { daysInMonth, iso, todayIso, MONTH_NAMES } from "@/lib/date";
import { HOLIDAYS } from "@/lib/holidays";
import { useMemo } from "react";

const DENSITY_LIGHT = ["bg-black/[0.04]", "bg-blue-200", "bg-blue-400", "bg-blue-600", "bg-blue-800"];
const DENSITY_DARK = ["dark:bg-white/[0.06]", "dark:bg-blue-900", "dark:bg-blue-700", "dark:bg-blue-500", "dark:bg-blue-300"];

export default function YearView() {
  const year = useChronos((s) => s.year);
  const events = useChronos((s) => s.events);
  const zoomTo = useChronos((s) => s.zoomTo);
  const today = todayIso();

  const countByDate = useMemo(() => {
    const m: Record<string, number> = {};
    Object.values(events).forEach((e) => (m[e.date] = (m[e.date] || 0) + 1));
    return m;
  }, [events]);

  const importantByMonth = useMemo(() => {
    const m: Record<number, string[]> = {};
    Object.values(events)
      .filter((e) => e.important && e.date.startsWith(String(year)))
      .forEach((e) => {
        const mo = Number(e.date.slice(5, 7)) - 1;
        (m[mo] ||= []).push(e.title);
      });
    return m;
  }, [events, year]);

  return (
    <div className="h-full overflow-y-auto px-4 pb-28 pt-3 sm:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {MONTH_NAMES.map((name, m) => (
          <motion.button
            key={m}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            onClick={() => zoomTo(3, iso(year, m, 1))}
            className="group rounded-3xl border border-white/40 bg-white/55 p-4 text-left shadow-float backdrop-blur-xl
                       transition-shadow hover:shadow-float-lg
                       dark:border-white/10 dark:bg-white/[0.06]"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-display text-lg font-semibold tracking-tight text-ink dark:text-white">
                {name}
              </span>
              <span className="text-[11px] tabular-nums text-ink-soft/60 dark:text-white/40">
                {Object.keys(countByDate).filter((d) => d.startsWith(`${year}-${String(m + 1).padStart(2, "0")}`))
                  .reduce((a, d) => a + countByDate[d], 0)}件
              </span>
            </div>

            <div className="grid grid-cols-7 gap-[3px]">
              {Array.from({ length: new Date(year, m, 1).getDay() }).map((_, i) => (
                <div key={"sp" + i} />
              ))}
              {Array.from({ length: daysInMonth(year, m) }).map((_, i) => {
                const date = iso(year, m, i + 1);
                const dens = densityOf(countByDate[date] || 0);
                const isToday = date === today;
                const isHoliday = !!HOLIDAYS[date];
                return (
                  <div
                    key={date}
                    title={`${m + 1}/${i + 1}${HOLIDAYS[date] ? " " + HOLIDAYS[date] : ""}`}
                    className={`aspect-square rounded-[4px] transition-colors
                      ${DENSITY_LIGHT[dens]} ${DENSITY_DARK[dens]}
                      ${isToday ? "ring-2 ring-orange-500 ring-offset-1 ring-offset-transparent" : ""}
                      ${isHoliday && dens === 0 ? "!bg-red-100 dark:!bg-red-950/60" : ""}`}
                  />
                );
              })}
            </div>

            {(importantByMonth[m] || []).slice(0, 2).map((t) => (
              <div key={t} className="mt-2 flex items-center gap-1.5 truncate text-[11px] font-medium text-orange-600 dark:text-orange-400">
                <span className="inline-block h-1.5 w-1.5 flex-none rounded-full bg-orange-500" />
                {t}
              </div>
            ))}
          </motion.button>
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl items-center justify-end gap-2 text-[11px] text-ink-soft/60 dark:text-white/40">
        余裕
        {[0, 1, 2, 3, 4].map((d) => (
          <span key={d} className={`h-3 w-3 rounded-[3px] ${DENSITY_LIGHT[d]} ${DENSITY_DARK[d]}`} />
        ))}
        多忙
      </div>
    </div>
  );
}
