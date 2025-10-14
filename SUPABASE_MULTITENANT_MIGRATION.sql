-- ============================================
-- MIGRATION: Sistema Multi-Tenant com RLS
-- ============================================
-- Esta migration implementa isolamento completo de dados por usuário
-- Cada confeitaria tem seus próprios dados isolados por user_id

-- 1. Verificar se user_id já existe (não adicionar se já existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bakeries' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.bakeries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX idx_bakeries_user_id ON public.bakeries(user_id);
    END IF;
END $$;

-- 2. Habilitar RLS em todas as tabelas
ALTER TABLE public.bakeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 3. Remover policies antigas se existirem
DROP POLICY IF EXISTS "Public read access for bakeries" ON public.bakeries;
DROP POLICY IF EXISTS "Users can insert their own bakery" ON public.bakeries;
DROP POLICY IF EXISTS "Users can update their own bakery" ON public.bakeries;
DROP POLICY IF EXISTS "Users can delete their own bakery" ON public.bakeries;

DROP POLICY IF EXISTS "Public read access for products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

DROP POLICY IF EXISTS "Public read access for extras" ON public.extras;
DROP POLICY IF EXISTS "Authenticated users can insert extras" ON public.extras;
DROP POLICY IF EXISTS "Authenticated users can update extras" ON public.extras;
DROP POLICY IF EXISTS "Authenticated users can delete extras" ON public.extras;

DROP POLICY IF EXISTS "Public read access for sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can insert sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can update sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can delete sections" ON public.sections;

DROP POLICY IF EXISTS "Public read access for tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can update tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can delete tags" ON public.tags;

-- 4. Criar policies para BAKERIES
-- Leitura pública (qualquer pessoa pode ver confeitarias)
CREATE POLICY "Public can read bakeries"
ON public.bakeries FOR SELECT
TO public
USING (true);

-- Usuários autenticados podem criar sua própria confeitaria
CREATE POLICY "Users can create their own bakery"
ON public.bakeries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas sua própria confeitaria
CREATE POLICY "Users can update their own bakery"
ON public.bakeries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas sua própria confeitaria
CREATE POLICY "Users can delete their own bakery"
ON public.bakeries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Criar policies para PRODUCTS
-- Leitura pública
CREATE POLICY "Public can read products"
ON public.products FOR SELECT
TO public
USING (true);

-- Inserir apenas produtos da própria confeitaria
CREATE POLICY "Users can create products for their bakery"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = products.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- Atualizar apenas produtos da própria confeitaria
CREATE POLICY "Users can update their own products"
ON public.products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = products.bakery_id
    AND bakeries.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = products.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- Deletar apenas produtos da própria confeitaria
CREATE POLICY "Users can delete their own products"
ON public.products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = products.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- 6. Criar policies para EXTRAS
CREATE POLICY "Public can read extras"
ON public.extras FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create extras for their bakery"
ON public.extras FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = extras.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own extras"
ON public.extras FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = extras.bakery_id
    AND bakeries.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = extras.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own extras"
ON public.extras FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = extras.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- 7. Criar policies para SECTIONS
CREATE POLICY "Public can read sections"
ON public.sections FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create sections for their bakery"
ON public.sections FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = sections.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own sections"
ON public.sections FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = sections.bakery_id
    AND bakeries.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = sections.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own sections"
ON public.sections FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = sections.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- 8. Criar policies para TAGS
CREATE POLICY "Public can read tags"
ON public.tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create tags for their bakery"
ON public.tags FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = tags.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own tags"
ON public.tags FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = tags.bakery_id
    AND bakeries.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = tags.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own tags"
ON public.tags FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bakeries
    WHERE bakeries.id = tags.bakery_id
    AND bakeries.user_id = auth.uid()
  )
);

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_bakery_id ON public.products(bakery_id);
CREATE INDEX IF NOT EXISTS idx_extras_bakery_id ON public.extras(bakery_id);
CREATE INDEX IF NOT EXISTS idx_sections_bakery_id ON public.sections(bakery_id);
CREATE INDEX IF NOT EXISTS idx_tags_bakery_id ON public.tags(bakery_id);
CREATE INDEX IF NOT EXISTS idx_bakeries_slug ON public.bakeries(slug);

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se não há erros
-- 3. Teste criando uma nova confeitaria
-- 4. Teste acessando /:slug/admin
-- 5. Verifique se os dados estão isolados por usuário
