-- Registro de downloads dos modelos do blog Change Management World.
-- Quem visita só consegue INSERIR o próprio registro. Ler é restrito aos e-mails listados em painel_admins,
-- depois de entrar com usuário e senha (Supabase Auth).
create table if not exists public.downloads_modelos (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  empresa text check (empresa is null or char_length(empresa) <= 120),
  modelo text not null check (char_length(modelo) between 2 and 80),
  aceite boolean not null check (aceite),
  origem text check (origem is null or char_length(origem) <= 200)
);
create index if not exists downloads_modelos_criado_em on public.downloads_modelos (criado_em desc);

create table if not exists public.painel_admins (email text primary key);

alter table public.downloads_modelos enable row level security;
alter table public.painel_admins enable row level security;

drop policy if exists "visitante registra download" on public.downloads_modelos;
create policy "visitante registra download" on public.downloads_modelos
  for insert to anon, authenticated with check (aceite);

drop policy if exists "admin le downloads" on public.downloads_modelos;
create policy "admin le downloads" on public.downloads_modelos
  for select to authenticated
  using (exists (select 1 from public.painel_admins a where lower(a.email) = lower((select auth.jwt() ->> 'email'))));

drop policy if exists "admin ve a propria linha" on public.painel_admins;
create policy "admin ve a propria linha" on public.painel_admins
  for select to authenticated using (lower(email) = lower((select auth.jwt() ->> 'email')));

revoke all on public.downloads_modelos from anon, authenticated;
grant insert on public.downloads_modelos to anon, authenticated;
grant select on public.downloads_modelos to authenticated;
revoke all on public.painel_admins from anon, authenticated;
grant select on public.painel_admins to authenticated;
