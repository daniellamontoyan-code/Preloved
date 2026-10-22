-- PREPARED MIGRATION — Dani can start before Mafer's Auth account is created.
-- Dani's records are assigned immediately. Mafer's known records remain unassigned
-- and hidden by RLS until her Auth account is created and this migration is rerun.
-- Unknown clients or orphaned records stop the migration before permissions change.

begin;

alter table public.usuarios
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists usuarios_auth_user_id_unique
  on public.usuarios(auth_user_id)
  where auth_user_id is not null;

update public.usuarios u
set auth_user_id = au.id
from auth.users au
where lower(trim(u.nombre)) = 'dani'
  and lower(au.email) = lower('daniellamontoyan@gmail.com');

update public.usuarios u
set auth_user_id = au.id
from auth.users au
where lower(trim(u.nombre)) = 'mafer'
  and lower(au.email) = lower('mafercorre@gmail.com');

do $$
begin
  if (select count(*) from public.usuarios where lower(trim(nombre)) = 'dani' and auth_user_id is not null) <> 1 then
    raise exception 'No se encontró la cuenta de Dani en Supabase Authentication. No se aplicaron los permisos.';
  end if;
end $$;

alter table public.clientes add column if not exists owner_id uuid references auth.users(id);
alter table public.articulos add column if not exists owner_id uuid references auth.users(id);
alter table public.liquidaciones add column if not exists owner_id uuid references auth.users(id);

-- Asignación acordada con Dani para los seis clientes actuales.
update public.clientes c
set owner_id = u.auth_user_id
from public.usuarios u
where lower(trim(u.nombre)) = 'dani'
  and lower(trim(c.nombre)) in ('gonzalo', 'susana montoya', 'consuelo nuñez', 'daniella montoya');

update public.clientes c
set owner_id = u.auth_user_id
from public.usuarios u
where lower(trim(u.nombre)) = 'mafer'
  and lower(trim(c.nombre)) in ('malena', 'mafer');

-- Keep item and liquidation ownership consistent with their assigned client.
update public.articulos a
set owner_id = c.owner_id
from public.clientes c
where a.cliente = c.id and a.owner_id is null;

update public.liquidaciones l
set owner_id = c.owner_id
from public.clientes c
where l.cliente_id = c.id and l.owner_id is null;

do $$
begin
  if exists (
    select 1 from public.clientes
    where lower(trim(nombre)) not in ('gonzalo', 'susana montoya', 'consuelo nuñez', 'daniella montoya', 'malena', 'mafer')
  ) then
    raise exception 'Hay clientes fuera de la lista acordada. No se aplicaron los permisos.';
  end if;
  if exists (
    select 1 from public.articulos a
    left join public.clientes c on a.cliente = c.id
    where a.cliente is null or c.id is null
  ) then
    raise exception 'Hay prendas sin cliente asignado. No se aplicaron los permisos.';
  end if;
  if exists (
    select 1 from public.liquidaciones l
    left join public.clientes c on l.cliente_id = c.id
    where l.cliente_id is null or c.id is null
  ) then
    raise exception 'Hay liquidaciones sin cliente asignado. No se aplicaron los permisos.';
  end if;
end $$;

-- Replace broad legacy policies so access is checked against each signed-in user.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('usuarios', 'clientes', 'articulos', 'liquidaciones')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

alter table public.usuarios enable row level security;
alter table public.clientes enable row level security;
alter table public.articulos enable row level security;
alter table public.liquidaciones enable row level security;

revoke all on table public.usuarios, public.clientes, public.articulos, public.liquidaciones from public, anon, authenticated;
grant select (id, nombre, auth_user_id) on public.usuarios to authenticated;
grant select, insert, update, delete on public.clientes, public.articulos, public.liquidaciones to authenticated;

create policy "read own Cherry login" on public.usuarios
  for select to authenticated
  using ((select auth.uid()) = auth_user_id);

create policy "read own clients" on public.clientes
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "create own clients" on public.clientes
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "edit own clients" on public.clientes
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "delete own clients" on public.clientes
  for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "read own articles" on public.articulos
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "create own articles" on public.articulos
  for insert to authenticated with check (
    (select auth.uid()) = owner_id
    and (
      cliente is null
      or exists (
        select 1 from public.clientes c
        where c.id = cliente and c.owner_id = (select auth.uid())
      )
    )
  );
create policy "edit own articles" on public.articulos
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and (
      cliente is null
      or exists (
        select 1 from public.clientes c
        where c.id = cliente and c.owner_id = (select auth.uid())
      )
    )
  );
create policy "delete own articles" on public.articulos
  for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "read own liquidations" on public.liquidaciones
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "create own liquidations" on public.liquidaciones
  for insert to authenticated with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.clientes c
      where c.id = cliente_id and c.owner_id = (select auth.uid())
    )
  );
create policy "edit own liquidations" on public.liquidaciones
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.clientes c
      where c.id = cliente_id and c.owner_id = (select auth.uid())
    )
  );
create policy "delete own liquidations" on public.liquidaciones
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- Make item photos private and allow each user to access only their own folder.
update storage.buckets set public = false where id = 'articulos';
drop policy if exists "Cherry users can access only their item photo folder" on storage.objects;
drop policy if exists "Cherry read own item photos" on storage.objects;
drop policy if exists "Cherry upload own item photos" on storage.objects;
drop policy if exists "Cherry edit own item photos" on storage.objects;
drop policy if exists "Cherry delete own item photos" on storage.objects;

create policy "Cherry users can access only their item photo folder"
  on storage.objects as restrictive for all to public
  using (
    bucket_id <> 'articulos'
    or (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id <> 'articulos'
    or (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Cherry read own item photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'articulos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Cherry upload own item photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'articulos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Cherry edit own item photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'articulos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'articulos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Cherry delete own item photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'articulos' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
