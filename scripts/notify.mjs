// 毎朝 GitHub Actions から実行され、その日の予定を Discord Webhook に送る。
// 予定データはリポジトリ直下の events.json から読む（アプリの「書き出す」ボタンで更新）。

import { readFileSync } from "node:fs";

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
if (!WEBHOOK) {
  console.error("DISCORD_WEBHOOK_URL が未設定です（GitHub Secrets を確認）");
  process.exit(1);
}

// 日本時間(JST)での「今日」を求める
const now = new Date();
const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const y = jst.getUTCFullYear();
const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
const d = String(jst.getUTCDate()).padStart(2, "0");
const today = `${y}-${m}-${d}`;
const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
const dow = YOUBI[jst.getUTCDay()];

let events = [];
try {
  const raw = readFileSync(new URL("../events.json", import.meta.url), "utf-8");
  const data = JSON.parse(raw);
  events = Array.isArray(data) ? data : Object.values(data);
} catch (e) {
  console.error("events.json を読めませんでした:", e.message);
  process.exit(0); // データ未アップロード時は静かに終了
}

const todays = events
  .filter((e) => e.date === today)
  .sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));

let content;
if (todays.length === 0) {
  content = `**📅 ${Number(m)}月${Number(d)}日（${dow}）**\n今日の予定はありません。よい一日を。`;
} else {
  const lines = todays.map((e) => {
    const star = e.important ? "⭐ " : "・";
    const time = e.time ? `\`${e.time}\` ` : "";
    const tags = e.tags && e.tags.length ? `  〔${e.tags.join(" / ")}〕` : "";
    return `${star}${time}**${e.title}**${tags}`;
  });
  content = `**📅 ${Number(m)}月${Number(d)}日（${dow}）の予定（${todays.length}件）**\n` + lines.join("\n");
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
