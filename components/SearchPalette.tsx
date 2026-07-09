"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChronos } from "@/lib/store";

export default function SearchPalette() {
  const open = useChronos((s) => s.searchOpen);
  const setOpen = useChronos((s) => s.setSearchOpen);
  const events = useChronos((s) => s.events);
  const setOpenEvent = useChronos((s) => s.setOpenEvent);
  const zoomTo = useChronos((s) => s.zoomTo);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 60); else setQ(""); }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return Object.values(events)
      .filter((e) =>
        e.title.toLowerCase().includes(query) ||
        e.memo.toLowerCase().includes(query) ||
        e.tags.some((t) => t.toLowerCase().includes(query)) ||
        e.checklist.some((c) => c.text.toLowerCase().includes(query))
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 12);
  }, [q, events]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/40 bg-white/85 shadow-float-lg backdrop-blur-2xl dark:border-white/10 dark:bg-[#14161D]/92"
          >
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4 dark:border-white/10">
              <span className="text-ink-soft/40 dark:text-white/40">🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="予定・タグ・メモを検索…"
                className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft/30 dark:text-white dark:placeholder:text-white/25"
              />
              <kbd className="rounded-md border border-black/10 px-1.5 py-0.5 text-[10px] text-ink-soft/50 dark:border-white/15 dark:text-white/40">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {q && results.length === 0 && (
                <p className="px-4 py-8 text-center text-[13px] text-ink-soft/40 dark:text-white/30">見つかりませんでした</p>
              )}
              {results.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setOpen(false); zoomTo(5, e.date); setOpenEvent(e.id); }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-blue-500/[0.07]"
                >
                  <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: e.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-ink dark:text-white">{e.title}</div>
                    {e.memo && <div className="truncate text-[12px] text-ink-soft/50 dark:text-white/40">{e.memo}</div>}
                  </div>
                  <span className="text-[12px] tabular-nums text-ink-soft/50 dark:text-white/40">
                    {Number(e.date.slice(5, 7))}/{Number(e.date.slice(8))}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
