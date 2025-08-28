-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS RLS PARA UPDATE - TEFILIN v1
-- =====================================================

-- 1. VERIFICAR POLÍTICAS ATUAIS
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
WHERE tablename = 'visitantes'
ORDER BY cmd;

-- 2. VERIFICAR SE O RLS ESTÁ ATIVO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'visitantes';

-- 3. TESTAR OPERAÇÃO DE UPDATE (OPCIONAL)
-- Descomente as linhas abaixo para testar se o UPDATE funciona
/*
UPDATE visitantes 
SET nome = nome 
WHERE id = (SELECT id FROM visitantes LIMIT 1);

SELECT 'UPDATE funcionou!' as resultado;
*/

-- 4. VERIFICAR SE EXISTEM DADOS NA TABELA
SELECT 
    COUNT(*) as total_visitantes,
    COUNT(CASE WHEN nome IS NOT NULL THEN 1 END) as com_nome,
    COUNT(CASE WHEN telefone IS NOT NULL THEN 1 END) as com_telefone
FROM visitantes;

-- 5. MOSTRAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'visitantes'
ORDER BY ordinal_position;

-- 6. VERIFICAR TRIGGERS
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'visitantes';

-- 7. VERIFICAR CONSTRAINTS
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'visitantes';

-- 8. MENSAGEM DE DIAGNÓSTICO
DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO DAS POLÍTICAS RLS PARA UPDATE';
    RAISE NOTICE '📋 Verifique se existem políticas para UPDATE na tabela visitantes';
    RAISE NOTICE '🔐 Verifique se o RLS está ativo';
    RAISE NOTICE '📊 Verifique se há dados na tabela para testar';
    RAISE NOTICE '⚡ Se não houver políticas UPDATE, execute o script corrigir_rls_delete.sql';
END $$;
