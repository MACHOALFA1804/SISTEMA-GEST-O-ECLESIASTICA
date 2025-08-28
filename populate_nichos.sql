-- Script para popular nichos de mercado pré-configurados
-- Execute este script após criar as tabelas administrativas

-- Inserir nichos de mercado pré-configurados
INSERT INTO nichos_mercado (nome, descricao, icone, configuracoes) VALUES

-- 1. Igreja/Religioso (Padrão)
('Igreja/Religioso', 'Sistema completo para gestão de igrejas e organizações religiosas', 'church', '{
  "nome_sistema": "TEFILIN v1",
  "cores": {
    "primary": "#22d3ee",
    "secondary": "#0f172a",
    "accent": "#10b981",
    "background": "#0f172a",
    "text": "#ffffff",
    "muted": "#64748b"
  },
  "modulos": ["dizimistas", "visitantes", "pastor", "recepcao"],
  "textos_especificos": {
    "contribuicao": "Dízimo",
    "contribuinte": "Membro",
    "lider": "Pastor",
    "evento": "Culto"
  }
}'),

-- 2. Pizzaria
('Pizzaria', 'Sistema de gestão para pizzarias e delivery', 'pizza', '{
  "nome_sistema": "PizzaManager",
  "cores": {
    "primary": "#ef4444",
    "secondary": "#0f172a",
    "accent": "#f97316",
    "background": "#0f172a",
    "text": "#ffffff",
    "muted": "#64748b"
  },
  "modulos": ["pedidos", "cardapio", "entregadores", "clientes"],
  "textos_especificos": {
    "contribuicao": "Pedido",
    "contribuinte": "Cliente",
    "lider": "Gerente",
    "evento": "Entrega"
  }
}'),

-- 3. Academia
('Academia', 'Sistema de gestão para academias e centros de fitness', 'dumbbell', '{
  "nome_sistema": "FitManager",
  "cores": {
    "primary": "#10b981",
    "secondary": "#0f172a",
    "accent": "#06b6d4",
    "background": "#0f172a",
    "text": "#ffffff",
    "muted": "#64748b"
  },
  "modulos": ["alunos", "treinos", "pagamentos", "instrutores"],
  "textos_especificos": {
    "contribuicao": "Mensalidade",
    "contribuinte": "Aluno",
    "lider": "Instrutor",
    "evento": "Treino"
  }
}'),

-- 4. Escola
('Escola', 'Sistema de gestão escolar e educacional', 'graduation-cap', '{
  "nome_sistema": "EduManager",
  "cores": {
    "primary": "#3b82f6",
    "secondary": "#0f172a",
    "accent": "#8b5cf6",
    "background": "#0f172a",
    "text": "#ffffff",
    "muted": "#64748b"
  },
  "modulos": ["alunos", "professores", "turmas", "notas"],
  "textos_especificos": {
    "contribuicao": "Mensalidade",
    "contribuinte": "Aluno",
    "lider": "Professor",
    "evento": "Aula"
  }
}'),

-- 5. Clínica Médica
('Clínica Médica', 'Sistema de gestão para clínicas e consultórios médicos', 'stethoscope', '{
  "nome_sistema": "MedManager",
  "cores": {
    "primary": "#06b6d4",
    "secondary": "#0f172a",
    "accent": "#10b981",
    "background": "#0f172a",
    "text": "#ffffff",
    "muted": "#64748b"
  },
  "modulos": ["pacientes", "consultas", "medicos", "agendamentos"],
  "textos_especificos": {
    "contribuicao": "Consulta",
    "contribuinte": "Paciente",
    "lider": "Médico",
    "evento": "Consulta"
  }
}'),

-- 6. Loja/Comércio
('Loja/Comércio', 'Sistema de gestão para lojas e estabelecimentos comerciais', 'store', '{
  "nome_sistema": "ShopManager",
  "cores": {
    "primary": "#f97316",
    "secondary": "#0f172a",
    "accent": "#eab308",
    "background": "#0f172a",
    "text": "#ffffff",
    "muted": "#64748b"
  },
  "modulos": ["produtos", "vendas", "clientes", "estoque"],
  "textos_especificos": {
    "contribuicao": "Venda",
    "contribuinte": "Cliente",
    "lider": "Gerente",
    "evento": "Venda"
  }
}');

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, tipo, categoria, descricao) VALUES

-- Configurações Gerais
('nome_sistema', 'TEFILIN v1', 'text', 'geral', 'Nome do sistema exibido na interface'),
('versao_sistema', '1.0.0', 'text', 'geral', 'Versão atual do sistema'),
('nome_organizacao', 'Minha Igreja', 'text', 'geral', 'Nome da organização/igreja'),
('endereco_organizacao', '', 'text', 'geral', 'Endereço da organização'),
('telefone_organizacao', '', 'text', 'geral', 'Telefone de contato'),
('email_organizacao', '', 'email', 'geral', 'Email de contato'),
('site_organizacao', '', 'url', 'geral', 'Website da organização'),

