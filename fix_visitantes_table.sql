-- =====================================================
-- CORREÇÃO DA TABELA VISITANTES - TEFILIN v1
-- =====================================================

-- 1. REMOVER TABELA EXISTENTE (se houver)
DROP TABLE IF EXISTS visitantes CASCADE;

-- 2. CRIAR TABELA VISITANTES COM ESTRUTURA CORRETA
CREATE TABLE visitantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('Cristão', 'Não Cristão', 'Pregador', 'Outro')) DEFAULT 'Cristão',
    status TEXT CHECK (status IN ('Aguardando', 'Aguardando Visita', 'Visitado', 'Novo Membro', 'Pendente')) DEFAULT 'Aguardando',
    quem_acompanha TEXT,
    congregacao_origem TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_visitantes_nome ON visitantes(nome);
CREATE INDEX idx_visitantes_telefone ON visitantes(telefone);
CREATE INDEX idx_visitantes_tipo ON visitantes(tipo);
CREATE INDEX idx_visitantes_status ON visitantes(status);
CREATE INDEX idx_visitantes_created_at ON visitantes(created_at);

-- 4. CRIAR POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver visitantes" ON visitantes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir visitantes" ON visitantes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar visitantes" ON visitantes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. INSERIR DADOS DE TESTE
INSERT INTO visitantes (nome, telefone, tipo, status, quem_acompanha, congregacao_origem, observacoes) VALUES
('João Silva', '11999999999', 'Não Cristão', 'Aguardando Visita', 'Maria Santos', 'Igreja Batista', 'Primeira visita'),
('Ana Costa', '11888888888', 'Cristão', 'Visitado', 'Pedro Oliveira', 'Assembleia de Deus', 'Interessada em membros'),
('Carlos Lima', '11777777777', 'Pregador', 'Novo Membro', 'João Silva', 'Igreja Presbiteriana', 'Pregador visitante');

-- 6. MENSAGEM DE CONFIRMAÇÃO
SELECT 'Tabela visitantes criada com sucesso!' as status;
SELECT COUNT(*) as total_visitantes FROM visitantes;
