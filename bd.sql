-- Propuesta de esquema para múltiples landing pages por empresa.
-- Revisar antes de ejecutar en Supabase. Este archivo no se ejecuta desde la aplicación.

begin;

create table if not exists public.gl_landings (
  id uuid primary key default gen_random_uuid(),
  empresa_id bigint not null references public.gl_empresas (id) on delete cascade,
  template_key text not null check (
    template_key in ('bold-red', 'clean-white', 'dark-purple', 'orange-industrial', 'warm-wood')
  ),
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and slug not in ('admin', 'app', 'www')
  ),
  custom_domain text check (
    custom_domain is null
    or (
      btrim(custom_domain) <> ''
      and custom_domain !~* '(^|\.)gamalink\.online$'
      and custom_domain !~* '(^|\.)localhost$'
      and custom_domain !~* '(^|\.)vercel\.app$'
    )
  ),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  content jsonb not null check (
    jsonb_typeof(content) = 'object'
    and case
      when jsonb_typeof(content -> 'imagenes') = 'array'
        then jsonb_array_length(content -> 'imagenes') <= 5
      else false
    end
  ),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gl_landings_empresa_id_idx
  on public.gl_landings (empresa_id);

create unique index if not exists gl_landings_custom_domain_lower_unique
  on public.gl_landings (lower(custom_domain))
  where custom_domain is not null;

alter table public.gl_analytics_events
  add column if not exists landing_id uuid
  references public.gl_landings (id) on delete set null;

create index if not exists gl_analytics_events_landing_created_idx
  on public.gl_analytics_events (landing_id, created_at desc);

create or replace function public.gl_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gl_landings_set_updated_at on public.gl_landings;
create trigger gl_landings_set_updated_at
before update on public.gl_landings
for each row execute function public.gl_set_updated_at();

-- Security-definer membership checks avoid recursive reads of gl_usuarios from RLS policies.
create schema if not exists gamalink_internal;
revoke all on schema gamalink_internal from public, anon, authenticated;
grant usage on schema gamalink_internal to authenticated;

create or replace function gamalink_internal.gl_user_belongs_to_empresa(p_empresa_id bigint)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.gl_usuarios u
    where u.empresa_id = p_empresa_id
      and u.auth_id = (select auth.uid())
  );
$$;

revoke all on function gamalink_internal.gl_user_belongs_to_empresa(bigint) from public, anon;
grant execute on function gamalink_internal.gl_user_belongs_to_empresa(bigint) to authenticated;

drop policy if exists "Ver usuarios de la misma empresa" on public.gl_usuarios;
drop policy if exists gl_usuarios_member_read on public.gl_usuarios;
create policy gl_usuarios_member_read
on public.gl_usuarios
for select
to authenticated
using (auth_id = (select auth.uid()) or gamalink_internal.gl_user_belongs_to_empresa(empresa_id));

alter table public.gl_landings enable row level security;

grant select on public.gl_landings to anon, authenticated;
grant insert, update, delete on public.gl_landings to authenticated;

drop policy if exists gl_landings_public_read_published on public.gl_landings;
create policy gl_landings_public_read_published
on public.gl_landings
for select
to anon, authenticated
using (status = 'published');

drop policy if exists gl_landings_member_read_own on public.gl_landings;
create policy gl_landings_member_read_own
on public.gl_landings
for select
to authenticated
using (gamalink_internal.gl_user_belongs_to_empresa(empresa_id));

drop policy if exists gl_landings_member_insert_own on public.gl_landings;
create policy gl_landings_member_insert_own
on public.gl_landings
for insert
to authenticated
with check (gamalink_internal.gl_user_belongs_to_empresa(empresa_id));

drop policy if exists gl_landings_member_update_own on public.gl_landings;
create policy gl_landings_member_update_own
on public.gl_landings
for update
to authenticated
using (gamalink_internal.gl_user_belongs_to_empresa(empresa_id))
with check (gamalink_internal.gl_user_belongs_to_empresa(empresa_id));

drop policy if exists gl_landings_member_delete_own on public.gl_landings;
create policy gl_landings_member_delete_own
on public.gl_landings
for delete
to authenticated
using (gamalink_internal.gl_user_belongs_to_empresa(empresa_id));

-- Public tracking may only insert allowlisted events for a currently published landing.
drop policy if exists "Permitir inserción de eventos desde el tracker" on public.gl_analytics_events;
drop policy if exists gl_analytics_events_public_landing_insert on public.gl_analytics_events;
create policy gl_analytics_events_public_landing_insert
on public.gl_analytics_events
for insert
to anon, authenticated
with check (
  event_type in (
    'page_view',
    'whatsapp_click',
    'instagram_click',
    'facebook_click',
    'phone_click',
    'email_click',
    'interaction_click'
  )
  and visitor_id is not null
  and length(visitor_id) between 16 and 128
  and (path is null or length(path) <= 500)
  and (source is null or length(source) <= 128)
  and landing_id is not null
  and exists (
    select 1
    from public.gl_landings l
    where l.id = gl_analytics_events.landing_id
      and l.empresa_id = gl_analytics_events.empresa_id
      and l.status = 'published'
  )
);

