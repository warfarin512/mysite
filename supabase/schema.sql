-- Chronos: Supabase schema
-- Supabaseダッシュボード → SQL Editor に貼り付けて実行してください。

create table if not exists public.events (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date text not null,
  time text,
  end_time text,
  title text not null default '',
  tags text[] not null default '{}',
  memo text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  important boolean not null default false,
  color text not null default '#3B82F6',
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists events_date_idx on public.events (date);
create index if not exists events_owner_idx on public.events (owner_id);

alter table public.events enable row level security;

drop policy if exists "events_select" on public.events;
create policy "events_select" on public.events
  for select using (owner_id = auth.uid() or visibility = 'shared');

drop policy if exists "events_insert" on public.events;
create policy "events_insert" on public.events
  for insert with check (owner_id = auth.uid());

drop policy if exists "events_update" on public.events;
create policy "events_update" on public.events
  for update using (owner_id = auth.uid());

drop policy if exists "events_delete" on public.events;
create policy "events_delete" on public.events
  for delete using (owner_id = auth.uid());
