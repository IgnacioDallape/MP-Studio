# MP Studio

App de gestión de pacientes para **Marcos Porretta** — Fisioterapia Invasiva Ecoguiada.

Permite cargar pacientes, armar su ficha clínica, registrar tratamientos con
imágenes de ecografía, generar un **PDF con la marca** para enviar al paciente,
ver el **historial** de atenciones y manejar una **agenda** de turnos
(8:00 a 22:00, lunes a sábado).

Stack: **React + Vite + Zustand + Supabase + jsPDF**.

---

## Cómo correrla

```bash
npm install
npm run dev      # abre en http://localhost:5174
npm run build    # genera dist/
```

Al abrir pide un **PIN** (por defecto `1234`). Se cambia en
[`src/lib/config.js`](src/lib/config.js).

---

## Modo local vs. nube

La app funciona apenas la abrís en **modo local** (los datos quedan en este
navegador). Para guardar en la **nube** (acceder desde la compu y el celu, sin
límite de fotos/PDF) hay que conectar Supabase:

### 1. Crear el proyecto en Supabase
Entrá a [supabase.com](https://supabase.com), creá un proyecto y copiá de
**Settings → API**:
- `Project URL`
- `anon public` key

Pegalas en [`src/lib/config.js`](src/lib/config.js):

```js
export const SUPABASE_URL = 'https://xxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGci...';
```

### 2. Crear las tablas
En **SQL Editor** pegá y ejecutá:

```sql
-- PACIENTES
create table pacientes (
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

-- TRATAMIENTOS (sesiones)
create table tratamientos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade,
  fecha date,
  patologia text,
  tratamiento text,
  notas text,
  imagenes jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- TURNOS (agenda)
create table turnos (
  id uuid primary key default gen_random_uuid(),
  fecha date,
  hora text,
  paciente_id uuid references pacientes(id) on delete set null,
  paciente_nombre text,
  notas text,
  estado text default 'pendiente',
  created_at timestamptz default now()
);

-- Acceso (app de un solo usuario con PIN del lado del cliente).
alter table pacientes   enable row level security;
alter table tratamientos enable row level security;
alter table turnos      enable row level security;

create policy "acceso_total" on pacientes   for all using (true) with check (true);
create policy "acceso_total" on tratamientos for all using (true) with check (true);
create policy "acceso_total" on turnos       for all using (true) with check (true);
```

### 3. Crear el bucket de archivos
En **Storage → New bucket**:
- Nombre: `archivos`
- Marcá **Public bucket** (para que las imágenes se vean en el PDF).

Después, en **SQL Editor**, permití subir/leer archivos:

```sql
create policy "subir_archivos" on storage.objects
  for insert with check (bucket_id = 'archivos');
create policy "leer_archivos" on storage.objects
  for select using (bucket_id = 'archivos');
```

Listo: recargá la app y el cartel del menú va a decir **"Nube conectada"**.

> ⚠️ **Nota de seguridad:** el PIN es una traba simple del lado del cliente y la
> `anon key` queda en el frontend. Para datos médicos en producción conviene más
> adelante pasar a Supabase Auth con login real y políticas RLS por usuario.

---

## Deploy (Vercel)
1. Subí el repo a GitHub.
2. Importalo en Vercel (framework: **Vite**).
3. Listo — auto-deploy desde la rama principal.

---

## Estructura

```
src/
├── lib/
│   ├── config.js      ← credenciales Supabase + PIN
│   ├── supabase.js    cliente Supabase
│   ├── db.js          adaptador de datos (nube ↔ local)
│   ├── files.js       compresión de imágenes
│   ├── format.js      fechas / helpers es-AR
│   └── exportPDF.js   generador del PDF con la marca
├── store/useStore.js  estado global (Zustand)
└── components/
    ├── BrandMark.jsx  logo MP en SVG
    ├── PinGate.jsx    pantalla de PIN
    ├── Sidebar.jsx
    ├── Attachments.jsx
    ├── pacientes/     lista, alta, detalle, ficha, sesiones, tratamiento
    ├── agenda/        grilla semanal + alta de turno
    └── historial/     todos los tratamientos
```