revoke insert on public.gl_analytics_events from public, anon, authenticated;
grant insert (empresa_id, landing_id, event_type, path, source, visitor_id)
  on public.gl_analytics_events to anon, authenticated;

-- Analytics are computed only over rows visible under the caller's existing tenant RLS policies.
create or replace function public.gl_get_landing_analytics(
  p_landing_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  total_views bigint,
  unique_visitors bigint,
  whatsapp_clicks bigint,
  instagram_clicks bigint,
  facebook_clicks bigint,
  other_interactions bigint,
  sources jsonb
)
language plpgsql
stable
security invoker
set search_path = pg_catalog, public
as $$
begin
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception 'El rango de fechas para analíticas no es válido';
  end if;

  return query
  select
    count(*) filter (where e.event_type = 'page_view'),
    count(distinct e.visitor_id) filter (where e.event_type = 'page_view'),
    count(*) filter (where e.event_type = 'whatsapp_click'),
    count(*) filter (where e.event_type = 'instagram_click'),
    count(*) filter (where e.event_type = 'facebook_click'),
    count(*) filter (
      where e.event_type in ('phone_click', 'email_click', 'interaction_click')
    ),
    coalesce(
      (
        select jsonb_agg(jsonb_build_object('source', grouped.source, 'visits', grouped.visits))
        from (
          select coalesce(nullif(e2.source, ''), 'Directo') as source, count(*) as visits
          from public.gl_analytics_events e2
          where e2.landing_id = p_landing_id
            and e2.event_type = 'page_view'
            and e2.created_at >= p_from
            and e2.created_at < p_to
          group by coalesce(nullif(e2.source, ''), 'Directo')
          order by count(*) desc
          limit 10
        ) grouped
      ),
      '[]'::jsonb
    )
  from public.gl_analytics_events e
  where e.landing_id = p_landing_id
    and e.created_at >= p_from
    and e.created_at < p_to;
end;
$$;

revoke all on function public.gl_get_landing_analytics(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.gl_get_landing_analytics(uuid, timestamptz, timestamptz) to authenticated;

-- Public reads are needed to display uploaded landing images. Writes and listing are tenant-scoped.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gl-landing-images',
  'gl-landing-images',
  true,
  5242880,
  array['image/png', 'image/jpeg']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function gamalink_internal.gl_user_can_manage_landing_asset(p_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public, storage
as $$
declare
  path_parts text[];
  landing_empresa_id bigint;
begin
  path_parts := storage.foldername(p_object_name);
  if coalesce(array_length(path_parts, 1), 0) <> 2
     or path_parts[1] !~ '^[0-9]+$'
     or path_parts[2] !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' then
    return false;
  end if;

  select l.empresa_id
  into landing_empresa_id
  from public.gl_landings l
  where l.id = path_parts[2]::uuid
    and l.empresa_id = path_parts[1]::bigint;

  return landing_empresa_id is not null
    and gamalink_internal.gl_user_belongs_to_empresa(landing_empresa_id);
end;
$$;

revoke all on function gamalink_internal.gl_user_can_manage_landing_asset(text) from public, anon;
grant execute on function gamalink_internal.gl_user_can_manage_landing_asset(text) to authenticated;

drop policy if exists gl_landing_images_member_select on storage.objects;
create policy gl_landing_images_member_select
on storage.objects
for select
to authenticated
using (bucket_id = 'gl-landing-images' and gamalink_internal.gl_user_can_manage_landing_asset(name));

drop policy if exists gl_landing_images_member_insert on storage.objects;
create policy gl_landing_images_member_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'gl-landing-images' and gamalink_internal.gl_user_can_manage_landing_asset(name));

drop policy if exists gl_landing_images_member_update on storage.objects;
create policy gl_landing_images_member_update
on storage.objects
for update
to authenticated
using (bucket_id = 'gl-landing-images' and gamalink_internal.gl_user_can_manage_landing_asset(name))
with check (bucket_id = 'gl-landing-images' and gamalink_internal.gl_user_can_manage_landing_asset(name));

drop policy if exists gl_landing_images_member_delete on storage.objects;
create policy gl_landing_images_member_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'gl-landing-images' and gamalink_internal.gl_user_can_manage_landing_asset(name));

commit;
