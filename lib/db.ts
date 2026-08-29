import { supabase } from "./supabaseClient";
import type { EventPage } from "./types";

interface EventRow {
  id: string;
  date: string;
  time: string | null;
  end_time: string | null;
  title: string;
  tags: string[];
  memo: string;
  checklist: EventPage["checklist"];
  attachments: EventPage["attachments"];
  important: boolean;
  color: string;
  visibility: EventPage["visibility"];
  created_at: number;
  updated_at: number;
}

function rowToEvent(row: EventRow): EventPage {
  return {
    id: row.id,
    date: row.date,
    time: row.time ?? undefined,
    endTime: row.end_time ?? undefined,
    title: row.title,
    tags: row.tags,
    memo: row.memo,
    checklist: row.checklist,
    attachments: row.attachments,
    important: row.important,
    color: row.color,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function eventToRow(ev: EventPage): Omit<EventRow, "id"> & { id: string } {
  return {
    id: ev.id,
    date: ev.date,
    time: ev.time ?? null,
    end_time: ev.endTime ?? null,
    title: ev.title,
    tags: ev.tags,
    memo: ev.memo,
    checklist: ev.checklist,
    attachments: ev.attachments,
    important: ev.important,
    color: ev.color,
    visibility: ev.visibility,
    created_at: ev.createdAt,
    updated_at: ev.updatedAt,
  };
}

export async function loadAllEvents(): Promise<EventPage[]> {
  const { data, error } = await supabase.from("events").select("*");
  if (error) {
    console.error("loadAllEvents failed:", error.message);
    return [];
  }
  return (data as EventRow[]).map(rowToEvent);
}

export async function saveEvent(ev: EventPage): Promise<void> {
  const { error } = await supabase.from("events").upsert(eventToRow(ev));
  if (error) throw error;
}

export async function removeEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkInsertEvents(events: EventPage[]): Promise<void> {
  if (events.length === 0) return;
  const { error } = await supabase.from("events").upsert(events.map(eventToRow));
  if (error) throw error;
}
