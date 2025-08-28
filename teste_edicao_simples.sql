-- =====================================================
-- TESTE SIMPLES DE EDIÇÃO - TEFILIN v1
-- =====================================================
-- Execute este script APÓS executar corrigir_rls_delete.sql
-- para verificar se a edição está funcionando

-- 1. VERIFICAR SE EXISTEM VISITANTES PARA TESTAR
SELECT 
    COUNT(*) as total_visitantes,
    MIN(nome) as primeiro_nome,
    MAX(created_at) as ultimo_cadastro
FROM visitantes;

-- 2. TESTAR OPERAÇÃO DE UPDATE (se houver dados)
DO $$
DECLARE
    visitante_id UUID;
    nome_original TEXT;
    nome_novo TEXT;
BEGIN
    -- Pegar o primeiro visitante disponível
    SELECT id, nome INTO visitante_id, nome_original 
    FROM visitantes 
    LIMIT 1;
    
    IF visitante_id IS NOT NULL THEN
        -- Fazer um teste de UPDATE
        UPDATE visitantes 
        SET nome = nome || ' (TESTE)'
        WHERE id = visitante_id;
        
        -- Verificar se foi atualizado
        SELECT nome INTO nome_novo FROM visitantes WHERE id = visitante_id;
        
        RAISE NOTICE '✅ TESTE DE UPDATE FUNCIONOU!';
        RAISE NOTICE '📝 Nome original: %', nome_original;
        RAISE NOTICE '📝 Nome após update: %', nome_novo;
        
        -- Reverter a mudança
        UPDATE visitantes 
        SET nome = nome_original
        WHERE id = visitante_id;
        
        RAISE NOTICE '🔄 Mudança revertida com sucesso!';
        
    ELSE
        RAISE NOTICE '⚠️ Nenhum visitante encontrado para testar';
        RAISE NOTICE '💡 Adicione alguns visitantes primeiro usando create_test_visitantes.sql';
    END IF;
END $$;

-- 3. VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'visitantes'
ORDER BY cmd;

-- 4. MENSAGEM FINAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RESULTADO DO TESTE:';
    RAISE NOTICE '✅ Se você viu "TESTE DE UPDATE FUNCIONOU!", a edição está funcionando!';
    RAISE NOTICE '✅ Se você viu "Mudança revertida com sucesso!", tudo está OK!';
    RAISE NOTICE '🔓 Agora teste a edição no sistema web!';
    RAISE NOTICE '📱 Vá para "Histórico de Visitantes" e clique no botão ✏️ (Editar)';
    RAISE NOTICE '💾 Altere algum campo e clique no botão verde "Salvar"';
END $$;
