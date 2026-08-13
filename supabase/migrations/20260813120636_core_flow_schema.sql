-- Core Flow/Node/Edge/Click schema (see docs/adr/0001-0014, CONTEXT.md, .scratch/flow-mvp/spec.md)

create table public.flows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index flows_user_id_idx on public.flows (user_id);

-- Single table for both node types (Input/Output), type-conditional columns.
-- See spec.md: "exact table normalization... is left open for implementation to decide."
create table public.nodes (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('input', 'output')),
  name text not null,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Input-node-only columns
  slug text unique,
  input_status text check (input_status in ('enabled', 'disabled')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  -- Output-node-only column
  destination_url text,
  constraint nodes_type_shape check (
    (
      type = 'input'
      and slug is not null
      and input_status is not null
      and destination_url is null
    )
    or (
      type = 'output'
      and destination_url is not null
      and slug is null
      and input_status is null
      and utm_source is null
      and utm_medium is null
      and utm_campaign is null
      and utm_term is null
      and utm_content is null
    )
  )
);

create index nodes_flow_id_idx on public.nodes (flow_id);
create index nodes_user_id_idx on public.nodes (user_id);

-- Edges reference slot strings, not a formal Port entity (ADR 0002).
-- An "out" slot connects to exactly one destination at a time.
create table public.edges (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  from_node_id uuid not null references public.nodes (id) on delete cascade,
  from_slot text not null default 'out',
  to_node_id uuid not null references public.nodes (id) on delete cascade,
  to_slot text not null default 'in',
  created_at timestamptz not null default now(),
  unique (from_node_id, from_slot)
);

create index edges_flow_id_idx on public.edges (flow_id);
create index edges_to_node_id_idx on public.edges (to_node_id);

-- Click records never persist the visitor's IP, not even hashed (ADR 0003).
create table public.clicks (
  id uuid primary key default gen_random_uuid(),
  input_node_id uuid not null references public.nodes (id) on delete cascade,
  flow_id uuid not null references public.flows (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  country text,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  created_at timestamptz not null default now()
);

create index clicks_input_node_id_idx on public.clicks (input_node_id);
create index clicks_flow_id_idx on public.clicks (flow_id);
create index clicks_user_id_idx on public.clicks (user_id);
create index clicks_created_at_idx on public.clicks (created_at);

-- updated_at maintenance

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger flows_set_updated_at
  before update on public.flows
  for each row execute function public.set_updated_at();

create trigger nodes_set_updated_at
  before update on public.nodes
  for each row execute function public.set_updated_at();

-- Row Level Security: every table is scoped to its owning user_id.
-- Clicks have no insert/update/delete policy — writes only happen through
-- record_click(), a SECURITY DEFINER function called from the anonymous
-- redirect route.

alter table public.flows enable row level security;
alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.clicks enable row level security;

create policy "Flows are managed by their owner"
  on public.flows for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Nodes are managed by their owner"
  on public.nodes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Edges are managed by their owner"
  on public.edges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Clicks are viewable by their owner"
  on public.clicks for select
  using (auth.uid() = user_id);

-- Public redirect pipeline: anonymous visitors never query flows/nodes/edges
-- directly. resolve_redirect() walks the graph and returns only the resolved
-- destination (or an inactive signal); record_click() writes the click row.
-- Both are SECURITY DEFINER so they can bypass RLS for this narrow purpose.

create or replace function public.resolve_redirect(p_slug text)
returns table (
  input_node_id uuid,
  is_active boolean,
  destination_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_input_id uuid;
  v_input_status text;
  v_flow_id uuid;
  v_flow_status text;
  v_utm_source text;
  v_utm_medium text;
  v_utm_campaign text;
  v_utm_term text;
  v_utm_content text;
  v_output_node_id uuid;
  v_destination_url text;
begin
  select n.id, n.input_status, n.flow_id, n.utm_source, n.utm_medium, n.utm_campaign, n.utm_term, n.utm_content
    into v_input_id, v_input_status, v_flow_id, v_utm_source, v_utm_medium, v_utm_campaign, v_utm_term, v_utm_content
    from public.nodes n
   where n.slug = p_slug
     and n.type = 'input'
     and n.deleted_at is null;

  if v_input_id is null then
    return;
  end if;

  select f.status into v_flow_status
    from public.flows f
   where f.id = v_flow_id;

  if v_input_status <> 'enabled' or v_flow_status <> 'active' then
    return query select v_input_id, false, null::text, null::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  select e.to_node_id into v_output_node_id
    from public.edges e
   where e.from_node_id = v_input_id
     and e.from_slot = 'out'
   limit 1;

  if v_output_node_id is not null then
    select o.destination_url into v_destination_url
      from public.nodes o
     where o.id = v_output_node_id
       and o.type = 'output'
       and o.deleted_at is null;
  end if;

  if v_destination_url is null then
    return query select v_input_id, false, null::text, null::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  return query select v_input_id, true, v_destination_url, v_utm_source, v_utm_medium, v_utm_campaign, v_utm_term, v_utm_content;
end;
$$;

create or replace function public.record_click(
  p_input_node_id uuid,
  p_country text,
  p_user_agent text,
  p_referrer text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flow_id uuid;
  v_user_id uuid;
  v_utm_source text;
  v_utm_medium text;
  v_utm_campaign text;
  v_utm_term text;
  v_utm_content text;
begin
  select n.flow_id, n.user_id, n.utm_source, n.utm_medium, n.utm_campaign, n.utm_term, n.utm_content
    into v_flow_id, v_user_id, v_utm_source, v_utm_medium, v_utm_campaign, v_utm_term, v_utm_content
    from public.nodes n
   where n.id = p_input_node_id
     and n.type = 'input';

  if v_flow_id is null then
    return;
  end if;

  insert into public.clicks (
    input_node_id, flow_id, user_id, country, user_agent, referrer,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content
  ) values (
    p_input_node_id, v_flow_id, v_user_id, p_country, p_user_agent, p_referrer,
    v_utm_source, v_utm_medium, v_utm_campaign, v_utm_term, v_utm_content
  );
end;
$$;

grant execute on function public.resolve_redirect(text) to anon, authenticated;
grant execute on function public.record_click(uuid, text, text, text) to anon, authenticated;
