"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChronos, TAGS } from "@/lib/store";
import type { EventPage, ChecklistItem, Attachment } from "@/lib/types";
import { fromIso, YOUBI } from "@/lib/date";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export default function EventPageModal() {
  const openEventId = useChronos((s) => s.openEventId);
  const newEventDate = useChronos((s) => s.newEventDate);
  const events = useChronos((s) => s.events);
  const setOpenEvent = useChronos((s) => s.setOpenEvent);
  const setNewEventDate = useChronos((s) => s.setNewEventDate);
  const upsertEvent = useChronos((s) => s.upsertEvent);
  const deleteEvent = useChronos((s) => s.deleteEvent);

  const editing = openEventId ? events[openEventId] : null;
  const visible = !!editing || !!newEventDate;

  const [draft, setDraft] = useState<EventPage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setDraft({ ...editing, checklist: [...editing.checklist], attachments: [...editing.attachments], tags: [...editing.tags] });
    else if (newEventDate)
      setDraft({
        id: uid(), date: newEventDate, title: "", tags: [], memo: "",
        checklist: [], attachments: [], important: false,
        color: TAGS[0].color, createdAt: Date.now(), updatedAt: Date.now(),
      });
    else setDraft(null);
  }, [editing, newEventDate]);

  const close = () => { setOpenEvent(null); setNewEventDate(null); };

  const save = () => {
    if (!draft || !draft.title.trim()) return;
    upsertEvent({ ...draft, title: draft.title.trim(), updatedAt: Date.now() });
    close();
  };

  const toggleTag = (name: string, color: string) => {
    if (!draft) return;
    const has = draft.tags.includes(name);
    const tags = has ? draft.tags.filter((t) => t !== name) : [...draft.tags, name];
    setDraft({ ...draft, tags, color: tags.length ? TAGS.find((t) => t.name === tags[0])!.color : color });
  };

  const addCheck = () => draft && setDraft({ ...draft, checklist: [...draft.checklist, { id: uid(), text: "", done: false }] });
  const setCheck = (c: ChecklistItem) =>
    draft && setDraft({ ...draft, checklist: draft.checklist.map((x) => (x.id === c.id ? c : x)) });
  const delCheck = (id: string) =>
    draft && setDraft({ ...draft, checklist: draft.checklist.filter((x) => x.id !== id) });

  const onFiles = async (files: FileList | null) => {
    if (!files || !draft) return;
    const list: Attachment[] = [];
    for (const f of Array.from(files)) {
      if (f.size > 2 * 1024 * 1024) { alert(`${f.name} は2MBを超えるため添付できません`); continue; }
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      list.push({ id: uid(), name: f.name, type: f.type, size: f.size, dataUrl });
    }
    setDraft({ ...draft, attachments: [...draft.attachments, ...list] });
  };

  if (!draft) return null;
  const d = fromIso(draft.date);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={close}
        >
          <motion.div
            initial={{ y: 60, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/40 bg-white/80 p-6 shadow-float-lg backdrop-blur-2xl
                       dark:border-white/10 dark:bg-[#14161D]/90 sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between text-[13px] text-ink-soft/60 dark:text-white/50">
              <span className="tabular-nums">
                {d.getFullYear()}年{d.getMonth() + 1}月{d.getDate()}日（{YOUBI[d.getDay()]}）
              </span>
              <button onClick={close} className="rounded-full px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10">✕</button>
            </div>

            <input
              autoFocus={!editing}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="無題の予定"
              className="w-full bg-transparent font-display text-3xl font-bold tracking-tight text-ink outline-none placeholder:text-ink-soft/25 dark:text-white dark:placeholder:text-white/20"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input type="time" value={draft.time || ""}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                className="rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-[13px] dark:border-white/15 dark:bg-white/10 dark:text-white" />
              <span className="text-ink-soft/40 dark:text-white/30">—</span>
              <input type="time" value={draft.endTime || ""}
                onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                className="rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-[13px] dark:border-white/15 dark:bg-white/10 dark:text-white" />
              <button
                onClick={() => setDraft({ ...draft, important: !draft.important })}
                className={`rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors
                  ${draft.important ? "bg-orange-500 text-white" : "border border-black/10 text-ink-soft dark:border-white/15 dark:text-white/60"}`}
              >★ 重要</button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <button key={t.name} onClick={() => toggleTag(t.name, t.color)}
                  className="rounded-full px-3 py-1 text-[12px] font-medium transition-all"
                  style={draft.tags.includes(t.name)
                    ? { background: t.color, color: "#fff" }
                    : { border: `1.5px solid ${t.color}55`, color: t.color }}>
                  #{t.name}
                </button>
              ))}
            </div>

            <textarea
              value={draft.memo}
              onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
              placeholder="メモを書く…（このページに何でも記録できます）"
              rows={4}
              className="mt-5 w-full resize-none rounded-2xl border border-black/[0.07] bg-white/60 p-4 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/30 focus:border-blue-400/60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/90"
            />

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-soft dark:text-white/60">チェックリスト</span>
                <button onClick={addCheck} className="text-[12px] font-medium text-blue-600 hover:underline dark:text-blue-400">＋ 項目を追加</button>
              </div>
              <div className="flex flex-col gap-1.5">
                {draft.checklist.map((c) => (
                  <div key={c.id} className="group flex items-center gap-2.5">
                    <button
                      onClick={() => setCheck({ ...c, done: !c.done })}
                      className={`h-5 w-5 flex-none rounded-md border-2 text-[11px] leading-none text-white transition-all
                        ${c.done ? "border-blue-500 bg-blue-500" : "border-ink-soft/30 dark:border-white/30"}`}
                    >{c.done ? "✓" : ""}</button>
                    <input value={c.text}
                      onChange={(e) => setCheck({ ...c, text: e.target.value })}
                      placeholder="やること"
                      className={`flex-1 bg-transparent text-[14px] outline-none dark:text-white/90
                        ${c.done ? "text-ink-soft/40 line-through dark:text-white/30" : "text-ink"}`} />
                    <button onClick={() => delCheck(c.id)}
                      className="text-[12px] text-ink-soft/30 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:text-white/30">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-soft dark:text-white/60">添付ファイル</span>
                <button onClick={() => fileRef.current?.click()} className="text-[12px] font-medium text-blue-600 hover:underline dark:text-blue-400">＋ ファイルを追加</button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.attachments.map((a) => (
                  <span key={a.id} className="group flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white/60 px-3 py-1.5 text-[12px] dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80">
                    📎 <a href={a.dataUrl} download={a.name} className="max-w-[160px] truncate hover:underline">{a.name}</a>
                    <button onClick={() => setDraft({ ...draft, attachments: draft.attachments.filter((x) => x.id !== a.id) })}
                      className="text-ink-soft/30 hover:text-red-500 dark:text-white/30">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.96 }} onClick={save}
                disabled={!draft.title.trim()}
                className="flex-1 rounded-2xl bg-ink py-3 text-[14px] font-semibold text-white shadow-float transition-opacity disabled:opacity-30 dark:bg-white dark:text-ink">
                {editing ? "更新する" : "ページを作成"}
              </motion.button>
              {editing && (
                <button onClick={() => { deleteEvent(draft.id); close(); }}
                  className="rounded-2xl border border-red-500/30 px-5 py-3 text-[14px] font-medium text-red-500 hover:bg-red-500/5">
                  削除
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
