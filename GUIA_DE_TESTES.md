# 🧪 Guia Completo de Testes - TEFILIN v1

## 📋 **VISÃO GERAL**
Este guia detalha todos os testes que devem ser realizados para validar o sistema completo, simulando os três perfis de usuário: **Recepcionista**, **Pastor** e **Admin**.

---

## 🔐 **1. TESTE DE LOGIN E AUTENTICAÇÃO**

### **Login como Recepcionista**
- **URL**: http://localhost:3001
- **Email**: recepcionista@igreja.com
- **Senha**: 123456
- **Permissões**: Acesso apenas ao Dashboard de Recepção

### **Login como Pastor**
- **Email**: pastor@igreja.com  
- **Senha**: 123456
- **Permissões**: Acesso a Recepção + Pastor Dashboard

### **Login como Admin**
- **Email**: admin@igreja.com
- **Senha**: 123456
- **Permissões**: Acesso total ao sistema

---

## 👥 **2. TESTE PERFIL RECEPCIONISTA**

### **2.1 Dashboard Principal**
- ✅ Verificar se exibe apenas 2 cards principais
- ✅ Card "Cadastrar Visitantes" funcional
- ✅ Card "Histórico de Visitantes" funcional
- ✅ Design responsivo (testar em mobile/tablet)

### **2.2 Cadastro de Visitantes**
**Campos a testar:**
- ✅ **Nome**: João Silva (obrigatório)
- ✅ **Telefone**: (11) 99999-9999 (obrigatório)
- ✅ **Tipo**: Selecionar "Não Cristão"
- ✅ **Status**: Selecionar "Aguardando"
- ✅ **Quem Acompanha**: Maria Silva
- ✅ **Congregação de Origem**: Igreja ABC
- ✅ **Observações**: Primeira visita, muito receptivo

**Validações:**
- ✅ Tentar enviar sem nome (deve bloquear)
- ✅ Tentar enviar sem telefone (deve bloquear)
- ✅ Verificar formatação automática do telefone
- ✅ Confirmar salvamento com sucesso

### **2.3 Histórico de Visitantes**
- ✅ Lista deve mostrar visitante cadastrado
- ✅ Testar filtro por tipo de visitante
- ✅ Testar filtro por status
- ✅ Testar campo de pesquisa
- ✅ Clicar em visitante para ver detalhes
- ✅ Testar botão WhatsApp (deve abrir wa.me)
- ✅ Testar edição de visitante

### **2.4 Limitações de Acesso**
- ❌ NÃO deve conseguir acessar Dashboard Pastor
- ❌ NÃO deve conseguir acessar Dashboard Admin
- ✅ Botão "Sair" deve funcionar

---

## ⛪ **3. TESTE PERFIL PASTOR**

### **3.1 Dashboard Principal**
- ✅ Verificar acesso a 4 cards principais
- ✅ "Dados de Visitantes" funcionando
- ✅ "Agendamento de Visitas" funcionando
- ✅ "Envio de Mensagens" funcionando
- ✅ "Relatórios" funcionando

### **3.2 Dados de Visitantes**
**Estatísticas:**
- ✅ Verificar cards de estatísticas
- ✅ Total de visitantes
- ✅ Novos visitantes
- ✅ Não cristãos (foco pastoral)
- ✅ Visitantes visitados

**Filtros Avançados:**
- ✅ Filtrar por período (última semana/mês)
- ✅ Filtrar por tipo de visitante
- ✅ Filtrar por status
- ✅ Ordenação por data de cadastro

### **3.3 Agendamento de Visitas**
**Teste de Agendamento:**
- ✅ Selecionar visitante "João Silva"
- ✅ Escolher data: Próxima sexta-feira
- ✅ Hora: 19:00
- ✅ Pastor responsável: Pastor José
- ✅ Observações: Primeira visita pastoral
- ✅ Confirmar agendamento

**Calendário Visual:**
- ✅ Verificar se visita aparece no calendário
- ✅ Cores diferentes por status
- ✅ Navegação entre meses
- ✅ Lista de próximas visitas na lateral

### **3.4 Envio de Mensagens**
**Seleção de Destinatários:**
- ✅ Selecionar João Silva
- ✅ Verificar número de telefone

