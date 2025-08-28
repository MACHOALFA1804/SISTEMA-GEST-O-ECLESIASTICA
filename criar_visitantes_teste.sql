-- =====================================================
-- CRIAÇÃO DE VISITANTES DE TESTE - TEFILIN v1
-- =====================================================

-- IMPORTANTE: Execute este script APÓS executar os scripts de correção
-- para ter dados de exemplo nos contadores

-- 1. Inserir visitantes com diferentes status
INSERT INTO visitantes (nome, telefone, tipo, status, quem_acompanha, congregacao_origem, observacoes) VALUES
-- Visitantes aguardando
('João Silva', '11999999999', 'Não Cristão', 'Aguardando', 'Maria Santos', 'Igreja Batista', 'Primeira visita, muito receptivo'),
('Ana Costa', '11888888888', 'Cristão', 'Aguardando', 'Pedro Oliveira', 'Igreja Presbiteriana', 'Mudou de cidade, procurando nova igreja'),
('Carlos Ferreira', '11777777777', 'Não Cristão', 'Aguardando', 'Lucia Mendes', 'Sem igreja', 'Convidado por amigo do trabalho'),

-- Visitantes visitados
('Roberto Almeida', '11666666666', 'Não Cristão', 'Visitado', 'Pastor João', 'Sem igreja', 'Visita realizada, demonstrou interesse'),
('Fernanda Lima', '11555555555', 'Cristão', 'Visitado', 'Pastor Carlos', 'Igreja Metodista', 'Visita de boas-vindas realizada'),

-- Novos membros
('Patricia Santos', '11444444444', 'Não Cristão', 'Novo Membro', 'Pastor Roberto', 'Sem igreja', 'Batizada no último domingo'),
('Marcos Oliveira', '11333333333', 'Cristão', 'Novo Membro', 'Pastor Fernando', 'Igreja Batista', 'Transferência de igreja confirmada');

-- 2. Verificar os visitantes criados
SELECT 
    nome,
    telefone,
    tipo,
    status,
    created_at
FROM visitantes
ORDER BY created_at DESC;

-- 3. Mostrar estatísticas
SELECT 
    'Total Visitantes' as categoria,
    COUNT(*) as quantidade
FROM visitantes
UNION ALL
SELECT 
    'Aguardando' as categoria,
    COUNT(*) as quantidade
FROM visitantes
WHERE status = 'Aguardando'
UNION ALL
SELECT 
    'Visitados' as categoria,
    COUNT(*) as quantidade
FROM visitantes
WHERE status = 'Visitado'
UNION ALL
SELECT 
    'Novos Membros' as categoria,
    COUNT(*) as quantidade
FROM visitantes
WHERE status = 'Novo Membro';

-- 4. Mensagem de sucesso
SELECT 'Visitantes de teste criados com sucesso! Os contadores agora devem mostrar dados reais.' as mensagem;
