-- Make article codes global across all account owners, safe under concurrent inserts.
-- Preserve the first existing article for each duplicate code and assign new
-- sequential codes to the remaining rows without deleting or changing articles.
create sequence if not exists public.articulos_codigo_seq as bigint;

select pg_catalog.setval(
  'public.articulos_codigo_seq'::pg_catalog.regclass,
  greatest(
    coalesce(
      max(((pg_catalog.regexp_match(codigo, '^PR-([0-9]+)$'))[1])::bigint),
      0
    ),
    1
  ),
  true
)
from public.articulos;

with ranked_articles as (
  select
    id,
    codigo,
    pg_catalog.row_number() over (
      partition by codigo
      order by created_at asc nulls last, id asc
    ) as code_rank
  from public.articulos
  where codigo is not null
),
renumbered_articles as materialized (
  select
    id,
    pg_catalog.nextval('public.articulos_codigo_seq'::pg_catalog.regclass) as next_number
  from ranked_articles
  where code_rank > 1
)
update public.articulos as article
set codigo = 'PR-' || pg_catalog.lpad(renumbered_articles.next_number::text, 4, '0')
from renumbered_articles
where article.id = renumbered_articles.id;

create unique index if not exists articulos_codigo_unique_idx
  on public.articulos (codigo);

create or replace function public.generate_article_code()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select 'PR-' || pg_catalog.lpad(
    pg_catalog.nextval('public.articulos_codigo_seq'::pg_catalog.regclass)::text,
    4,
    '0'
  );
$$;

revoke all on function public.generate_article_code() from public, anon;
grant execute on function public.generate_article_code() to authenticated;

alter table public.articulos
  alter column codigo set default public.generate_article_code(),
  alter column codigo set not null;

-- Public web catalog only: items without an uploaded photo remain in inventory,
-- but are not returned to visitors.
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
    and nullif(pg_catalog.btrim(a.foto), '') is not null
  order by a.created_at desc;
$$;

revoke all on function public.get_public_catalog() from public;
grant execute on function public.get_public_catalog() to anon, authenticated;
