-- Second Brain MVP schema
-- Run this once in Supabase SQL Editor after reviewing it.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  desired_outcome text,
  area text,
  due_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  code_stage text not null default 'capture'
    check (code_stage in ('capture', 'organize', 'distill', 'express')),
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'archived')),
  current_status text,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  content text,
  item_type text not null default 'note'
    check (item_type in ('note', 'link', 'image', 'voice', 'file')),
  para_category text not null default 'inbox'
    check (para_category in ('inbox', 'project', 'area', 'resource', 'archive')),
  code_stage text not null default 'capture'
    check (code_stage in ('capture', 'organize', 'distill', 'express')),
  area_name text,
  resource_name text,
  source_url text,
  captured_text text,
  bold_points text,
  highlighted_essence text,
  personal_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  is_done boolean not null default false,
  focus_date date not null default current_date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_type text not null default 'weekly'
    check (review_type in ('weekly', 'monthly', 'project_kickoff', 'project_completion')),
  checklist jsonb not null default '[]'::jsonb,
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists items_user_id_idx on public.items(user_id);
create index if not exists items_project_id_idx on public.items(project_id);
create index if not exists items_para_category_idx on public.items(para_category);
create index if not exists focus_tasks_user_date_idx on public.focus_tasks(user_id, focus_date);
create index if not exists review_sessions_user_id_idx on public.review_sessions(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at before update on public.items
for each row execute function public.set_updated_at();

drop trigger if exists focus_tasks_set_updated_at on public.focus_tasks;
create trigger focus_tasks_set_updated_at before update on public.focus_tasks
for each row execute function public.set_updated_at();

drop trigger if exists review_sessions_set_updated_at on public.review_sessions;
create trigger review_sessions_set_updated_at before update on public.review_sessions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.items enable row level security;
alter table public.focus_tasks enable row level security;
alter table public.review_sessions enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users manage their own projects" on public.projects;
create policy "Users manage their own projects" on public.projects
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own items" on public.items;
create policy "Users manage their own items" on public.items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own focus tasks" on public.focus_tasks;
create policy "Users manage their own focus tasks" on public.focus_tasks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own review sessions" on public.review_sessions;
create policy "Users manage their own review sessions" on public.review_sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
