# 🗄️ **GUIA DE CONFIGURAÇÃO DO SUPABASE - TEFILIN v1**

## 📋 **PRÉ-REQUISITOS**
- Conta no Supabase (gratuita)
- Acesso ao painel de controle

---

## 🚀 **PASSO A PASSO**

### **1. CRIAR PROJETO NO SUPABASE**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Escolha sua organização
5. Digite o nome: **"tefilin-v1"**
6. Digite uma senha forte para o banco
7. Escolha a região mais próxima (ex: São Paulo)
8. Clique em **"Create new project"**

### **2. AGUARDAR PROVISIONAMENTO**
- ⏱️ **Tempo**: 2-5 minutos
- ✅ **Status**: "Project is ready"

### **3. CONFIGURAR BANCO DE DADOS**
1. No painel, vá para **"SQL Editor"**
2. Clique em **"New query"**
3. Cole todo o conteúdo do arquivo `database_setup.sql`
4. Clique em **"Run"**
5. Aguarde a execução completa

### **4. CONFIGURAR AUTENTICAÇÃO**
1. Vá para **"Authentication" > "Settings"**
2. Em **"Site URL"**, coloque: `http://localhost:3000`
3. Em **"Redirect URLs"**, adicione:
   - `http://localhost:3000`
   - `http://localhost:3000/admin`
   - `http://localhost:3000/pastor`
   - `http://localhost:3000/recepcao`

### **5. OBTER CREDENCIAIS**
1. Vá para **"Settings" > "API"**
2. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key (começa com `eyJ...`)

### **6. CONFIGURAR VARIÁVEIS DE AMBIENTE**
1. No projeto, crie arquivo `.env.local`:
```env
REACT_APP_SUPABASE_URL=sua_url_aqui
REACT_APP_SUPABASE_ANON_KEY=sua_chave_aqui
```

2. Ou atualize o `src/lib/supabaseClient.ts` com suas credenciais

### **7. CRIAR USUÁRIOS DE TESTE**
1. Vá para **"Authentication" > "Users"**
2. Clique em **"Add user"**
3. Crie os usuários:

#### **Recepcionista:**
- Email: `recepcionista@igreja.com`
- Password: `123456`

#### **Pastor:**
- Email: `pastor@igreja.com`
- Password: `123456`

#### **Admin:**
- Email: `admin@igreja.com`
- Password: `123456`

### **8. CONFIGURAR PERFIS (IMPORTANTE!)**
1. Vá para **"SQL Editor"**
2. Execute o arquivo `create_test_users.sql`:
```sql
-- Cole o conteúdo do arquivo create_test_users.sql
```

**⚠️ ATENÇÃO**: Este passo é OBRIGATÓRIO para resolver o erro "Papel de usuário não reconhecido"

---

## ✅ **VERIFICAÇÃO**

### **Teste de Conexão:**
1. Reinicie o projeto: `npm start`
2. Acesse: http://localhost:3000
3. Faça login com qualquer usuário
4. Verifique se não há mais erros de "carregar usuários"

### **Teste de Funcionalidades:**
- ✅ Login funcionando
- ✅ Dashboard carregando
- ✅ Lista de usuários aparecendo
- ✅ Navegação entre telas

---

## 🚨 **PROBLEMAS COMUNS**

### **Erro: "Papel de usuário não reconhecido"**
- ✅ **SOLUÇÃO**: Execute o arquivo `create_test_users.sql` no Supabase
- ✅ **VERIFICAÇÃO**: Confirme se a tabela `profiles` tem dados
- ✅ **TESTE**: Execute `SELECT * FROM profiles;` no SQL Editor

### **Erro: "Invalid JWT"**
- Verifique se as credenciais estão corretas
- Confirme se o projeto está ativo

### **Erro: "Table doesn't exist"**
- Execute novamente o script SQL
- Verifique se não há erros de sintaxe

### **Erro: "RLS policy"**
- Verifique se as políticas foram criadas
- Confirme se o usuário está autenticado

---

## 📞 **SUPORTE**

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme as credenciais do Supabase
3. Teste a conexão no painel do Supabase
4. Verifique se todas as tabelas foram criadas
5. **IMPORTANTE**: Execute `create_test_users.sql` para criar os perfis

---

## 🎯 **RESULTADO ESPERADO**

Após a configuração:
- ✅ **Banco de dados** funcionando
- ✅ **Autenticação** ativa
- ✅ **Usuários de teste** criados
- ✅ **Perfis configurados** corretamente
- ✅ **Sistema 100% funcional**
- ✅ **Todas as funcionalidades** disponíveis

**🎉 TEFILIN v1 funcionando perfeitamente!**
