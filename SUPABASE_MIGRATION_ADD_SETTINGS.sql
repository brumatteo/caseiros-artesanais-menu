-- ============================================
-- MIGRAÇÃO: Adicionar campos para settings
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Adicionar campo settings (JSONB) na tabela bakeries
ALTER TABLE public.bakeries
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- 2. Adicionar campos extras na tabela products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS show_image boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS product_order integer DEFAULT 0;

-- 3. Criar tabelas para extras, sections e tags
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

CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id uuid REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  visible boolean DEFAULT true,
  section_order integer DEFAULT 0,
  product_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id uuid REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  emoji text,
  created_at timestamptz DEFAULT now()
);

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para EXTRAS
CREATE POLICY "Enable read access for all users" ON public.extras FOR SELECT USING (true);
CREATE POLICY "Enable insert for bakery owners" ON public.extras FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Enable update for bakery owners" ON public.extras FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Enable delete for bakery owners" ON public.extras FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));

-- 6. Políticas RLS para SECTIONS
CREATE POLICY "Enable read access for all users" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Enable insert for bakery owners" ON public.sections FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Enable update for bakery owners" ON public.sections FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Enable delete for bakery owners" ON public.sections FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));

-- 7. Políticas RLS para TAGS
CREATE POLICY "Enable read access for all users" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Enable insert for bakery owners" ON public.tags FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Enable update for bakery owners" ON public.tags FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Enable delete for bakery owners" ON public.tags FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = bakery_id AND bakeries.user_id = auth.uid()));

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_extras_bakery_id ON public.extras(bakery_id);
CREATE INDEX IF NOT EXISTS idx_sections_bakery_id ON public.sections(bakery_id);
CREATE INDEX IF NOT EXISTS idx_tags_bakery_id ON public.tags(bakery_id);
