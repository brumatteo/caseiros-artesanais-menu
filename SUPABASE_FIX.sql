-- ============================================
-- FIX PARA POLÍTICAS RLS DA TABELA PROFILES
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Remover políticas antigas da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Criar políticas corretas que permitem o trigger funcionar
CREATE POLICY "Enable read access for authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Garantir que o trigger existe e está correto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Recriar a função com security definer (permite bypass do RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, confectionery_name, slug)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'confectionery_name',
    NEW.raw_user_meta_data->>'slug'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar se funcionou (execute e veja se retorna TRUE)
SELECT EXISTS (
  SELECT 1 FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created'
) AS trigger_exists;
