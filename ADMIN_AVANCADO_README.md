# Sistema Administrativo Avançado - TEFILIN v1

## 🚀 Visão Geral

O Sistema Administrativo Avançado do TEFILIN v1 oferece controle total sobre a personalização, configuração e adaptabilidade do sistema. Com essas funcionalidades, o administrador pode transformar completamente a aparência e comportamento do sistema, adaptando-o para diferentes nichos de mercado.

## 📋 Funcionalidades Implementadas

### 1. 👥 Gerenciamento Avançado de Usuários
- **Criação e edição** de usuários com informações completas
- **Permissões granulares** por funcionalidade específica
- **Tipos de usuário** predefinidos (Admin, Pastor, Recepção, Dizimista)
- **Controle de status** (ativo/inativo)
- **Histórico de login** e atividades
- **Interface responsiva** para desktop e mobile

### 2. 🎨 Personalização Completa do Sistema
- **Configurações gerais** editáveis por categoria
- **Editor de cores e temas** com preview em tempo real
- **Personalização de textos** da interface por página/categoria
- **Sistema de reset** para valores padrão
- **Validação automática** de configurações

### 3. 🖼️ Gerenciamento de Logotipos
- **Upload de múltiplos tipos** de logotipo (Principal, Login, Favicon, Background)
- **Especificações técnicas** automáticas por tipo
- **Validação de formato e tamanho** antes do upload
- **Preview automático** das imagens
- **Controle de ativação** por tipo de logotipo

### 4. 🎯 Adaptabilidade para Múltiplos Nichos
- **6 nichos pré-configurados**: Igreja, Pizzaria, Academia, Escola, Clínica, Loja
- **Aplicação automática** de configurações por nicho
- **Preview completo** antes da aplicação
- **Transformação instantânea** do sistema
- **Cores, textos e módulos** específicos por nicho

### 5. 📊 Sistema de Logs e Auditoria
- **Registro automático** de todas as ações administrativas
- **Rastreamento de alterações** com dados anteriores e novos
- **Identificação do usuário** responsável por cada ação
- **Histórico completo** para auditoria

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `configuracoes_sistema`
Armazena todas as configurações editáveis do sistema:
- Configurações gerais (nome, contato, versão)
- Configurações de tema (cores primárias)
- Configurações de relatórios
- Configurações de nicho ativo

#### `temas_sistema`
Gerencia temas e esquemas de cores:
- Cores primárias, secundárias e de destaque
- Configurações de fontes e espaçamentos
- Sistema de ativação de temas

#### `textos_sistema`
Controla todos os textos personalizáveis:
- Textos originais e personalizados
- Organização por categoria e página
- Sistema de fallback para textos não personalizados

#### `usuarios_sistema`
Usuários com permissões avançadas:
- Informações completas do usuário
- Permissões granulares por funcionalidade
- Controle de status e histórico

#### `logotipos_sistema`
Gerenciamento de imagens do sistema:
- Múltiplos tipos de logotipo
- Especificações técnicas por tipo
- Controle de ativação e versionamento

#### `nichos_mercado`
Configurações pré-definidas por segmento:
- Configurações completas por nicho
- Cores, módulos e textos específicos
- Sistema de aplicação automática

#### `logs_admin`
Auditoria completa do sistema:
- Registro de todas as ações administrativas
- Dados anteriores e novos para comparação
- Rastreamento por usuário e timestamp

## 🔧 Instalação e Configuração

### 1. Executar Scripts SQL
```sql
-- Executar o script de criação das tabelas
\i create_admin_tables.sql
```

### 2. Configurar Supabase Storage
```sql
-- Criar bucket para logotipos
INSERT INTO storage.buckets (id, name, public) VALUES ('logotipos', 'logotipos', true);

-- Configurar políticas de acesso
CREATE POLICY "Admins podem fazer upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'logotipos' AND auth.role() = 'authenticated');

CREATE POLICY "Todos podem visualizar" ON storage.objects
FOR SELECT USING (bucket_id = 'logotipos');
```

### 3. Importar Componentes
Os seguintes componentes foram criados e devem ser importados no AdminDashboard:
- `GerenciamentoUsuariosView`
- `GerenciamentoLogotiposView`
- `GerenciamentoNichosView`
- `PersonalizacaoSistemaView`

### 4. Configurar AdminService
O `AdminService` centraliza todas as operações administrativas e deve ser configurado com as credenciais corretas do Supabase.

## 🎯 Nichos de Mercado Disponíveis

### 1. 🏛️ Igreja/Religioso (Padrão)
- **Nome**: TEFILIN v1
- **Cores**: Azul ciano e cinza escuro
- **Módulos**: Dizimistas, Visitantes, Pastor, Recepção
- **Terminologia**: Dízimo, Membro

### 2. 🍕 Pizzaria
- **Nome**: PizzaManager
- **Cores**: Vermelho e cinza escuro
- **Módulos**: Pedidos, Cardápio, Entregadores, Clientes
- **Terminologia**: Pedido, Cliente

### 3. 💪 Academia
- **Nome**: FitManager
- **Cores**: Verde e cinza escuro
- **Módulos**: Alunos, Treinos, Pagamentos, Instrutores
- **Terminologia**: Mensalidade, Aluno

### 4. 🎓 Escola
- **Nome**: EduManager
- **Cores**: Azul e cinza escuro
- **Módulos**: Alunos, Professores, Turmas, Notas
- **Terminologia**: Mensalidade, Aluno

