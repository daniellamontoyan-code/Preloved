-- Separate inventory visibility and pricing for the fair and public catalog.
alter table public.articulos
  add column if not exists publicar_feria boolean not null default true,
  add column if not exists publicar_web boolean not null default true,
  add column if not exists precio_web numeric(10, 2);

-- Existing items stay available in both channels and keep their current price.
update public.articulos
set precio_web = coalesce(precio_web, precio, 0)
where precio_web is null;

alter table public.articulos
  alter column precio_web set default 0,
  alter column precio_web set not null;

-- The public function exposes only items intentionally enabled for the catalog
-- and presents the catalog price as its sale price.
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
    'precio', a.precio_web,
    'codigo', a.codigo,
    'foto', a.foto,
    'estado', a.estado,
    'created_at', a.created_at
  )
  from public.articulos as a
  where a.estado = 'Disponible'
    and a.publicar_web = true
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
    where a.foto = object_name
      and a.estado = 'Disponible'
      and a.publicar_web = true
  );
$$;

revoke all on function public.is_catalog_image_available(text) from public;
grant execute on function public.is_catalog_image_available(text) to anon, authenticated;
