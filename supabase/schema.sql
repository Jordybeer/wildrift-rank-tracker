create table public.matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  champion text not null,
  role text,
  win boolean not null,
  k_d_a text,
  rank_tier text not null,
  marks_in_division integer not null default 0,
  notes text,
  my_support text,
  enemy_adc text,
  enemy_support text
);

alter table public.matches disable row level security;
