begin;

create table if not exists public.categorias_articulos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 60),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create unique index if not exists categorias_articulos_nombre_normalizado_key
  on public.categorias_articulos (lower(btrim(nombre)));

alter table public.categorias_articulos enable row level security;
revoke all on public.categorias_articulos from anon, authenticated;
grant select, insert on public.categorias_articulos to authenticated;

drop policy if exists "Pitucas members can read shared article categories" on public.categorias_articulos;
create policy "Pitucas members can read shared article categories"
  on public.categorias_articulos
  for select to authenticated
  using (public.is_cherry_member());

drop policy if exists "Pitucas members can add shared article categories" on public.categorias_articulos;
create policy "Pitucas members can add shared article categories"
  on public.categorias_articulos
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_cherry_member()
  );

commit;
