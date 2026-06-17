"use client";
import { useChronos } from "@/lib/store";

/**
 * Discord同期用に events.json を書き出すボタン。
 * Chrome.tsx のボタン群に <ExportButton /> を1行足して使う。
 */
export default function ExportButton() {
  const events = useChronos((s) => s.events);

  const exportJson = () => {
    const arr = Object.values(events).map((e) => ({
      id: e.id,
      date: e.date,
      time: e.time || "",
      title: e.title,
      tags: e.tags,
      important: e.important,
    }));
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportJson}
      className="rounded-2xl border border-white/40 bg-white/55 px-3.5 py-2 text-[13px] font-medium text-ink shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
      title="Discord通知用に events.json を書き出す"
    >
      ⬇ 書き出し
    </button>
  );
}
