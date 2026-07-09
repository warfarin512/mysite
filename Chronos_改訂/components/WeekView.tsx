"use client";
import { motion } from "framer-motion";
import { useChronos, eventsOn } from "@/lib/store";
import { weekDates, todayIso, YOUBI, fromIso } from "@/lib/date";
import { HOLIDAYS } from "@/lib/holidays";

export default function WeekView() {
  const focusDate = useChronos((s) => s.focusDate);
  const events = useChronos((s) => s.events);
  const zoomTo = useChronos((s) => s.zoomTo);
  const setNewEventDate = useChronos((s) => s.setNewEventDate);
  const setOpenEvent = useChronos((s) => s.setOpenEvent);
  const today = todayIso();
  const dates = weekDates(focusDate);

  const first = fromIso(dates[0]);
  const last = fromIso(dates[6]);

  return (
    <div className="flex h-full flex-col px-4 pb-24 pt-2 sm:px-8">
      <h2 className="mx-auto mb-3 font-display text-2xl font-semibold tracking-tight text-ink dark:text-white">
        {first.getMonth() + 1}/{first.getDate()} — {last.getMonth() + 1}/{last.getDate()}
      </h2>
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-7">
        {dates.map((date, i) => {
          const list = eventsOn(events, date);
          const d = fromIso(date);
          const holiday = HOLIDAYS[date];
          return (
            <motion.div
              key={date}
              whileHover={{ y: -2 }}
              className={`flex min-h-[120px] flex-col rounded-2xl border border-white/40 bg-white/55 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]
                          ${date === today ? "ring-2 ring-orange-500/80" : ""}`}
            >
              <button onClick={() => zoomTo(5, date)} className="mb-2 text-left">
                <div className={`text-[11px] font-medium
                  ${i === 0 || holiday ? "text-red-500" : i === 6 ? "text-blue-500" : "text-ink-soft/60 dark:text-white/50"}`}>
                  {YOUBI[i]} {holiday && <span>· {holiday}</span>}
                </div>
                <div className="font-display text-xl font-semibold tabular-nums text-ink dark:text-white">
                  {d.getDate()}
                </div>
              </button>
              <div className="flex flex-1 flex-col gap-1.5">
                {list.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setOpenEvent(e.id)}
                    className="truncate rounded-lg px-2 py-1 text-left text-[11px] font-medium text-white shadow-sm transition-transform hover:scale-[1.03]"
                    style={{ background: e.color }}
                  >
                    {e.time ? e.time + " " : ""}{e.title}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setNewEventDate(date)}
                className="mt-2 rounded-lg py-1 text-[11px] text-ink-soft/40 transition-colors hover:bg-blue-500/10 hover:text-blue-500 dark:text-white/30"
              >＋ 追加</button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
