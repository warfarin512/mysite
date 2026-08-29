import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です");
  process.exit(1);
}
if (!WEBHOOK) {
  console.error("DISCORD_WEBHOOK_URL が未設定です");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const now = new Date();
const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const y = jst.getUTCFullYear();
const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
const d = String(jst.getUTCDate()).padStart(2, "0");
const today = `${y}-${m}-${d}`;
const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
const dow = YOUBI[jst.getUTCDay()];

const { data: events, error } = await supabase
  .from("events")
  .select("*")
  .eq("date", today)
  .order("time", { ascending: true, nullsFirst: false });

if (error) {
  console.error("Supabaseからの取得に失敗しました:", error.message);
  process.exit(1);
}

const todays = (events ?? []).slice().sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));

let content;
if (todays.length === 0) {
  content = `**📅 ${Number(m)}月${Number(d)}日（${dow}）**\n今日の予定はありません。よい一日を。`;
} else {
  const lines = todays.map((e) => {
    const star = e.important ? "⭐" : "📌";
    const time = e.time && e.end_time
      ? `\`${e.time} — ${e.end_time}\``
      : e.time
      ? `\`${e.time}\``
      : "";
    const tags = e.tags && e.tags.length ? `〔${e.tags.join(" / ")}〕` : "";
    const memo = e.memo ? `\n　　📝 ${e.memo.replace(/\n/g, " / ").replace(/\/ $/, "").trim()}` : "";
    const checks = e.checklist && e.checklist.length
      ? `\n　　✅ ${e.checklist.filter((c) => c.done).length}/${e.checklist.length} 完了`
      : "";
    return `${star} ${time} **${e.title}** ${tags}${memo}${checks}`;
  });
  content = `**📅 ${Number(m)}月${Number(d)}日（${dow}）の予定（${todays.length}件）**\n\n` + lines.join("\n\n");
}

const res = await fetch(WEBHOOK, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content, username: "Chronos" }),
});

if (!res.ok) {
  console.error("Discord 送信失敗:", res.status, await res.text());
  process.exit(1);
}
console.log(`送信完了: ${today} / ${todays.length}件`);
