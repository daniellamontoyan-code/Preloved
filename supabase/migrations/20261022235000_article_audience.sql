-- Optional audience label for articles, shown and filterable in the public catalog.
alter table public.articulos
  add column if not exists publico_objetivo text;

alter table public.articulos
  drop constraint if exists articulos_publico_objetivo_check;

alter table public.articulos
  add constraint articulos_publico_objetivo_check
  check (publico_objetivo is null or publico_objetivo in ('Mujer', 'Hombre', 'Unisex'));

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
    'publico_objetivo', a.publico_objetivo,
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
