-- Tabla users
create table if not exists users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  nombre text,
  rol text check (rol in ('admin', 'user')) default 'user',
  fecha_registro timestamp with time zone default timezone('utc'::text, now()),
  unique (email)
);

-- Tabla user_credits
create table if not exists user_credits (
  user_id uuid references users(id) on delete cascade not null primary key,
  creditos_disponibles integer default 0
);

-- Tabla cotizaciones
create table if not exists cotizaciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  datos_entrada jsonb not null default '{}',
  resultados_salida jsonb not null default '{}',
  fecha_creacion timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla configuracion_sistema
create table if not exists configuracion_sistema (
  clave text primary key,
  valor text not null default ''
);

-- Habilitar Row Level Security
alter table users enable row level security;
alter table user_credits enable row level security;
alter table cotizaciones enable row level security;
alter table configuracion_sistema enable row level security;

-- Políticas RLS para users
create policy "Users can view own data" on users
  for select using (auth.uid() = id);

create policy "Admins can manage users" on users
  for all using (exists (select 1 from users where id = auth.uid() and rol = 'admin'));

-- Políticas RLS para user_credits
create policy "Users can view own credits" on user_credits
  for select using (auth.uid() = user_id);

create policy "Users can update own credits" on user_credits
  for update using (auth.uid() = user_id);

-- Políticas RLS para cotizaciones
create policy "Users can view own cotizaciones" on cotizaciones
  for select using (auth.uid() = user_id);

create policy "Users can create cotizaciones" on cotizaciones
  for insert with check (auth.uid() = user_id);

-- Políticas RLS para configuracion_sistema (solo admin)
create policy "Admins can view config" on configuracion_sistema
  for select using (exists (select 1 from users where id = auth.uid() and rol = 'admin'));

create policy "Admins can update config" on configuracion_sistema
  for update using (exists (select 1 from users where id = auth.uid() and rol = 'admin'));