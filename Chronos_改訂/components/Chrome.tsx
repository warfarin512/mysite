"use client";
import { motion } from "framer-motion";
import { useChronos } from "@/lib/store";
import { todayIso } from "@/lib/date";
import ExportButton from "./ExportButton";

const LEVEL_LABELS = ["年", "四半期", "月", "週", "日"];

export default function Chrome() {
  const year = useChronos((s) => s.year);
  const setYear = useChronos((s) => s.setYear);
  const targetZoom = useChronos((s) => s.targetZoom);
  const zoomTo = useChronos((s) => s.zoomTo);
  const setSearchOpen = useChronos((s) => s.setSearchOpen);
  const theme = useChronos((s) => s.theme);
  const toggleTheme = useChronos((s) => s.toggleTheme);

  const level = Math.round(targetZoom);

  return (
    <>
      <header className="pointer-events-auto fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/55 px-4 py-2 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
          <span className="font-display text-lg font-bold tracking-tight text-ink dark:text-white">Chronos</span>
          <span className="hidden text-[11px] text-ink-soft/50 dark:text-white/40 sm:inline">年間スケジュール</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-white/40 bg-white/55 px-2 py-1.5 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
            <IconBtn onClick={() => setYear(year - 1)}>‹</IconBtn>
            <span className="px-1 font-display text-[15px] font-semibold tabular-nums text-ink dark:text-white">{year}</span>
            <IconBtn onClick={() => setYear(year + 1)}>›</IconBtn>
          </div>
          <GlassBtn onClick={() => zoomTo(5, todayIso())}>今日</GlassBtn>
          <GlassBtn onClick={() => setSearchOpen(true)}>
            🔍 <kbd className="ml-1 hidden rounded border border-black/10 px-1 text-[9px] dark:border-white/20 sm:inline">⌘K</kbd>
          </GlassBtn>
          <ExportButton />
          <GlassBtn onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</GlassBtn>
        </div>
      </header>

      <nav className="pointer-events-auto fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/60 p-1.5 shadow-float-lg backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
          {LEVEL_LABELS.map((label, i) => (
            <button key={label} onClick={() => zoomTo(i + 1)} className="relative rounded-full px-4 py-1.5 text-[12px] font-medium">
              {level === i + 1 && (
                <motion.span
                  layoutId="zoom-pill"
                  className="absolute inset-0 rounded-full bg-ink dark:bg-white"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${level === i + 1 ? "text-white dark:text-ink" : "text-ink-soft dark:text-white/60"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-ink-soft/40 dark:text-white/30">
          スクロール / ピンチでズーム
        </p>
      </nav>
    </>
  );
}

function GlassBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="rounded-2xl border border-white/40 bg-white/55 px-3.5 py-2 text-[13px] font-medium text-ink shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
    >
      {children}
    </motion.button>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-7 w-7 rounded-xl text-ink-soft transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10">
      {children}
    </button>
  );
}
