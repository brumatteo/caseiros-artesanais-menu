-- ============================================
-- NOVA ESTRUTURA SIMPLIFICADA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. LIMPAR ESTRUTURA ANTIGA
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.extras CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.product_sizes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CRIAR TABELA DE CONFEITARIAS
CREATE TABLE public.bakeries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  confectionery_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CRIAR TABELA DE PRODUTOS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id uuid REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- 4. HABILITAR RLS
ALTER TABLE public.bakeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS PARA BAKERIES
-- Permitir leitura pública (para página pública)
CREATE POLICY "Enable read access for all users"
ON public.bakeries FOR SELECT
USING (true);

-- Permitir que usuário autenticado crie sua própria bakery
CREATE POLICY "Enable insert for authenticated users"
ON public.bakeries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuário atualize apenas sua própria bakery
CREATE POLICY "Enable update for users based on user_id"
ON public.bakeries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. POLÍTICAS RLS PARA PRODUCTS
-- Permitir leitura pública (para página pública)
CREATE POLICY "Enable read access for all users"
ON public.products FOR SELECT
USING (true);

-- Permitir que dono da bakery crie produtos
CREATE POLICY "Enable insert for bakery owners"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- Permitir que dono da bakery atualize produtos
CREATE POLICY "Enable update for bakery owners"
ON public.products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- Permitir que dono da bakery delete produtos
CREATE POLICY "Enable delete for bakery owners"
ON public.products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_bakeries_slug ON public.bakeries(slug);
CREATE INDEX idx_bakeries_user_id ON public.bakeries(user_id);
CREATE INDEX idx_products_bakery_id ON public.products(bakery_id);