**Templates de Mensagem:**
- ✅ Template "Boas-vindas"
- ✅ Template "Agendamento de Visita"
- ✅ Template "Oração"
- ✅ Template "Convite para Evento"
- ✅ Mensagem personalizada

**Teste de Envio:**
- ✅ Selecionar template "Boas-vindas"
- ✅ Personalizar com nome do visitante
- ✅ Preview da mensagem
- ✅ Confirmar envio (simulado)
- ✅ Verificar no histórico

### **3.5 Relatórios**
**Configuração do Relatório:**
- ✅ Período: Último mês
- ✅ Tipo: Todos os visitantes
- ✅ Incluir: Estatísticas + Gráficos

**Geração PDF:**
- ✅ Clicar "Gerar PDF"
- ✅ Verificar download automático
- ✅ Abrir PDF e validar conteúdo:
  - Header com logo da igreja
  - Período correto
  - Tabela de visitantes
  - Estatísticas resumidas
  - Footer com data/hora

**Geração CSV:**
- ✅ Clicar "Gerar CSV"
- ✅ Verificar download automático
- ✅ Abrir no Excel e validar dados:
  - Cabeçalhos corretos
  - Dados completos dos visitantes
  - Formatação adequada

### **3.6 Acesso Ampliado**
- ✅ Deve conseguir acessar Dashboard Recepção
- ❌ NÃO deve conseguir acessar Dashboard Admin

---

## 🔧 **4. TESTE PERFIL ADMIN**

### **4.1 Dashboard Principal**
- ✅ Verificar acesso a 4 cards principais
- ✅ "Gerenciar Usuários" funcionando
- ✅ "Configurações do Sistema" funcionando
- ✅ "Sistema de Backup" funcionando
- ✅ "WhatsApp Business" funcionando

### **4.2 Gerenciamento de Usuários**
**Adicionar Novo Usuário:**
- ✅ Email: secretaria@igreja.com
- ✅ Senha: 123456
- ✅ Função: Recepcionista
- ✅ Status: Ativo
- ✅ Confirmar criação

**Lista de Usuários:**
- ✅ Verificar usuários existentes
- ✅ Filtrar por função
- ✅ Alterar status (ativo/inativo)
- ✅ Editar informações
- ✅ Excluir usuário (com confirmação)

### **4.3 Configurações do Sistema**
**Aba Sistema:**
- ✅ Nome da Igreja: "Assembleia de Deus Vila Evangélica"
- ✅ Endereço: "Rua da Igreja, 123 - São Paulo, SP"
- ✅ Telefone: "(11) 1234-5678"
- ✅ Email: "contato@igreja.com"
- ✅ Salvar configurações

**Aba Igreja:**
- ✅ Pastor Principal: "Pastor José Silva"
- ✅ CNPJ: "12.345.678/0001-90"
- ✅ Site: "www.igreja.com"
- ✅ Upload de logo (testar arquivo)

**Aba Relatórios:**
- ✅ Layout padrão: "Clássico"
- ✅ Incluir logo: Sim
- ✅ Cores: Azul e branco
- ✅ Rodapé personalizado

**Aba WhatsApp:**
- ✅ Mensagem automática de boas-vindas
- ✅ Horário de atendimento
- ✅ Mensagem fora do horário

### **4.4 WhatsApp Business**
**Configuração da API:**
- ✅ Phone Number ID: "123456789"
- ✅ Access Token: "EAAxxxxxxxxx"
- ✅ Webhook Token: "meu_token_123"
- ✅ Business ID: "987654321"
- ✅ Status: Ativo

**Teste de Envio:**
- ✅ Número de teste: (11) 99999-9999
- ✅ Mensagem: "Teste de integração WhatsApp"
- ✅ Enviar teste (simulado)
- ✅ Verificar estatísticas

### **4.5 Sistema de Backup**
**Backup Manual:**
- ✅ Clicar "Fazer Backup Agora"
- ✅ Verificar processo de criação
- ✅ Download do arquivo de backup

