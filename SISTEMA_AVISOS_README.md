# Sistema de Avisos - Tefilin v1

## 📋 Visão Geral

O Sistema de Avisos foi implementado para permitir que a equipe de recepção crie e gerencie avisos que aparecem em tempo real na dashboard do pastor. O sistema suporta texto e banners JPG, com atualizações automáticas via Supabase Realtime.

## 🚀 Funcionalidades Implementadas

### Dashboard de Recepção
- ✅ **Novo card "Gerenciar Avisos"** no menu principal
- ✅ **Criar avisos** com título, texto e banner JPG opcional
- ✅ **Editar avisos** existentes
- ✅ **Ativar/Desativar avisos** individualmente
- ✅ **Excluir avisos** com confirmação
- ✅ **Upload de banners** com validação (apenas JPG, máximo 2MB)
- ✅ **Preview de imagens** antes do upload
- ✅ **Lista de avisos** com status visual

### Dashboard do Pastor
- ✅ **Seção de avisos** no topo da dashboard
- ✅ **Visualização em tempo real** dos avisos ativos
- ✅ **Layout responsivo** com texto e banner
- ✅ **Indicador de novos avisos** com animação
- ✅ **Contador de avisos** ativos
- ✅ **Atualização automática** via Supabase Realtime

## 🗄️ Estrutura do Banco de Dados

### Tabela `avisos`
```sql
CREATE TABLE avisos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    banner_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### Storage Bucket
- **Bucket:** `avisos-banners`
- **Acesso:** Público para visualização
- **Políticas:** RLS configuradas para upload/edição/exclusão

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
1. **`create_avisos_table.sql`** - Script de criação da tabela e políticas
2. **`src/services/avisosService.ts`** - Serviço para operações CRUD
3. **`src/components/recepcao/AvisosView.tsx`** - Interface de gerenciamento
4. **`src/components/pastor/AvisosDisplay.tsx`** - Visualização na dashboard

### Arquivos Modificados
1. **`src/pages/RecepcaoDashboard.tsx`** - Adicionado card de avisos
2. **`src/pages/PastorDashboard.tsx`** - Integrada seção de avisos

## 🔧 Instalação e Configuração

### 1. Executar Script SQL
Execute o arquivo `create_avisos_table.sql` no seu banco Supabase:
```bash
# No painel do Supabase, vá em SQL Editor e execute o conteúdo do arquivo
```

### 2. Instalar Dependências
```bash
cd tefilin-v1-dizimista-atualizado/-tefilin-v1-cursor-4
npm install
```

### 3. Iniciar o Projeto
```bash
npm start
```

## 🎯 Como Usar

### Para a Equipe de Recepção

1. **Acessar Avisos:**
   - Faça login na dashboard de recepção
   - Clique no card "Gerenciar Avisos"

2. **Criar Novo Aviso:**
   - Clique em "Novo Aviso"
   - Preencha título e texto (obrigatórios)
   - Faça upload de banner JPG (opcional)
   - Marque "Aviso ativo" se desejar publicar imediatamente
   - Clique em "Criar Aviso"

3. **Gerenciar Avisos:**
   - **Editar:** Clique no botão "Editar" do aviso
   - **Ativar/Desativar:** Use o botão correspondente
   - **Excluir:** Clique em "Excluir" (com confirmação)

### Para o Pastor

1. **Visualizar Avisos:**
   - Os avisos aparecem automaticamente no topo da dashboard
   - Avisos novos são destacados com indicador "NOVO!"
   - Atualizações acontecem em tempo real

## 🔄 Atualizações em Tempo Real

O sistema utiliza **Supabase Realtime** para sincronização automática:

- ✅ **Criação de avisos** → Aparece instantaneamente na dashboard do pastor
- ✅ **Edição de avisos** → Atualiza automaticamente o conteúdo
- ✅ **Ativação/Desativação** → Mostra/oculta avisos em tempo real
- ✅ **Exclusão de avisos** → Remove automaticamente da visualização

## 🎨 Interface e Design

### Cores e Estilo
- **Card de avisos:** Roxo (`purple-500/20`)
- **Indicadores:** Verde para "ativo", vermelho para "inativo"
- **Animações:** Pulse para novos avisos, transições suaves
- **Layout:** Responsivo para desktop e mobile

### Ícones
- **Recepção:** Ícone de alto-falante/megafone
- **Pastor:** Indicador de tempo real (ponto verde pulsante)

## 🔒 Segurança

### Row Level Security (RLS)
- ✅ Políticas configuradas para leitura, inserção, atualização e exclusão
- ✅ Acesso restrito a usuários autenticados
- ✅ Storage com políticas de upload e visualização

### Validações
- ✅ **Formato de arquivo:** Apenas JPG aceito
- ✅ **Tamanho:** Máximo 2MB por banner
- ✅ **Campos obrigatórios:** Título e texto
- ✅ **Sanitização:** Prevenção de XSS

## 🐛 Resolução de Problemas

### Problemas Comuns

1. **Avisos não aparecem na dashboard do pastor:**
   - Verifique se o aviso está marcado como "ativo"
   - Confirme se o Supabase Realtime está funcionando
   - Verifique o console do navegador para erros

2. **Erro no upload de banner:**
   - Confirme que o arquivo é JPG
   - Verifique se o tamanho é menor que 2MB
   - Teste com outro arquivo

3. **Erro de compilação:**
   - Execute `npm install` novamente
   - Verifique se todas as dependências estão instaladas

### Logs e Debug
- Abra o console do navegador (F12)
- Verifique a aba "Network" para requisições
- Logs do Supabase aparecem no console

## 📈 Melhorias Futuras

### Possíveis Expansões
- [ ] **Agendamento de avisos** com data/hora específica
- [ ] **Categorias de avisos** (urgente, informativo, etc.)
- [ ] **Notificações push** para novos avisos
- [ ] **Histórico de avisos** com arquivamento
- [ ] **Permissões granulares** por usuário
- [ ] **Templates de avisos** pré-definidos
- [ ] **Suporte a vídeos** além de imagens
- [ ] **Avisos com expiração** automática

## 👨‍💻 Suporte Técnico

Para dúvidas ou problemas:
1. Verifique este README primeiro
2. Consulte os logs do console
3. Teste em ambiente de desenvolvimento
4. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido por:** DEV EMERSON 2025  
**Versão:** 1.0  
**Data:** Janeiro 2025

