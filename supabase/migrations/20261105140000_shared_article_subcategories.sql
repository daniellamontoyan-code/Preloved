begin;

create table if not exists public.subcategorias_articulos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (char_length(btrim(categoria)) between 1 and 60),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 60),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create unique index if not exists subcategorias_articulos_parent_name_normalized_key
  on public.subcategorias_articulos (lower(btrim(categoria)), lower(btrim(nombre)));

alter table public.subcategorias_articulos enable row level security;
revoke all on public.subcategorias_articulos from anon, authenticated;
grant select, insert on public.subcategorias_articulos to authenticated;

drop policy if exists "Pitucas members can read shared article subcategories" on public.subcategorias_articulos;
create policy "Pitucas members can read shared article subcategories"
  on public.subcategorias_articulos
  for select to authenticated
  using (public.is_cherry_member());

drop policy if exists "Pitucas members can add shared article subcategories" on public.subcategorias_articulos;
create policy "Pitucas members can add shared article subcategories"
  on public.subcategorias_articulos
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_cherry_member()
  );

commit;
