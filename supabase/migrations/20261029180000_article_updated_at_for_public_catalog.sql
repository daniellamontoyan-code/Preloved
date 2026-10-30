begin;

alter table public.articulos
  add column if not exists updated_at timestamptz;

update public.articulos
set updated_at = created_at
where updated_at is null;

alter table public.articulos
  alter column updated_at set default pg_catalog.now(),
  alter column updated_at set not null;

create or replace function public.set_articulos_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists articulos_set_updated_at on public.articulos;
create trigger articulos_set_updated_at
before update on public.articulos
for each row execute function public.set_articulos_updated_at();

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
