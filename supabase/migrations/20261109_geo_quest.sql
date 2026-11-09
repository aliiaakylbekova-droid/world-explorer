-- GEO QUEST cloud tables. Fields match the existing local Profile / Progress / LeaderRow shapes.
-- Apply in the Supabase SQL editor or with the CLI. Enable Anonymous sign-in (Auth → Providers)
-- so nickname registration can attach to auth.uid() without email.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  xp integer not null default 0,
  coins integer not null default 0,
  achievements text[] not null default '{}',
  stamps text[] not null default '{}',
  visited text[] not null default '{}',
  missions_done text[] not null default '{}',
  journal jsonb not null default '[]'::jsonb,
  difficulty text not null default 'medium',
  volume real not null default 0.7,
  music_on boolean not null default true,
  sfx_on boolean not null default true,
  music_vol real not null default 0.32,
  sfx_vol real not null default 0.7,
  locale text not null default 'ru',
  campaign_index integer not null default 0,
  campaign_done text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  score integer not null,
  at timestamptz not null default now()
);

create index if not exists leaderboard_score_idx on public.leaderboard (score desc, at desc);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.leaderboard enable row level security;

drop policy if exists "profiles_own_select" on public.profiles;
drop policy if exists "profiles_own_insert" on public.profiles;
drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "progress_own_select" on public.progress;
drop policy if exists "progress_own_insert" on public.progress;
drop policy if exists "progress_own_update" on public.progress;
create policy "progress_own_select" on public.progress for select using (auth.uid() = user_id);
create policy "progress_own_insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress_own_update" on public.progress for update using (auth.uid() = user_id);

drop policy if exists "leaderboard_public_read" on public.leaderboard;
drop policy if exists "leaderboard_own_insert" on public.leaderboard;
create policy "leaderboard_public_read" on public.leaderboard for select using (true);
create policy "leaderboard_own_insert" on public.leaderboard for insert with check (auth.uid() = user_id);
