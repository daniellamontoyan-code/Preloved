begin;

alter table public.articulos
  add column if not exists fotos text[] not null default '{}'::text[];

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
    'medidas', a.medidas,
    'publico_objetivo', a.publico_objetivo,
    'precio', a.precio_web,
    'codigo', a.codigo,
    'foto', a.foto,
    'fotos', a.fotos,
    'estado', a.estado,
    'created_at', a.created_at,
    'updated_at', a.updated_at
  )
  from public.articulos as a
  where a.estado = 'Disponible'
    and a.publicar_web = true
    and nullif(pg_catalog.btrim(a.foto), '') is not null
  order by a.created_at desc;
$$;

revoke all on function public.get_public_catalog() from public;
grant execute on function public.get_public_catalog() to anon, authenticated;

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
    where (a.foto = object_name or object_name = any(a.fotos))
      and a.estado = 'Disponible'
      and a.publicar_web = true
  );
$$;

revoke all on function public.is_catalog_image_available(text) from public;
grant execute on function public.is_catalog_image_available(text) to anon, authenticated;

commit;
