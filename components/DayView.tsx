"use client";
import { motion } from "framer-motion";
import { useChronos, eventsOn } from "@/lib/store";
import { fromIso, todayIso, YOUBI, addDays } from "@/lib/date";
import { HOLIDAYS } from "@/lib/holidays";

export default function DayView() {
  const focusDate = useChronos((s) => s.focusDate);
  const events = useChronos((s) => s.events);
  const setFocusDate = useChronos((s) => s.setFocusDate);
  const setOpenEvent = useChronos((s) => s.setOpenEvent);
  const setNewEventDate = useChronos((s) => s.setNewEventDate);

  const d = fromIso(focusDate);
  const list = eventsOn(events, focusDate);
  const holiday = HOLIDAYS[focusDate];
  const isToday = focusDate === todayIso();

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-4 pb-28 pt-2">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <NavBtn onClick={() => setFocusDate(addDays(focusDate, -1))}>‹</NavBtn>
        <div className="text-center">
          <div className="font-display text-3xl font-semibold tracking-tight text-ink dark:text-white">
            {d.getMonth() + 1}月{d.getDate()}日
            <span className="ml-2 text-base font-normal text-ink-soft/60 dark:text-white/50">
              ({YOUBI[d.getDay()]})
            </span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-2 text-[12px]">
            {isToday && <span className="rounded-full bg-orange-500 px-2 py-0.5 font-medium text-white">今日</span>}
            {holiday && <span className="rounded-full bg-red-500/90 px-2 py-0.5 font-medium text-white">{holiday}</span>}
          </div>
        </div>
        <NavBtn onClick={() => setFocusDate(addDays(focusDate, 1))}>›</NavBtn>
      </div>

      <div className="mt-6 flex w-full max-w-2xl flex-col gap-3">
        {list.length === 0 && (
          <div className="rounded-3xl border border-dashed border-ink-soft/20 p-10 text-center text-sm text-ink-soft/50 dark:border-white/15 dark:text-white/40">
            予定はありません。静かな一日です。
          </div>
        )}
        {list.map((e, i) => (
          <motion.button
            key={e.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => setOpenEvent(e.id)}
            className="flex items-start gap-4 rounded-3xl border border-white/40 bg-white/60 p-5 text-left shadow-float backdrop-blur-xl hover:shadow-float-lg dark:border-white/10 dark:bg-white/[0.07]"
          >
            <div className="flex flex-col items-center">
              <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />
              {e.time && <span className="mt-1 text-[12px] tabular-nums text-ink-soft/70 dark:text-white/60">{e.time}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-lg font-semibold text-ink dark:text-white">{e.title}</span>
                {e.important && <span className="text-orange-500">★</span>}
              </div>
              {e.memo && <p className="mt-1 line-clamp-2 text-[13px] text-ink-soft/70 dark:text-white/50">{e.memo}</p>}
              {e.checklist.length > 0 && (
                <p className="mt-1.5 text-[12px] text-ink-soft/60 dark:text-white/40">
                  ✓ {e.checklist.filter((c) => c.done).length}/{e.checklist.length} 完了
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.tags.map((t) => (
                  <span key={t} className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] text-ink-soft dark:bg-white/10 dark:text-white/60">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
        <button
          onClick={() => setNewEventDate(focusDate)}
          className="rounded-3xl border border-blue-500/30 bg-blue-500/5 py-3.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/10 dark:text-blue-400"
        >
          ＋ 予定ページを作成
        </button>
      </div>
    </div>
  );
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="h-11 w-11 rounded-full border border-white/40 bg-white/60 text-xl shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
    >
      {children}
    </motion.button>
  );
}
