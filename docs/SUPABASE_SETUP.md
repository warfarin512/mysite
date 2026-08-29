# Supabase移行 セットアップ手順

コードの移行は完了しています。以下の手順をあなたが実行すると、
クラウド同期・身内共有・Discord通知の完全自動化が有効になります。

## STEP 1: Supabaseプロジェクトを作成

1. https://supabase.com でアカウント作成 → 「New project」
2. プロジェクト名・パスワード・リージョン（Northeast Asia (Tokyo) 推奨）を設定して作成
3. 作成後、左メニュー「SQL Editor」を開き、このリポジトリの
   `supabase/schema.sql` の中身を貼り付けて実行（テーブルとRLSポリシーが作られます）

## STEP 2: サインアップを許可リスト方式にする

1. 左メニュー「Authentication」→「Providers」→「Email」を開く
2. **「Allow new users to sign up」を OFF** にする
   （これで、招待していないメールアドレスは一切ログインできなくなります）
3. 「Authentication」→「Users」→「Add user」→「Invite」で、
   身内それぞれのメールアドレスを1件ずつ招待する
   （招待メールのリンクを踏むとログイン済み状態になります。以後は
   アプリ側の「ログインリンクを送る」からマジックリンクでログインできます）

## STEP 3: 接続情報を取得

「Settings」→「API」で以下をコピー：
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` キー（**絶対に公開しないこと**）→ `SUPABASE_SERVICE_ROLE_KEY`

## STEP 4: GitHubにSecretsを登録

リポジトリの Settings → Secrets and variables → Actions → New repository secret で、
以下4つを登録：

| Name | 値 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | STEP3の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | STEP3の anon public キー |
| `SUPABASE_URL` | STEP3の Project URL（notify.mjs用、同じ値でOK） |
| `SUPABASE_SERVICE_ROLE_KEY` | STEP3の service_role キー |

（`DISCORD_WEBHOOK_URL` は既存のものをそのまま使用）

## STEP 5: ローカル開発用の設定（任意）

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を
STEP3の値に置き換える。

## STEP 6: デプロイして動作確認

1. このブランチをmainにpush（または、この変更のPRをmerge）すると
   Actionsが自動ビルド・デプロイします
2. 公開URLを開く → ログイン画面が出るので、招待したメールアドレスで
   「ログインリンクを送る」→ 届いたメールのリンクをクリック
3. 初回ログイン時、端末のIndexedDBに残っている過去の予定が自動的に
   Supabaseへ一括アップロードされます（`private`として登録されます。
   身内と共有したい予定は、予定を開いて「🔒 自分のみ」ボタンを押して
   「👥 共有中」に切り替えてください）
4. 「Daily Discord Notify」workflowをActionsタブから手動実行し、
   Discordに通知が届くか確認

## 補足: package-lock.json について

この環境にNode.jsが無く `npm install` を実行できなかったため、
`package-lock.json` は `@supabase/supabase-js` を反映できていません。
そのためCIの依存インストールは `npm ci` ではなく `npm install` に
変更しています（動作に支障はありませんが、再現性はやや落ちます）。
もしローカルにNode.jsがあれば、一度 `npm install` を実行して
`package-lock.json` をコミットし直すと、`npm ci` に戻せます。

## 移行後、不要になったもの

- `events.json`（手動同期用データ。読まれなくなりますが、削除は任意）
- `⬇ 書き出し` ボタン（コードから削除済み）
