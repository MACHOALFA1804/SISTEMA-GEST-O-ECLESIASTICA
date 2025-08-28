-- =====================================================
-- TESTE SIMPLES - TEFILIN v1
-- =====================================================

-- 1. VERIFICAR SE A TABELA PROFILES EXISTE
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ Tabela profiles existe'
        ELSE '❌ Tabela profiles NÃO existe'
    END as status_tabela;

-- 2. VERIFICAR SE EXISTEM USUÁRIOS NO AUTH
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM auth.users WHERE email = 'recepcionista@igreja.com') 
        THEN '✅ Usuário recepcionista existe'
        ELSE '❌ Usuário recepcionista NÃO existe'
    END as status_recepcionista;

-- 3. VERIFICAR SE EXISTEM PERFIS
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM profiles WHERE email = 'recepcionista@igreja.com') 
        THEN '✅ Perfil recepcionista existe'
        ELSE '❌ Perfil recepcionista NÃO existe'
    END as status_perfil;

-- 4. MOSTRAR TODOS OS PERFIS
SELECT 
    role,
    nome,
    email,
    ativo
FROM profiles
ORDER BY role;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. TESTE DE CONEXÃO
SELECT 
    'Teste de conexão' as teste,
    current_database() as banco,
    current_user as usuario,
    version() as versao_postgres;