**Configuração Automática:**
- ✅ Ativar backup automático
- ✅ Frequência: Diário
- ✅ Horário: 02:00
- ✅ Manter: 30 backups
- ✅ Salvar configurações

**Histórico:**
- ✅ Verificar lista de backups
- ✅ Tamanho dos arquivos
- ✅ Status (sucesso/erro)
- ✅ Download de backup anterior

### **4.6 Acesso Total**
- ✅ Deve conseguir acessar Dashboard Recepção
- ✅ Deve conseguir acessar Dashboard Pastor
- ✅ Todos os recursos disponíveis

---

## 📱 **5. TESTE DE RESPONSIVIDADE**

### **5.1 Mobile (< 768px)**
- ✅ Header compacto com menu hambúrguer
- ✅ Cards em coluna única
- ✅ Botões de largura total
- ✅ Tabelas em formato de cards
- ✅ Formulários em coluna única
- ✅ Touch-friendly (botões grandes)

### **5.2 Tablet (768px - 1024px)**
- ✅ Layout em 2 colunas
- ✅ Sidebar responsiva
- ✅ Formulários em 2 colunas
- ✅ Navegação adaptada

### **5.3 Desktop (> 1024px)**
- ✅ Layout completo
- ✅ Sidebar fixa
- ✅ Máximo aproveitamento da tela
- ✅ Hover effects funcionando

---

## 🔐 **6. TESTE DE SEGURANÇA**

### **6.1 Controle de Acesso**
- ✅ Recepcionista não acessa área Pastor
- ✅ Pastor não acessa área Admin
- ✅ Logout funcional em todos os níveis
- ✅ Sessão expira após inatividade

### **6.2 Validação de Dados**
- ✅ Campos obrigatórios bloqueiam envio
- ✅ Formatação de telefone automática
- ✅ Validação de email
- ✅ Senhas são mascaradas

### **6.3 Auditoria**
- ✅ Logs de login registrados
- ✅ Ações sensíveis logadas
- ✅ Tentativas de acesso negado registradas

---

## 📊 **7. TESTE DE PERFORMANCE**

### **7.1 Carregamento**
- ✅ Página inicial < 3 segundos
- ✅ Navegação entre páginas fluida
- ✅ Carregamento de dados rápido

### **7.2 Dados**
- ✅ Cadastro de múltiplos visitantes
- ✅ Busca eficiente no histórico
- ✅ Geração de relatórios grandes

---

## ✅ **8. CHECKLIST FINAL**

### **Funcionalidades Core**
- [ ] Login/Logout funcionando
- [ ] Cadastro de visitantes
- [ ] Histórico e busca
- [ ] Agendamento de visitas
- [ ] Envio de mensagens
- [ ] Geração de relatórios
- [ ] Configurações do sistema
- [ ] Backup de dados

### **Integrações**
- [ ] WhatsApp Web (wa.me)
- [ ] WhatsApp Business API
- [ ] Geração de PDF
- [ ] Export para CSV
- [ ] Upload de arquivos

### **UX/UI**
- [ ] Design responsivo
- [ ] Navegação intuitiva
- [ ] Feedback visual
- [ ] Tratamento de erros
- [ ] Loading states

### **Segurança**
- [ ] Controle de permissões
- [ ] Validação de formulários
- [ ] Proteção de rotas
- [ ] Auditoria de ações

---

## 🎯 **RESULTADOS ESPERADOS**

Ao final dos testes, o sistema deve:

1. **✅ Funcionar perfeitamente** em todos os perfis de usuário
2. **✅ Ser totalmente responsivo** em todos os dispositivos
3. **✅ Manter segurança** com controle de acesso adequado
4. **✅ Gerar relatórios** em PDF e CSV corretamente
5. **✅ Integrar com WhatsApp** para comunicação
6. **✅ Permitir configuração** completa pelo admin
7. **✅ Fazer backup** dos dados de forma segura

---

## 🚀 **PRÓXIMOS PASSOS**

Após validação completa:
1. Configurar banco de dados Supabase real
2. Deploy em ambiente de produção
3. Treinamento dos usuários finais
4. Monitoramento e suporte contínuo

---

**Sistema TEFILIN v1 - Desenvolvido por DEV EMERSON 2025**
