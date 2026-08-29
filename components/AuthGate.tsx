"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

export default function AuthGate() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.href : undefined },
    });
    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="flex h-[100dvh] w-full items-center justify-center bg-paper px-6 text-ink dark:bg-[#0B0E14] dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/60 p-7 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"
      >
        <h1 className="font-display text-2xl font-bold tracking-tight">Chronos</h1>
        <p className="mt-1 text-[13px] text-ink-soft/60 dark:text-white/50">
          登録済みのメールアドレスでログインしてください。
        </p>

        {!supabaseConfigured && (
          <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-[12px] text-red-500">
            Supabaseの接続設定（環境変数）が未設定です。管理者に連絡してください。
          </p>
        )}

        {sent ? (
          <p className="mt-5 rounded-xl bg-blue-500/10 p-3 text-[13px] text-blue-600 dark:text-blue-400">
            {email} 宛にログインリンクを送信しました。メールを確認してください。
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="you@example.com"
              disabled={!supabaseConfigured}
              className="mt-5 w-full rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-[14px] outline-none focus:border-blue-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white"
            />
            {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={send}
              disabled={!supabaseConfigured || sending || !email.trim()}
              className="mt-4 w-full rounded-2xl bg-ink py-3 text-[14px] font-semibold text-white shadow-float transition-opacity disabled:opacity-30 dark:bg-white dark:text-ink"
            >
              {sending ? "送信中…" : "ログインリンクを送る"}
            </motion.button>
          </>
        )}
      </motion.div>
    </main>
  );
}
