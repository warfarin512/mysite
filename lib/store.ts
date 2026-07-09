"use client";
import { create } from "zustand";
import type { EventPage, TagDef } from "./types";
import { loadAllEvents, saveEvent, removeEvent } from "./db";
import { todayIso } from "./date";

export const TAGS: TagDef[] = [
  { name: "仕事", color: "#3B82F6" },
  { name: "プライベート", color: "#10B981" },
  { name: "健康", color: "#14B8A6" },
  { name: "重要", color: "#F97316" },
  { name: "学習", color: "#8B5CF6" },
];

interface ChronosState {
  zoom: number;
  targetZoom: number;
  focusDate: string;
  year: number;
  events: Record<string, EventPage>;
  loaded: boolean;
  openEventId: string | null;
  newEventDate: string | null;
  searchOpen: boolean;
  theme: "light" | "dark";

  setZoom: (z: number) => void;
  setTargetZoom: (z: number) => void;
  zoomTo: (level: number, focus?: string) => void;
  setFocusDate: (d: string) => void;
  setYear: (y: number) => void;
  hydrate: () => Promise<void>;
  upsertEvent: (ev: EventPage) => void;
  deleteEvent: (id: string) => void;
  setOpenEvent: (id: string | null) => void;
  setNewEventDate: (d: string | null) => void;
  setSearchOpen: (b: boolean) => void;
  toggleTheme: () => void;
}

export const useChronos = create<ChronosState>((set, get) => ({
  zoom: 1,
  targetZoom: 1,
  focusDate: todayIso(),
  year: new Date().getFullYear(),
  events: {},
  loaded: false,
  openEventId: null,
  newEventDate: null,
  searchOpen: false,
  theme: "light",

  setZoom: (z) => set({ zoom: Math.min(5, Math.max(1, z)) }),
  setTargetZoom: (z) => set({ targetZoom: Math.min(5, Math.max(1, z)) }),
  zoomTo: (level, focus) =>
    set((s) => ({
      targetZoom: Math.min(5, Math.max(1, level)),
      focusDate: focus ?? s.focusDate,
    })),
  setFocusDate: (d) => set({ focusDate: d }),
  setYear: (y) => set({ year: y }),

  hydrate: async () => {
    const list = await loadAllEvents();
    const map: Record<string, EventPage> = {};
    list.forEach((e) => (map[e.id] = e));
    set({ events: map, loaded: true });
  },

  upsertEvent: (ev) => {
    set((s) => ({ events: { ...s.events, [ev.id]: ev } }));
    void saveEvent(ev);
  },

  deleteEvent: (id) => {
    set((s) => {
      const next = { ...s.events };
      delete next[id];
      return { events: next, openEventId: s.openEventId === id ? null : s.openEventId };
    });
    void removeEvent(id);
  },

  setOpenEvent: (id) => set({ openEventId: id }),
  setNewEventDate: (d) => set({ newEventDate: d }),
  setSearchOpen: (b) => set({ searchOpen: b }),
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
      try { localStorage.setItem("chronos-theme", next); } catch {}
    }
  },
}));

export function eventsOn(events: Record<string, EventPage>, date: string): EventPage[] {
  return Object.values(events)
    .filter((e) => e.date === date)
    .sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
}

export function densityOf(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}
