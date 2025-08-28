-- =====================================================
-- DIAGNÓSTICO DO BANCO DE DADOS - TEFILIN v1
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'visitantes', 'visitas', 'mensagens', 'configuracoes')
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE EXISTEM USUÁRIOS NO SUPABASE AUTH
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email IN ('recepcionista@igreja.com', 'pastor@igreja.com', 'admin@igreja.com')
ORDER BY email;

-- 4. VERIFICAR SE EXISTEM PERFIS NA TABELA PROFILES
SELECT 
  p.id,
  p.user_id,
  p.role,
  p.nome,
  p.email,
  p.ativo,
  u.email as auth_email
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.role;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. VERIFICAR SE O RLS ESTÁ ATIVO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. CONTAR REGISTROS EM CADA TABELA
SELECT 
  'profiles' as tabela,
  COUNT(*) as total_registros
FROM profiles
UNION ALL
SELECT 
  'visitantes' as tabela,
  COUNT(*) as total_registros
FROM visitantes
UNION ALL
SELECT 
  'visitas' as tabela,
  COUNT(*) as total_registros
FROM visitas
UNION ALL
SELECT 
  'mensagens' as tabela,
  COUNT(*) as total_registros
FROM mensagens
UNION ALL
SELECT 
  'configuracoes' as tabela,
  COUNT(*) as total_registros
FROM configuracoes;

-- 8. VERIFICAR CONFIGURAÇÕES DO SISTEMA
SELECT 
  chave,
  valor,
  descricao,
  categoria
FROM configuracoes
ORDER BY categoria, chave;
