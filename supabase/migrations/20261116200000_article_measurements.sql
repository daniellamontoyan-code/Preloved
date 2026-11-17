begin;

alter table public.articulos
  add column if not exists medidas text;

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

commit;
