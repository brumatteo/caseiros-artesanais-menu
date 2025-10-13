-- ============================================
-- MIGRAÇÃO CORRIGIDA: Fix para salvamento de dados
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar e criar coluna settings se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bakeries' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.bakeries ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Adicionar campos extras na tabela products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'sizes'
  ) THEN
    ALTER TABLE public.products ADD COLUMN sizes jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.products ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'show_image'
  ) THEN
    ALTER TABLE public.products ADD COLUMN show_image boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'product_order'
  ) THEN
    ALTER TABLE public.products ADD COLUMN product_order integer DEFAULT 0;
  END IF;
END $$;

-- 3. Criar tabela extras
CREATE TABLE IF NOT EXISTS public.extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id uuid REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price decimal(10,2) NOT NULL,
  extra_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Criar tabela sections
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id uuid REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  visible boolean DEFAULT true,
  section_order integer DEFAULT 0,
  product_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. Criar tabela tags
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id uuid REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  emoji text,
  created_at timestamptz DEFAULT now()
);

-- 6. Habilitar RLS nas novas tabelas
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 7. Remover políticas antigas se existirem e criar novas
DROP POLICY IF EXISTS "Enable read access for all users" ON public.extras;
DROP POLICY IF EXISTS "Enable insert for bakery owners" ON public.extras;
DROP POLICY IF EXISTS "Enable update for bakery owners" ON public.extras;
DROP POLICY IF EXISTS "Enable delete for bakery owners" ON public.extras;

CREATE POLICY "Enable read access for all users" ON public.extras 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for bakery owners" ON public.extras 
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for bakery owners" ON public.extras 
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for bakery owners" ON public.extras 
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

-- 8. Políticas para sections
DROP POLICY IF EXISTS "Enable read access for all users" ON public.sections;
DROP POLICY IF EXISTS "Enable insert for bakery owners" ON public.sections;
DROP POLICY IF EXISTS "Enable update for bakery owners" ON public.sections;
DROP POLICY IF EXISTS "Enable delete for bakery owners" ON public.sections;

CREATE POLICY "Enable read access for all users" ON public.sections 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for bakery owners" ON public.sections 
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for bakery owners" ON public.sections 
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for bakery owners" ON public.sections 
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

-- 9. Políticas para tags
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tags;
DROP POLICY IF EXISTS "Enable insert for bakery owners" ON public.tags;
DROP POLICY IF EXISTS "Enable update for bakery owners" ON public.tags;
DROP POLICY IF EXISTS "Enable delete for bakery owners" ON public.tags;

CREATE POLICY "Enable read access for all users" ON public.tags 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for bakery owners" ON public.tags 
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for bakery owners" ON public.tags 
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for bakery owners" ON public.tags 
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bakeries 
      WHERE bakeries.id = bakery_id 
      AND bakeries.user_id = auth.uid()
    )
  );

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_extras_bakery_id ON public.extras(bakery_id);
CREATE INDEX IF NOT EXISTS idx_sections_bakery_id ON public.sections(bakery_id);
CREATE INDEX IF NOT EXISTS idx_tags_bakery_id ON public.tags(bakery_id);
CREATE INDEX IF NOT EXISTS idx_products_bakery_id ON public.products(bakery_id);

-- FIM DA MIGRAÇÃO
-- ✅ Banco de dados configurado com sucesso!
