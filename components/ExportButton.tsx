"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useChronos } from "@/lib/store";

export default function ExportButton() {
  const events = useChronos((s) => s.events);
  const [done, setDone] = useState(false);

  const exportJson = () => {
    const arr = Object.values(events).map((e) => ({
      id: e.id, date: e.date, time: e.time || "", endTime: e.endTime || "",
      title: e.title, tags: e.tags, memo: e.memo,
      checklist: e.checklist, important: e.important,
    }));
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "events.json"; a.click();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
      onClick={exportJson}
      className="rounded-2xl border border-white/40 bg-white/55 px-3.5 py-2 text-[13px] font-medium text-ink shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
      title="Discord通知用に events.json を書き出す"
    >
      {done ? "✓ 書き出しました" : "⬇ 書き出し"}
    </motion.button>
  );
}