-- Configurações de Tema
('cor_primaria', '#22d3ee', 'color', 'tema', 'Cor primária do sistema'),
('cor_secundaria', '#0f172a', 'color', 'tema', 'Cor secundária do sistema'),
('cor_destaque', '#10b981', 'color', 'tema', 'Cor de destaque/botões'),

-- Configurações de Relatórios
('incluir_logo_relatorios', 'true', 'boolean', 'relatorios', 'Incluir logotipo nos relatórios'),
('formato_data_relatorios', 'DD/MM/YYYY', 'text', 'relatorios', 'Formato de data nos relatórios'),
('rodape_relatorios', 'Gerado pelo TEFILIN v1', 'text', 'relatorios', 'Texto do rodapé dos relatórios'),

-- Configurações de Sistema
('manutencao_ativa', 'false', 'boolean', 'sistema', 'Modo de manutenção ativo'),
('backup_automatico', 'true', 'boolean', 'sistema', 'Backup automático habilitado'),
('logs_detalhados', 'true', 'boolean', 'sistema', 'Logs detalhados habilitados'),

-- Configurações de Nicho
('nicho_ativo', '1', 'number', 'nicho', 'ID do nicho de mercado ativo');

-- Inserir tema padrão
INSERT INTO temas_sistema (nome, ativo, cores) VALUES
('Tema Padrão', true, '{
  "primary": "#22d3ee",
  "secondary": "#0f172a",
  "accent": "#10b981",
  "background": "#0f172a",
  "text": "#ffffff",
  "muted": "#64748b"
}');

-- Inserir textos padrão do sistema
INSERT INTO textos_sistema (chave, texto_original, categoria, pagina) VALUES

-- Textos do Login
('titulo_login', 'Bem-vindo ao TEFILIN v1', 'login', 'login'),
('subtitulo_login', 'Sistema de Gestão Eclesiástica', 'login', 'login'),
('botao_entrar', 'Entrar', 'login', 'login'),
('esqueci_senha', 'Esqueci minha senha', 'login', 'login'),

-- Textos do Dashboard Admin
('titulo_admin', 'Painel Administrativo', 'dashboard', 'admin'),
('subtitulo_admin', 'Controle total do sistema e configurações avançadas', 'dashboard', 'admin'),
('menu_usuarios', 'Gerenciar Usuários', 'dashboard', 'admin'),
('menu_personalizacao', 'Personalização', 'dashboard', 'admin'),
('menu_logotipos', 'Logotipos', 'dashboard', 'admin'),
('menu_nichos', 'Nichos de Mercado', 'dashboard', 'admin'),

-- Textos do Dashboard Pastor
('titulo_pastor', 'Dashboard do Pastor', 'dashboard', 'pastor'),
('subtitulo_pastor', 'Visão geral da igreja e ministério', 'dashboard', 'pastor'),
('menu_relatorios', 'Relatórios', 'dashboard', 'pastor'),
('menu_visitas', 'Agendamento de Visitas', 'dashboard', 'pastor'),

-- Textos do Dashboard Recepção
('titulo_recepcao', 'Dashboard da Recepção', 'dashboard', 'recepcao'),
('subtitulo_recepcao', 'Gestão de visitantes e atendimento', 'dashboard', 'recepcao'),
('menu_visitantes', 'Cadastro de Visitantes', 'dashboard', 'recepcao'),

-- Textos do Dashboard Dizimista
('titulo_dizimista', 'Dashboard do Dizimista', 'dashboard', 'dizimista'),
('subtitulo_dizimista', 'Suas contribuições e informações', 'dashboard', 'dizimista'),
('menu_contribuicoes', 'Minhas Contribuições', 'dashboard', 'dizimista'),

-- Textos de Relatórios
('titulo_relatorio_visitantes', 'Relatório de Visitantes', 'relatorios', 'pastor'),
('titulo_relatorio_visitas', 'Relatório de Visitas', 'relatorios', 'pastor'),
('titulo_relatorio_dizimistas', 'Relatório de Dizimistas', 'relatorios', 'pastor'),
('titulo_relatorio_contribuicoes', 'Relatório de Contribuições', 'relatorios', 'pastor');

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios_sistema (nome, email, senha_hash, tipo_usuario, ativo, permissoes) VALUES
('Administrador', 'admin@sistema.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqO', 'admin', true, '{
  "gerenciar_usuarios": true,
  "editar_configuracoes": true,
  "personalizar_tema": true,
  "gerenciar_nichos": true,
  "acessar_logs": true,
  "editar_relatorios": true,
  "acessar_admin": true,
  "acessar_pastor": true,
  "acessar_recepcao": true,
  "acessar_dizimista": true
}');

-- Inserir log inicial
INSERT INTO logs_admin (usuario_id, acao, tabela_afetada, dados_anteriores, dados_novos) VALUES
(1, 'inicializacao_sistema', 'sistema', '{}', '{"status": "Sistema inicializado com configurações padrão"}');

COMMIT;

