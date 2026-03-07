-- Run this in Supabase SQL Editor to add the performance_grade column
alter table matches
  add column if not exists performance_grade text check (performance_grade in ('A', 'S', 'MVP', 'SVP'));
