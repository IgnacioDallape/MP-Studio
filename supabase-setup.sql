-- ============================================================================
-- MP Studio — setup de Supabase (un solo paso)
-- Pegá TODO esto en el SQL Editor de tu proyecto y ejecutá (Run).
-- Crea las 3 tablas + el bucket de Storage + los permisos. Listo.
-- ============================================================================

-- ---- TABLAS ----------------------------------------------------------------

create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  edad int,
  fecha_ingreso date,
  telefono text,
  mail text,
  dni text,
  ficha jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists tratamientos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade,
  fecha date,
  patologia text,
  tratamiento text,
  notas text,
  imagenes jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists turnos (
  id uuid primary key default gen_random_uuid(),
  fecha date,
  hora text,
  paciente_id uuid references pacientes(id) on delete set null,
  paciente_nombre text,
  notas text,
  estado text default 'pendiente',
  created_at timestamptz default now()
);

-- ---- SEGURIDAD (app de un solo usuario, traba por PIN en el cliente) --------

alter table pacientes    enable row level security;
alter table tratamientos enable row level security;
alter table turnos       enable row level security;

drop policy if exists "acceso_total" on pacientes;
drop policy if exists "acceso_total" on tratamientos;
drop policy if exists "acceso_total" on turnos;

create policy "acceso_total" on pacientes    for all using (true) with check (true);
create policy "acceso_total" on tratamientos for all using (true) with check (true);
create policy "acceso_total" on turnos       for all using (true) with check (true);

-- ---- STORAGE ---------------------------------------------------------------
-- Crea el bucket público "archivos" (imágenes de ecografía y PDFs) y sus permisos.
-- (No hace falta crearlo a mano en el panel: se crea acá.)

insert into storage.buckets (id, name, public)
values ('archivos', 'archivos', true)
on conflict (id) do update set public = true;

drop policy if exists "subir_archivos" on storage.objects;
drop policy if exists "leer_archivos" on storage.objects;
drop policy if exists "actualizar_archivos" on storage.objects;

create policy "subir_archivos" on storage.objects
  for insert with check (bucket_id = 'archivos');
create policy "leer_archivos" on storage.objects
  for select using (bucket_id = 'archivos');
create policy "actualizar_archivos" on storage.objects
  for update using (bucket_id = 'archivos') with check (bucket_id = 'archivos');
