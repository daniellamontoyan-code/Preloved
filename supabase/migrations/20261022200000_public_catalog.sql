-- Read-only public catalog. It returns sale-facing fields for available items only.
create or replace function public.get_public_catalog()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id,
    'descripcion', a.descripcion,
    'categoria', a.categoria,
    'subcategoria', a.subcategoria,
    'talla', a.talla,
    'precio', a.precio,
    'codigo', a.codigo,
    'foto', a.foto,
    'estado', a.estado,
    'created_at', a.created_at
  )
  from public.articulos as a
  where a.estado = 'Disponible'
  order by a.created_at desc;
$$;

revoke all on function public.get_public_catalog() from public;
grant execute on function public.get_public_catalog() to anon, authenticated;

-- Let the public catalog create short-lived signed links only for photos that
-- belong to currently available articles in the private articulos bucket.
create or replace function public.is_catalog_image_available(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.articulos as a
    where a.foto = object_name
      and a.estado = 'Disponible'
  );
$$;

revoke all on function public.is_catalog_image_available(text) from public;
grant execute on function public.is_catalog_image_available(text) to anon, authenticated;

drop policy if exists "public catalog photos for available articles" on storage.objects;
create policy "public catalog photos for available articles"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'articulos'
    and public.is_catalog_image_available(name)
  );
