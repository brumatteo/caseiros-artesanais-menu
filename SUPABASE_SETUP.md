# Configuração do Supabase

## SQL Migration - Execute no Supabase SQL Editor

Copie e execute este código SQL no painel do Supabase (SQL Editor):

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  confectionery_name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Anyone can view profiles by slug"
  on public.profiles for select
  using (true);

-- Create user_settings table
create table public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  brand_name text not null,
  show_logo boolean default true,
  show_name boolean default true,
  logo_image text,
  hero_logo_image text,
  show_hero_logo boolean default false,
  hero_image text,
  hero_image_position text default 'center',
  hero_overlay_color text default '#000000',
  hero_overlay_opacity numeric default 0.5,
  hero_title text not null,
  hero_subtitle text not null,
  whatsapp_number text not null,
  whatsapp_message text not null,
  about_title text not null,
  about_text text not null,
  about_image text,
  show_about boolean default true,
  extra_info_title text not null,
  extra_info_text text not null,
  show_extra_info boolean default true,
  footer_text text not null,
  footer_address text,
  footer_phone text,
  instagram_url text,
  color_primary text,
  color_secondary text,
  color_accent text,
  color_background text,
  color_foreground text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_settings enable row level security;

create policy "Users can manage their own settings" on public.user_settings for all using (auth.uid() = user_id);
create policy "Anyone can view settings" on public.user_settings for select using (true);

-- Create products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text not null,
  image text,
  show_image boolean default true,
  tags text[] default '{}',
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Users can manage their products" on public.products for all using (auth.uid() = user_id);
create policy "Anyone can view products" on public.products for select using (true);

-- Create product_sizes table
create table public.product_sizes (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  order_index integer not null default 0
);

alter table public.product_sizes enable row level security;
create policy "Users manage sizes" on public.product_sizes for all using (exists (select 1 from public.products where products.id = product_sizes.product_id and products.user_id = auth.uid()));
create policy "Anyone can view sizes" on public.product_sizes for select using (true);

-- Create sections, extras, and tags tables (similar pattern)
create table public.sections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  visible boolean default true,
  order_index integer not null default 0,
  product_ids text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sections enable row level security;
create policy "Users manage sections" on public.sections for all using (auth.uid() = user_id);
create policy "Anyone views sections" on public.sections for select using (true);

create table public.extras (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text not null,
  price numeric not null,
  image text,
  show_image boolean default true,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.extras enable row level security;
create policy "Users manage extras" on public.extras for all using (auth.uid() = user_id);
create policy "Anyone views extras" on public.extras for select using (true);

create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text not null,
  emoji text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tags enable row level security;
create policy "Users manage tags" on public.tags for all using (auth.uid() = user_id);
create policy "Anyone views tags" on public.tags for select using (true);

-- Trigger for new users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, confectionery_name, slug)
  values (new.id, new.email, new.raw_user_meta_data->>'confectionery_name', new.raw_user_meta_data->>'slug');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Como usar:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole e execute todo o SQL acima
4. Pronto! Seu banco está configurado

## Fluxo da aplicação:

- **/** → Cadastro de nova confeitaria
- **/admin** → Login e painel de edição
- **/:slug** → Página pública da confeitaria
