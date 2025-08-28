-- =====================================================
-- CORREÇÃO AUTOMÁTICA - TEFILIN v1
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM E CRIAR SE NECESSÁRIO
DO $$
BEGIN
    -- Criar tabela profiles se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            role TEXT CHECK (role IN ('admin', 'pastor', 'recepcionista')) NOT NULL,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela profiles criada com sucesso!';
    ELSE
        -- Remover registros duplicados primeiro
        DELETE FROM profiles a USING profiles b 
        WHERE a.id > b.id 
        AND a.user_id = b.user_id;
        
        RAISE NOTICE 'Registros duplicados removidos!';
        
        -- Adicionar constraint única se não existir
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'profiles_user_id_key' 
            AND conrelid = 'profiles'::regclass
        ) THEN
            ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
            RAISE NOTICE 'Constraint única adicionada na coluna user_id!';
        ELSE
            RAISE NOTICE 'Constraint única já existe na coluna user_id!';
        END IF;
    END IF;
END $$;

-- 2. ATIVAR RLS NA TABELA PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR/ATUALIZAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. INSERIR PERFIS PARA OS USUÁRIOS EXISTENTES
DO $$
DECLARE
    recepcionista_id UUID;
    pastor_id UUID;
    admin_id UUID;
BEGIN
    -- Buscar IDs dos usuários
    SELECT id INTO recepcionista_id FROM auth.users WHERE email = 'recepcionista@igreja.com';
    SELECT id INTO pastor_id FROM auth.users WHERE email = 'pastor@igreja.com';
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@igreja.com';
    
    -- Inserir perfil para Recepcionista
    IF recepcionista_id IS NOT NULL THEN
        -- Remover perfil existente se houver
        DELETE FROM profiles WHERE user_id = recepcionista_id;
        
        INSERT INTO profiles (user_id, role, nome, email, ativo)
        VALUES (recepcionista_id, 'recepcionista', 'Recepcionista', 'recepcionista@igreja.com', true);
        RAISE NOTICE 'Perfil do recepcionista criado!';
    ELSE
        RAISE NOTICE 'Usuário recepcionista@igreja.com não encontrado no auth.users!';
    END IF;
    
    -- Inserir perfil para Pastor
    IF pastor_id IS NOT NULL THEN
        -- Remover perfil existente se houver
        DELETE FROM profiles WHERE user_id = pastor_id;
        
        INSERT INTO profiles (user_id, role, nome, email, ativo)
        VALUES (pastor_id, 'pastor', 'Pastor', 'pastor@igreja.com', true);
        RAISE NOTICE 'Perfil do pastor criado!';
    ELSE
        RAISE NOTICE 'Usuário pastor@igreja.com não encontrado no auth.users!';
    END IF;
    
    -- Inserir perfil para Admin
    IF admin_id IS NOT NULL THEN
        -- Remover perfil existente se houver
        DELETE FROM profiles WHERE user_id = admin_id;
        
        INSERT INTO profiles (user_id, role, nome, email, ativo)
        VALUES (admin_id, 'admin', 'Administrador', 'admin@igreja.com', true);
        RAISE NOTICE 'Perfil do admin criado!';
    ELSE
        RAISE NOTICE 'Usuário admin@igreja.com não encontrado no auth.users!';
    END IF;
END $$;

-- 5. VERIFICAR RESULTADO
SELECT 
    'RESULTADO DA CORREÇÃO' as status,
    COUNT(*) as total_perfis
FROM profiles;

-- 6. MOSTRAR PERFIS CRIADOS
SELECT 
    p.role,
    p.nome,
    p.email,
    p.ativo,
    u.email as auth_email,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ Usuário encontrado'
        ELSE '❌ Usuário não encontrado'
    END as status_usuario
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.role;

-- 7. MENSAGEM DE SUCESSO
SELECT 'Correção automática concluída! Verifique os resultados acima.' as mensagem;