### 5. 🏥 Clínica Médica
- **Nome**: MedManager
- **Cores**: Azul claro e cinza escuro
- **Módulos**: Pacientes, Consultas, Médicos, Agendamentos
- **Terminologia**: Consulta, Paciente

### 6. 🏪 Loja/Comércio
- **Nome**: ShopManager
- **Cores**: Laranja e cinza escuro
- **Módulos**: Produtos, Vendas, Clientes, Estoque
- **Terminologia**: Venda, Cliente

## 🔐 Sistema de Permissões

### Permissões Disponíveis
- `gerenciar_usuarios`: Criar, editar e desativar usuários
- `editar_configuracoes`: Alterar configurações do sistema
- `personalizar_tema`: Modificar cores e temas
- `gerenciar_nichos`: Aplicar nichos de mercado
- `acessar_logs`: Visualizar logs de auditoria
- `editar_relatorios`: Personalizar templates de relatórios
- `acessar_admin`: Acesso ao painel administrativo
- `acessar_pastor`: Acesso ao dashboard do pastor
- `acessar_recepcao`: Acesso ao dashboard da recepção
- `acessar_dizimista`: Acesso ao dashboard do dizimista

### Tipos de Usuário Predefinidos

#### Administrador
- Todas as permissões habilitadas
- Controle total do sistema

#### Pastor
- Acesso ao dashboard do pastor
- Edição de relatórios
- Visualização de dados da igreja

#### Recepção
- Acesso ao dashboard da recepção
- Cadastro de visitantes
- Gerenciamento de dados básicos

#### Dizimista
- Acesso ao dashboard do dizimista
- Visualização de contribuições próprias

## 📱 Interface Responsiva

Todas as interfaces foram desenvolvidas com design responsivo:
- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Adaptação automática do layout
- **Mobile**: Cards empilhados e navegação otimizada

## 🎨 Personalização de Cores

### Cores Configuráveis
- **Primary**: Cor primária do sistema
- **Secondary**: Cor secundária/fundo
- **Accent**: Cor de destaque/botões
- **Background**: Cor de fundo principal
- **Text**: Cor do texto principal
- **Muted**: Cor do texto secundário

### Preview em Tempo Real
O sistema oferece preview instantâneo das alterações de cor, permitindo visualizar o resultado antes de salvar.

## 📝 Personalização de Textos

### Categorias de Textos
- **Login**: Textos da tela de login
- **Dashboard**: Textos dos painéis principais
- **Relatórios**: Textos dos relatórios

### Páginas Disponíveis
- **Admin**: Painel administrativo
- **Pastor**: Dashboard do pastor
- **Recepção**: Dashboard da recepção
- **Dizimista**: Dashboard do dizimista

## 🔍 Sistema de Logs

### Ações Registradas
- Criação e edição de usuários
- Alterações de configurações
- Upload de logotipos
- Aplicação de nichos
- Alterações de tema
- Personalização de textos

### Informações Capturadas
- Usuário responsável
- Timestamp da ação
- Dados anteriores e novos
- Tabela afetada
- IP e User Agent

## 🚀 Como Usar

### 1. Acessar o Painel Administrativo
1. Faça login como administrador
2. Acesse o "Painel Administrativo"
3. Navegue pelas funcionalidades disponíveis

### 2. Gerenciar Usuários
1. Clique em "Gerenciar Usuários"
2. Use "Novo Usuário" para criar
3. Configure permissões específicas
4. Defina tipo de usuário apropriado

### 3. Personalizar Sistema
1. Acesse "Personalização"
2. Configure cores na aba "Cores e Tema"
3. Edite textos na aba "Textos da Interface"
4. Ajuste configurações na aba "Configurações Gerais"

### 4. Upload de Logotipos
1. Vá para "Gerenciar Logotipos"
2. Escolha o tipo de logotipo
3. Siga as especificações técnicas
4. Faça upload e ative

### 5. Aplicar Nicho de Mercado
1. Acesse "Nichos de Mercado"
2. Visualize o preview do nicho desejado
3. Confirme a aplicação
4. O sistema será transformado automaticamente

## ⚠️ Considerações Importantes

### Backup
- Sempre faça backup antes de aplicar nichos
- As configurações atuais podem ser perdidas
- Use a funcionalidade de exportação quando disponível

### Permissões
- Apenas administradores devem ter acesso total
- Configure permissões mínimas necessárias
- Monitore logs regularmente

### Performance
- Upload de logotipos grandes pode afetar performance
- Siga as especificações de tamanho recomendadas
- Otimize imagens antes do upload

### Segurança
- Senhas são hasheadas automaticamente
- Logs capturam informações sensíveis
- Acesso deve ser restrito a pessoal autorizado

## 🔄 Atualizações Futuras

### Funcionalidades Planejadas
- Sistema de backup e restore automático
- Mais nichos de mercado
- Editor visual de temas
- Importação/exportação de configurações
- Agendamento de alterações
- Notificações de sistema

### Melhorias Técnicas
- Cache de configurações
- Otimização de queries
- Compressão automática de imagens
- Versionamento de configurações

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte os logs do sistema
2. Verifique as permissões do usuário
3. Confirme a configuração do banco de dados
4. Entre em contato com o desenvolvedor

---

**Desenvolvido por**: DEV EMERSON 2025  
**Versão**: 1.0.0  
**Data**: Janeiro 2025

