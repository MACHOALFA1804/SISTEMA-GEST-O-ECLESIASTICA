-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS - TEFILIN v1
-- =====================================================
-- Este script remove todas as políticas RLS existentes e cria novas
-- para permitir INSERT, UPDATE, DELETE e SELECT para usuários autenticados

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================

-- Remover políticas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Remover políticas da tabela visitantes
DROP POLICY IF EXISTS "visitantes_select_policy" ON visitantes;
DROP POLICY IF EXISTS "visitantes_insert_policy" ON visitantes;
DROP POLICY IF EXISTS "visitantes_update_policy" ON visitantes;
DROP POLICY IF EXISTS "visitantes_delete_policy" ON visitantes;

-- Remover políticas da tabela visitas
DROP POLICY IF EXISTS "visitas_select_policy" ON visitas;
DROP POLICY IF EXISTS "visitas_insert_policy" ON visitas;
DROP POLICY IF EXISTS "visitas_update_policy" ON visitas;
DROP POLICY IF EXISTS "visitas_delete_policy" ON visitas;

-- Remover políticas da tabela mensagens
DROP POLICY IF EXISTS "mensagens_select_policy" ON mensagens;
DROP POLICY IF EXISTS "mensagens_insert_policy" ON mensagens;
DROP POLICY IF EXISTS "mensagens_update_policy" ON mensagens;
DROP POLICY IF EXISTS "mensagens_delete_policy" ON mensagens;

-- Remover políticas da tabela configuracoes
DROP POLICY IF EXISTS "configuracoes_select_policy" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_insert_policy" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_update_policy" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_delete_policy" ON configuracoes;

-- 2. CRIAR NOVAS POLÍTICAS RLS
-- =====================================================

-- Políticas para tabela profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela visitantes
CREATE POLICY "visitantes_select_policy" ON visitantes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "visitantes_insert_policy" ON visitantes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "visitantes_update_policy" ON visitantes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "visitantes_delete_policy" ON visitantes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela visitas
CREATE POLICY "visitas_select_policy" ON visitas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "visitas_insert_policy" ON visitas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "visitas_update_policy" ON visitas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "visitas_delete_policy" ON visitas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela mensagens
CREATE POLICY "mensagens_select_policy" ON mensagens
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "mensagens_insert_policy" ON mensagens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "mensagens_update_policy" ON mensagens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "mensagens_delete_policy" ON mensagens
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela configuracoes
CREATE POLICY "configuracoes_select_policy" ON configuracoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "configuracoes_insert_policy" ON configuracoes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "configuracoes_update_policy" ON configuracoes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "configuracoes_delete_policy" ON configuracoes
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- =====================================================

-- Mostrar todas as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('profiles', 'visitantes', 'visitas', 'mensagens', 'configuracoes')
ORDER BY tablename, cmd;

-- 4. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ POLÍTICAS RLS CORRIGIDAS COM SUCESSO!';
    RAISE NOTICE '🔓 Todas as operações (SELECT, INSERT, UPDATE, DELETE) agora são permitidas para usuários autenticados';
    RAISE NOTICE '📋 Execute o script verificar_rls_update.sql para confirmar que tudo está funcionando';
    RAISE NOTICE '🎯 Agora você pode testar a edição de visitantes no sistema!';
END $$;
