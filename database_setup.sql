-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS TEFILIN v1
-- =====================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role TEXT CHECK (role IN ('admin', 'pastor', 'recepcionista')) NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE VISITANTES
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('Cristão', 'Não Cristão', 'Pregador', 'Outro')) NOT NULL,
    status TEXT CHECK (status IN ('Aguardando', 'Aguardando Visita', 'Visitado', 'Novo Membro', 'Pendente')) DEFAULT 'Aguardando',
    quem_acompanha TEXT,
    congregacao_origem TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE VISITAS
CREATE TABLE IF NOT EXISTS visitas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitante_id UUID REFERENCES visitantes(id) ON DELETE CASCADE,
    pastor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    data_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
    data_realizada TIMESTAMP WITH TIME ZONE,
    tipo_visita TEXT CHECK (tipo_visita IN ('Presencial', 'Telefone', 'WhatsApp', 'Outro')) DEFAULT 'Presencial',
    status TEXT CHECK (status IN ('Agendada', 'Realizada', 'Cancelada', 'Reagendada')) DEFAULT 'Agendada',
    observacoes TEXT,
    requer_acompanhamento BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE MENSAGENS
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitante_id UUID REFERENCES visitantes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    template_usado TEXT,
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_envio TEXT CHECK (status_envio IN ('Enviada', 'Falhada', 'Pendente')) DEFAULT 'Pendente',
    whatsapp_message_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT CHECK (categoria IN ('sistema', 'igreja', 'whatsapp', 'email', 'pdf')) DEFAULT 'sistema',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE TENTATIVAS DE LOGIN
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    tentativas INTEGER DEFAULT 1,
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
('igreja_nome', 'Igreja Exemplo', 'Nome da igreja', 'igreja'),
('igreja_endereco', 'Rua Exemplo, 123 - Bairro - Cidade/UF', 'Endereço da igreja', 'igreja'),
('igreja_telefone', '(11) 99999-9999', 'Telefone da igreja', 'igreja'),
('sistema_titulo', 'TEFILIN v1', 'Título do sistema', 'sistema'),
('whatsapp_api_key', '', 'Chave da API do WhatsApp', 'whatsapp'),
('whatsapp_phone_number', '', 'Número do WhatsApp da igreja', 'whatsapp');

-- =====================================================
-- CRIAR POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Política para profiles (usuários autenticados podem ver perfis)
CREATE POLICY "Authenticated users can view profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para profiles (usuários podem editar seus próprios perfis)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para visitantes (todos os usuários autenticados podem ver)
CREATE POLICY "Authenticated users can view visitantes" ON visitantes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para visitas (todos os usuários autenticados podem ver)
CREATE POLICY "Authenticated users can view visitas" ON visitas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para mensagens (todos os usuários autenticados podem ver)
CREATE POLICY "Authenticated users can view mensagens" ON mensagens
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para configurações (todos os usuários autenticados podem ver)
CREATE POLICY "Authenticated users can view configuracoes" ON configuracoes
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- CRIAR FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas que têm updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitantes_updated_at BEFORE UPDATE ON visitantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitas_updated_at BEFORE UPDATE ON visitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_login_attempts_updated_at BEFORE UPDATE ON login_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================
SELECT 'Banco de dados TEFILIN v1 configurado com sucesso!' as status;
