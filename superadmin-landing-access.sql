begin;

create or replace function gamalink_internal.gl_is_superadmin()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select (select auth.uid()) = '37830e1a-2833-4dd2-b396-c613120601aa'::uuid;
$$;

revoke all on function gamalink_internal.gl_is_superadmin() from public, anon;
grant execute on function gamalink_internal.gl_is_superadmin() to authenticated;

drop policy if exists gl_empresas_superadmin_read on public.gl_empresas;
create policy gl_empresas_superadmin_read
on public.gl_empresas
for select
to authenticated
using (gamalink_internal.gl_is_superadmin());

drop policy if exists gl_landings_member_read_own on public.gl_landings;
create policy gl_landings_member_read_own
on public.gl_landings
for select
to authenticated
using (
  gamalink_internal.gl_is_superadmin()
  or gamalink_internal.gl_user_belongs_to_empresa(empresa_id)
);

drop policy if exists gl_landings_member_insert_own on public.gl_landings;
create policy gl_landings_member_insert_own
on public.gl_landings
for insert
to authenticated
with check (
  gamalink_internal.gl_is_superadmin()
  or gamalink_internal.gl_user_belongs_to_empresa(empresa_id)
);

drop policy if exists gl_landings_member_update_own on public.gl_landings;
create policy gl_landings_member_update_own
on public.gl_landings
for update
to authenticated
using (
  gamalink_internal.gl_is_superadmin()
  or gamalink_internal.gl_user_belongs_to_empresa(empresa_id)
)
with check (
  gamalink_internal.gl_is_superadmin()
  or gamalink_internal.gl_user_belongs_to_empresa(empresa_id)
);

drop policy if exists gl_landings_member_delete_own on public.gl_landings;
create policy gl_landings_member_delete_own
on public.gl_landings
for delete
to authenticated
using (
  gamalink_internal.gl_is_superadmin()
  or gamalink_internal.gl_user_belongs_to_empresa(empresa_id)
);

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
    and (
      gamalink_internal.gl_is_superadmin()
      or gamalink_internal.gl_user_belongs_to_empresa(landing_empresa_id)
    );
end;
$$;

revoke all on function gamalink_internal.gl_user_can_manage_landing_asset(text) from public, anon;
grant execute on function gamalink_internal.gl_user_can_manage_landing_asset(text) to authenticated;

commit;
