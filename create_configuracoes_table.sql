-- =====================================================
-- CRIAÇÃO DA TABELA DE CONFIGURAÇÕES - TEFILIN v1
-- =====================================================

-- 1. REMOVER TABELA EXISTENTE (se houver)
DROP TABLE IF EXISTS configuracoes CASCADE;

-- 2. CRIAR TABELA DE CONFIGURAÇÕES
CREATE TABLE configuracoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    valor TEXT,
    categoria TEXT DEFAULT 'sistema',
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERIR CONFIGURAÇÕES PADRÃO DO SISTEMA
INSERT INTO configuracoes (chave, valor, categoria, descricao) VALUES
-- Configurações do Sistema
('titulo_sistema', 'TEFILIN v1', 'sistema', 'Título principal do sistema'),
('subtitulo_sistema', 'Sistema de Gestão de Visitantes', 'sistema', 'Subtítulo do sistema'),
('cor_primaria', '#22d3ee', 'sistema', 'Cor primária do sistema (cyan)'),
('cor_secundaria', '#0f172a', 'sistema', 'Cor secundária do sistema (slate)'),
('versiculo_biblico', 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor', 'sistema', 'Versículo bíblico padrão'),
('referencia_versiculo', 'Colossenses 3:23', 'sistema', 'Referência do versículo bíblico'),
('mensagem_bem_vindo', 'Bem-vindo ao sistema de gestão de visitantes', 'sistema', 'Mensagem de boas-vindas'),
('texto_rodape', 'DEV EMERSON 2025', 'sistema', 'Texto do rodapé'),

-- Configurações da Igreja
('nome_igreja', 'Assembleia de Deus Vila Evangélica', 'igreja', 'Nome da igreja'),
('endereco_igreja', '', 'igreja', 'Endereço completo da igreja'),
('telefone_igreja', '', 'igreja', 'Telefone da igreja'),
('email_igreja', '', 'igreja', 'E-mail de contato da igreja'),
('logo_igreja', '', 'igreja', 'URL da logo da igreja'),

-- Configurações de Relatórios
('incluir_logo', 'true', 'relatorios', 'Incluir logo nos relatórios PDF'),
('incluir_endereco', 'true', 'relatorios', 'Incluir endereço nos relatórios PDF'),
('incluir_versiculo', 'true', 'relatorios', 'Incluir versículo bíblico nos relatórios PDF'),
('fonte_titulo', 'Arial', 'relatorios', 'Fonte dos títulos nos relatórios'),
('tamanho_fonte', '12', 'relatorios', 'Tamanho da fonte nos relatórios'),
('margem_pagina', '20', 'relatorios', 'Margem das páginas em mm'),
('orientacao_pagina', 'portrait', 'relatorios', 'Orientação das páginas (portrait/landscape)'),
('formato_data', 'DD/MM/YYYY', 'relatorios', 'Formato de data nos relatórios'),

-- Configurações do WhatsApp
('whatsapp_api_key', '', 'whatsapp', 'Chave da API do WhatsApp Business'),
('whatsapp_instance_id', '', 'whatsapp', 'ID da instância do WhatsApp'),
('whatsapp_webhook_url', '', 'whatsapp', 'URL do webhook do WhatsApp'),
('whatsapp_auto_resposta', 'true', 'whatsapp', 'Ativar auto-resposta do WhatsApp'),
('whatsapp_mensagem_padrao', 'Olá! Obrigado por entrar em contato conosco. Em breve retornaremos sua mensagem.', 'whatsapp', 'Mensagem padrão de auto-resposta'),
('whatsapp_horario_atendimento', '08:00 - 18:00', 'whatsapp', 'Horário de atendimento'),
('whatsapp_dias_atendimento', 'Segunda a Sexta', 'whatsapp', 'Dias de atendimento');

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
CREATE TRIGGER update_configuracoes_updated_at 
    BEFORE UPDATE ON configuracoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. CRIAR POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver configurações" ON configuracoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir configurações" ON configuracoes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar configurações" ON configuracoes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. MENSAGEM DE CONFIRMAÇÃO
SELECT 'Tabela de configurações criada com sucesso!' as status;
SELECT COUNT(*) as total_configuracoes FROM configuracoes;
