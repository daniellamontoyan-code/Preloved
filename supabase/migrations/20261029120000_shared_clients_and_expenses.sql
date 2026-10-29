begin;

create or replace function public.is_cherry_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios as u
    where u.auth_user_id = (select auth.uid())
      and pg_catalog.lower(pg_catalog.btrim(u.nombre)) in ('dani', 'mafer')
  );
$$;

revoke all on function public.is_cherry_member() from public, anon;
grant execute on function public.is_cherry_member() to authenticated, anon;

-- Let the two Cherry Club accounts identify who registered a shared expense.
drop policy if exists "read Cherry Club teammates" on public.usuarios;
create policy "read Cherry Club teammates" on public.usuarios
  for select to authenticated
  using (public.is_cherry_member());

-- A client remains owned by the creator unless explicitly marked shared.
alter table public.clientes
  add column if not exists compartido boolean not null default false;

drop policy if exists "read shared clients" on public.clientes;
create policy "read shared clients" on public.clientes
  for select to authenticated
  using (compartido and public.is_cherry_member());

-- Articles remain private to their owner; a shared client may be selected by either account.
drop policy if exists "create own articles" on public.articulos;
create policy "create own articles" on public.articulos
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and (
      cliente is null
      or exists (
        select 1
        from public.clientes as c
        where c.id = cliente
          and (
            c.owner_id = (select auth.uid())
            or (c.compartido and public.is_cherry_member())
          )
      )
    )
  );

drop policy if exists "edit own articles" on public.articulos;
create policy "edit own articles" on public.articulos
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and (
      cliente is null
      or exists (
        select 1
        from public.clientes as c
        where c.id = cliente
          and (
            c.owner_id = (select auth.uid())
            or (c.compartido and public.is_cherry_member())
          )
      )
    )
  );

-- Liquidations may refer to a shared client while still belonging to the seller.
drop policy if exists "create own liquidations" on public.liquidaciones;
create policy "create own liquidations" on public.liquidaciones
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.clientes as c
      where c.id = cliente_id
        and (
          c.owner_id = (select auth.uid())
          or (c.compartido and public.is_cherry_member())
        )
    )
  );

drop policy if exists "edit own liquidations" on public.liquidaciones;
create policy "edit own liquidations" on public.liquidaciones
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.clientes as c
      where c.id = cliente_id
        and (
          c.owner_id = (select auth.uid())
          or (c.compartido and public.is_cherry_member())
        )
    )
  );

create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  descripcion text not null check (pg_catalog.length(pg_catalog.btrim(descripcion)) > 0),
  monto numeric(12, 2) not null check (monto > 0),
  fecha date not null default current_date,
  evidencia_path text,
  created_at timestamptz not null default now()
);

create index if not exists gastos_fecha_created_idx
  on public.gastos (fecha desc, created_at desc);
create index if not exists gastos_owner_id_idx
  on public.gastos (owner_id);

alter table public.gastos enable row level security;
revoke all on table public.gastos from public, anon, authenticated;
grant select, insert, update, delete on table public.gastos to authenticated;

drop policy if exists "read shared Cherry expenses" on public.gastos;
create policy "read shared Cherry expenses" on public.gastos
  for select to authenticated
  using (public.is_cherry_member());

drop policy if exists "create own Cherry expenses" on public.gastos;
create policy "create own Cherry expenses" on public.gastos
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_cherry_member());

drop policy if exists "edit own Cherry expenses" on public.gastos;
create policy "edit own Cherry expenses" on public.gastos
  for update to authenticated
  using (owner_id = (select auth.uid()) and public.is_cherry_member())
  with check (owner_id = (select auth.uid()) and public.is_cherry_member());

drop policy if exists "delete own Cherry expenses" on public.gastos;
create policy "delete own Cherry expenses" on public.gastos
  for delete to authenticated
  using (owner_id = (select auth.uid()) and public.is_cherry_member());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gastos', 'gastos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false;

-- The earlier private-photo guard is restrictive and would otherwise prevent
-- one Cherry member from opening evidence uploaded by the other.
drop policy if exists "Cherry users can access only their item photo folder" on storage.objects;
create policy "Cherry users can access only their item photo folder"
  on storage.objects as restrictive for all to public
  using (
    bucket_id not in ('articulos', 'gastos')
    or (storage.foldername(name))[1] = (select auth.uid())::text
    or (bucket_id = 'gastos' and public.is_cherry_member())
  )
  with check (
    bucket_id not in ('articulos', 'gastos')
    or (storage.foldername(name))[1] = (select auth.uid())::text
    or (bucket_id = 'gastos' and public.is_cherry_member())
  );

drop policy if exists "read shared Cherry expense evidence" on storage.objects;
create policy "read shared Cherry expense evidence" on storage.objects
  for select to authenticated
  using (bucket_id = 'gastos' and public.is_cherry_member());

drop policy if exists "upload own Cherry expense evidence" on storage.objects;
create policy "upload own Cherry expense evidence" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'gastos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.is_cherry_member()
  );

drop policy if exists "edit own Cherry expense evidence" on storage.objects;
create policy "edit own Cherry expense evidence" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'gastos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.is_cherry_member()
  )
  with check (
    bucket_id = 'gastos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.is_cherry_member()
  );

drop policy if exists "delete own Cherry expense evidence" on storage.objects;
create policy "delete own Cherry expense evidence" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'gastos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.is_cherry_member()
  );

commit;
