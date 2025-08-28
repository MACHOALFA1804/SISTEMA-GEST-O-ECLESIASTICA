-- Script para criar tabelas de dízimos e ofertas no sistema Tefilin
-- Executar no Supabase SQL Editor

-- Tabela de Dizimistas/Ofertantes
CREATE TABLE IF NOT EXISTS dizimistas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    data_nascimento DATE,
    profissao VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Suspenso')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contribuições (Dízimos e Ofertas)
CREATE TABLE IF NOT EXISTS contribuicoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dizimista_id UUID REFERENCES dizimistas(id) ON DELETE CASCADE,
    tipo_contribuicao VARCHAR(50) NOT NULL CHECK (tipo_contribuicao IN ('Dízimo', 'Oferta de Gratidão', 'Oferta Especial', 'Missões', 'Construção', 'Outro')),
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_contribuicao DATE NOT NULL,
    forma_pagamento VARCHAR(50) DEFAULT 'Dinheiro' CHECK (forma_pagamento IN ('Dinheiro', 'PIX', 'Cartão', 'Transferência', 'Cheque', 'Outro')),
    numero_envelope VARCHAR(50),
    observacoes TEXT,
    usuario_cadastro UUID, -- ID do usuário que registrou a contribuição
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Metas de Arrecadação
CREATE TABLE IF NOT EXISTS metas_arrecadacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    tipo_contribuicao VARCHAR(50) NOT NULL,
    valor_meta DECIMAL(10,2) NOT NULL CHECK (valor_meta > 0),
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ano, mes, tipo_contribuicao)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dizimistas_nome ON dizimistas(nome);
CREATE INDEX IF NOT EXISTS idx_dizimistas_telefone ON dizimistas(telefone);
CREATE INDEX IF NOT EXISTS idx_dizimistas_status ON dizimistas(status);

CREATE INDEX IF NOT EXISTS idx_contribuicoes_dizimista ON contribuicoes(dizimista_id);
CREATE INDEX IF NOT EXISTS idx_contribuicoes_data ON contribuicoes(data_contribuicao);
CREATE INDEX IF NOT EXISTS idx_contribuicoes_tipo ON contribuicoes(tipo_contribuicao);
CREATE INDEX IF NOT EXISTS idx_contribuicoes_valor ON contribuicoes(valor);

CREATE INDEX IF NOT EXISTS idx_metas_ano_mes ON metas_arrecadacao(ano, mes);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dizimistas_updated_at BEFORE UPDATE ON dizimistas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contribuicoes_updated_at BEFORE UPDATE ON contribuicoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas_arrecadacao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Configurar conforme necessário
ALTER TABLE dizimistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_arrecadacao ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (ajustar conforme necessário)
CREATE POLICY "Permitir leitura para usuários autenticados" ON dizimistas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON dizimistas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON dizimistas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON contribuicoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON contribuicoes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON contribuicoes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON metas_arrecadacao
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON metas_arrecadacao
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON metas_arrecadacao
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO dizimistas (nome, telefone, email, status) VALUES
('João Silva', '11999999999', 'joao@email.com', 'Ativo'),
('Maria Santos', '11888888888', 'maria@email.com', 'Ativo'),
('Pedro Oliveira', '11777777777', 'pedro@email.com', 'Ativo');

-- Inserir algumas contribuições de exemplo
INSERT INTO contribuicoes (dizimista_id, tipo_contribuicao, valor, data_contribuicao, forma_pagamento) 
SELECT 
    d.id,
    'Dízimo',
    200.00,
    CURRENT_DATE - INTERVAL '1 month',
    'PIX'
FROM dizimistas d WHERE d.nome = 'João Silva';

INSERT INTO contribuicoes (dizimista_id, tipo_contribuicao, valor, data_contribuicao, forma_pagamento) 
SELECT 
    d.id,
    'Oferta de Gratidão',
    50.00,
    CURRENT_DATE - INTERVAL '15 days',
    'Dinheiro'
FROM dizimistas d WHERE d.nome = 'Maria Santos';

-- Inserir meta de exemplo
INSERT INTO metas_arrecadacao (ano, mes, tipo_contribuicao, valor_meta, descricao) VALUES
(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, 'Dízimo', 10000.00, 'Meta mensal de dízimos');

COMMENT ON TABLE dizimistas IS 'Tabela para armazenar informações dos dizimistas e ofertantes';
COMMENT ON TABLE contribuicoes IS 'Tabela para registrar todas as contribuições (dízimos e ofertas)';
COMMENT ON TABLE metas_arrecadacao IS 'Tabela para definir metas de arrecadação por período e tipo';

