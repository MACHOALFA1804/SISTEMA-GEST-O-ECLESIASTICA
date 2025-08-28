-- Tabelas para Sistema de Administração Avançado
-- TEFILIN v1 - Dashboard Administrativo

-- 1. Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json, color, file
    categoria VARCHAR(50) DEFAULT 'geral', -- geral, tema, textos, relatorios, nicho
    descricao TEXT,
    editavel BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de temas e cores personalizáveis
CREATE TABLE IF NOT EXISTS temas_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT false,
    cores JSONB NOT NULL, -- Objeto JSON com todas as cores
    fontes JSONB, -- Configurações de fontes
    espacamentos JSONB, -- Configurações de espaçamentos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de textos personalizáveis
CREATE TABLE IF NOT EXISTS textos_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(200) NOT NULL UNIQUE,
    texto_original TEXT NOT NULL,
    texto_personalizado TEXT,
    categoria VARCHAR(50), -- dashboard, login, relatorios, etc.
    pagina VARCHAR(50), -- admin, pastor, recepcao, dizimista
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de usuários do sistema (expandida)
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'usuario', -- admin, pastor, recepcao, dizimista, usuario
    permissoes JSONB DEFAULT '{}', -- Permissões específicas
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    foto_perfil TEXT, -- URL da foto
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    observacoes TEXT,
    created_by UUID REFERENCES usuarios_sistema(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de logotipos e imagens do sistema
CREATE TABLE IF NOT EXISTS logotipos_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- logo_principal, logo_login, favicon, background
    arquivo_url TEXT NOT NULL,
    arquivo_nome VARCHAR(255),
    tamanho_bytes INTEGER,
    dimensoes JSONB, -- {width: 200, height: 100}
    ativo BOOLEAN DEFAULT false,
    especificacoes JSONB, -- Especificações técnicas recomendadas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de nichos de mercado pré-configurados
CREATE TABLE IF NOT EXISTS nichos_mercado (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(100), -- Nome do ícone
    configuracoes JSONB NOT NULL, -- Todas as configurações do nicho
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de templates de relatórios personalizáveis
CREATE TABLE IF NOT EXISTS templates_relatorios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- contribuicoes, dizimistas, visitantes, etc.
    template_html TEXT,
    template_css TEXT,
    variaveis JSONB, -- Variáveis disponíveis no template
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de logs de atividades administrativas
CREATE TABLE IF NOT EXISTS logs_admin (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios_sistema(id),
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, tipo, categoria, descricao) VALUES
-- Configurações gerais
('nome_sistema', 'TEFILIN v1', 'string', 'geral', 'Nome do sistema exibido no cabeçalho'),
('subtitulo_sistema', 'Sistema de Gestão Eclesiástica', 'string', 'geral', 'Subtítulo do sistema'),
('versao_sistema', '1.0.0', 'string', 'geral', 'Versão atual do sistema'),
('email_contato', 'contato@igreja.com', 'string', 'geral', 'Email de contato da organização'),
('telefone_contato', '(11) 99999-9999', 'string', 'geral', 'Telefone de contato'),
('endereco_organizacao', 'Rua da Igreja, 123 - Centro', 'string', 'geral', 'Endereço da organização'),

-- Configurações de tema
('cor_primaria', '#22d3ee', 'color', 'tema', 'Cor primária do sistema'),
('cor_secundaria', '#0f172a', 'color', 'tema', 'Cor secundária do sistema'),
('cor_acento', '#10b981', 'color', 'tema', 'Cor de destaque'),
('cor_fundo', '#0f172a', 'color', 'tema', 'Cor de fundo principal'),
('cor_texto', '#ffffff', 'color', 'tema', 'Cor do texto principal'),

-- Configurações de relatórios
('cabecalho_relatorio', 'true', 'boolean', 'relatorios', 'Exibir cabeçalho nos relatórios'),
('rodape_relatorio', 'true', 'boolean', 'relatorios', 'Exibir rodapé nos relatórios'),
('logo_relatorio', 'true', 'boolean', 'relatorios', 'Incluir logotipo nos relatórios'),

-- Configurações de nicho atual
('nicho_ativo', 'igreja', 'string', 'nicho', 'Nicho de mercado ativo'),
('personalizacao_ativa', 'false', 'boolean', 'nicho', 'Se há personalização ativa');

-- Inserir tema padrão
INSERT INTO temas_sistema (nome, ativo, cores, fontes, espacamentos) VALUES
('Tema Padrão Igreja', true, 
'{"primary": "#22d3ee", "secondary": "#0f172a", "accent": "#10b981", "background": "#0f172a", "text": "#ffffff", "muted": "#64748b"}',
'{"family": "Inter, sans-serif", "sizes": {"xs": "12px", "sm": "14px", "base": "16px", "lg": "18px", "xl": "20px", "2xl": "24px"}}',
'{"xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px"}');

-- Inserir textos padrão personalizáveis
INSERT INTO textos_sistema (chave, texto_original, categoria, pagina) VALUES
-- Textos do login
('login.titulo', 'TEFILIN v1', 'login', 'login'),
('login.subtitulo', 'Sistema de Gestão Eclesiástica', 'login', 'login'),
('login.botao_entrar', 'Entrar', 'login', 'login'),
('login.esqueci_senha', 'Esqueci minha senha', 'login', 'login'),

-- Textos do dashboard admin
('admin.titulo', 'Painel Administrativo', 'dashboard', 'admin'),
('admin.subtitulo', 'Gerencie todo o sistema', 'dashboard', 'admin'),
('admin.usuarios', 'Usuários', 'dashboard', 'admin'),
('admin.configuracoes', 'Configurações', 'dashboard', 'admin'),

-- Textos do dashboard pastor
('pastor.titulo', 'Dashboard do Pastor', 'dashboard', 'pastor'),
('pastor.subtitulo', 'Acompanhe a vida da igreja', 'dashboard', 'pastor'),
('pastor.visitantes', 'Visitantes', 'dashboard', 'pastor'),
('pastor.relatorios', 'Relatórios', 'dashboard', 'pastor'),

-- Textos do dashboard recepção
('recepcao.titulo', 'Dashboard da Recepção', 'dashboard', 'recepcao'),
('recepcao.subtitulo', 'Gerencie visitantes e cadastros', 'dashboard', 'recepcao'),
('recepcao.cadastro', 'Cadastro de Visitantes', 'dashboard', 'recepcao'),

-- Textos do dashboard dizimista
('dizimista.titulo', 'Dashboard do Dizimista', 'dashboard', 'dizimista'),
('dizimista.subtitulo', 'Acompanhe suas contribuições e ofertas', 'dashboard', 'dizimista'),
('dizimista.contribuicoes', 'Contribuições', 'dashboard', 'dizimista'),
('dizimista.historico', 'Histórico', 'dashboard', 'dizimista');

-- Inserir especificações de logotipos
INSERT INTO logotipos_sistema (nome, tipo, arquivo_url, ativo, especificacoes) VALUES
('Logo Principal', 'logo_principal', '/assets/logo-default.png', true, 
'{"width_min": 200, "width_max": 400, "height_min": 50, "height_max": 100, "formato": ["PNG", "SVG", "JPG"], "tamanho_max_mb": 2}'),
('Logo Login', 'logo_login', '/assets/logo-login-default.png', true,
'{"width_min": 150, "width_max": 300, "height_min": 40, "height_max": 80, "formato": ["PNG", "SVG"], "tamanho_max_mb": 1}'),
('Favicon', 'favicon', '/assets/favicon-default.ico', true,
'{"width": 32, "height": 32, "formato": ["ICO", "PNG"], "tamanho_max_kb": 100}');

-- Inserir nichos de mercado pré-configurados
INSERT INTO nichos_mercado (nome, descricao, icone, configuracoes) VALUES
('Igreja/Religioso', 'Configuração para igrejas e organizações religiosas', 'church', 
'{"nome_sistema": "TEFILIN v1", "cores": {"primary": "#22d3ee", "secondary": "#0f172a"}, "modulos": ["dizimistas", "visitantes", "pastor", "recepcao"], "textos_especificos": {"contribuicao": "Dízimo", "membro": "Membro"}}'),

('Pizzaria', 'Configuração para pizzarias e delivery', 'pizza', 
'{"nome_sistema": "PizzaManager", "cores": {"primary": "#ef4444", "secondary": "#1f2937"}, "modulos": ["pedidos", "cardapio", "entregadores", "clientes"], "textos_especificos": {"contribuicao": "Pedido", "membro": "Cliente"}}'),

('Academia', 'Configuração para academias e centros de fitness', 'dumbbell', 
'{"nome_sistema": "FitManager", "cores": {"primary": "#10b981", "secondary": "#111827"}, "modulos": ["alunos", "treinos", "pagamentos", "instrutores"], "textos_especificos": {"contribuicao": "Mensalidade", "membro": "Aluno"}}'),

('Escola', 'Configuração para escolas e instituições de ensino', 'graduation-cap', 
'{"nome_sistema": "EduManager", "cores": {"primary": "#3b82f6", "secondary": "#1e293b"}, "modulos": ["alunos", "professores", "turmas", "notas"], "textos_especificos": {"contribuicao": "Mensalidade", "membro": "Aluno"}}'),

('Clínica Médica', 'Configuração para clínicas e consultórios', 'stethoscope', 
'{"nome_sistema": "MedManager", "cores": {"primary": "#06b6d4", "secondary": "#0f172a"}, "modulos": ["pacientes", "consultas", "medicos", "agendamentos"], "textos_especificos": {"contribuicao": "Consulta", "membro": "Paciente"}}'),

('Loja/Comércio', 'Configuração para lojas e comércios em geral', 'store', 
'{"nome_sistema": "ShopManager", "cores": {"primary": "#f59e0b", "secondary": "#1f2937"}, "modulos": ["produtos", "vendas", "clientes", "estoque"], "textos_especificos": {"contribuicao": "Venda", "membro": "Cliente"}}');

-- Inserir templates de relatórios padrão
INSERT INTO templates_relatorios (nome, tipo, template_html, template_css, variaveis) VALUES
('Relatório Padrão', 'geral', 
'<div class="relatorio"><h1>{{titulo}}</h1><p>{{conteudo}}</p></div>',
'.relatorio { font-family: Arial, sans-serif; margin: 20px; }',
'{"titulo": "Título do Relatório", "conteudo": "Conteúdo do relatório", "data": "Data atual"}');

-- Criar usuário admin padrão (senha: admin123)
INSERT INTO usuarios_sistema (email, nome_completo, senha_hash, tipo_usuario, permissoes) VALUES
('admin@sistema.com', 'Administrador do Sistema', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq4q4q4q4q4q4q4q4q4q4q', 'admin',
'{"gerenciar_usuarios": true, "editar_configuracoes": true, "personalizar_tema": true, "gerenciar_nichos": true, "acessar_logs": true, "editar_relatorios": true}');

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes_sistema(chave);
CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON configuracoes_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_textos_chave ON textos_sistema(chave);
CREATE INDEX IF NOT EXISTS idx_textos_categoria ON textos_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios_sistema(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios_sistema(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_admin(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_data ON logs_admin(created_at);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_temas_updated_at BEFORE UPDATE ON temas_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_textos_updated_at BEFORE UPDATE ON textos_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logotipos_updated_at BEFORE UPDATE ON logotipos_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE configuracoes_sistema IS 'Configurações gerais do sistema personalizáveis pelo admin';
COMMENT ON TABLE temas_sistema IS 'Temas e cores personalizáveis do sistema';
COMMENT ON TABLE textos_sistema IS 'Textos personalizáveis de todas as interfaces';
COMMENT ON TABLE usuarios_sistema IS 'Usuários do sistema com permissões granulares';
COMMENT ON TABLE logotipos_sistema IS 'Logotipos e imagens personalizáveis do sistema';
COMMENT ON TABLE nichos_mercado IS 'Configurações pré-definidas para diferentes nichos de mercado';
COMMENT ON TABLE templates_relatorios IS 'Templates personalizáveis para relatórios';
COMMENT ON TABLE logs_admin IS 'Log de todas as atividades administrativas';

