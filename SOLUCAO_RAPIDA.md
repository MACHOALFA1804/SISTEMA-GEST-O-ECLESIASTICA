# �� **SOLUÇÃO RÁPIDA - TEFILIN v1**

## 🔍 **PROBLEMAS IDENTIFICADOS E SOLUÇÕES**

### **❌ PROBLEMA 1: "Papel de usuário não reconhecido"**
**Causa:** Usuários criados no Supabase Auth, mas perfis não criados na tabela `profiles`.

### **❌ PROBLEMA 2: "Usuário não encontrado ou sem permissões"**
**Causa:** Tabela `profiles` vazia ou não criada.

### **❌ PROBLEMA 3: Botões de excluir não funcionam**
**Causa:** Políticas RLS (Row Level Security) não incluem permissões para DELETE e UPDATE.

---

## ⚡ **SOLUÇÃO COMPLETA EM 4 PASSOS**

### **PASSO 1: Acessar o Supabase**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login e acesse seu projeto
3. Clique em **"SQL Editor"**

### **PASSO 2: Executar o Script de Limpeza (SE HOUVER DUPLICATAS)**
1. Clique em **"New query"**
2. Cole o conteúdo do arquivo `limpar_duplicados.sql`
3. Clique em **"Run"**

### **PASSO 3: Executar o Script de Correção Automática**
1. Clique em **"New query"**
2. Cole o conteúdo do arquivo `correcao_automatica.sql`
3. Clique em **"Run"**

### **PASSO 4: CORRIGIR AS POLÍTICAS RLS (IMPORTANTE!)**
1. Clique em **"New query"**
2. Cole o conteúdo do arquivo `corrigir_rls_delete.sql`
3. Clique em **"Run"**

---

## 📋 **ARQUIVOS DISPONÍVEIS**

### **🧹 `limpar_duplicados.sql`** (PRIMEIRO - se houver erro de duplicatas)
- ✅ Identifica registros duplicados
- ✅ Remove duplicatas automaticamente
- ✅ Adiciona constraint única
- ✅ Prepara para a correção principal

### **🔧 `correcao_automatica.sql`** (PRINCIPAL)
- ✅ Cria tabelas se não existirem
- ✅ Corrige políticas RLS básicas
- ✅ Insere perfis para todos os usuários
- ✅ Tratamento de erros inteligente

### **🔐 `corrigir_rls_delete.sql`** (CRÍTICO - para botões funcionarem)
- ✅ Corrige políticas RLS para DELETE
- ✅ Corrige políticas RLS para UPDATE
- ✅ Permite operações de edição e exclusão
- ✅ **RESOLVE O PROBLEMA DOS BOTÕES!**

### **🔍 `diagnostico_banco.sql`** (OPCIONAL)
- 📊 Verifica estado atual do banco
- 📊 Mostra problemas encontrados
- 📊 Útil para entender o que está acontecendo

---

## ✅ **RESULTADO ESPERADO**
- Login funcionando para todos os usuários
- Redirecionamento correto baseado no papel
- **Botões de excluir e editar funcionando 100%**
- Sistema funcionando completamente

---

## 🆘 **SE AINDA NÃO FUNCIONAR**

### **Verificar se o script foi executado:**
```sql
SELECT COUNT(*) as total_perfis FROM profiles;
```

### **Verificar se as políticas RLS foram criadas:**
```sql
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'visitantes')
ORDER BY tablename, cmd;
```

### **Verificar se os usuários existem:**
```sql
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email IN ('recepcionista@igreja.com', 'pastor@igreja.com', 'admin@igreja.com');
```

---

## 🎯 **ORDEM CORRETA DE EXECUÇÃO**
1. **`limpar_duplicados.sql`** (se necessário)
2. **`correcao_automatica.sql`** (principal)
3. **`corrigir_rls_delete.sql`** (crítico para botões)
4. **Testar os botões de excluir e editar**

---

## 🚨 **IMPORTANTE**
**O arquivo `corrigir_rls_delete.sql` é ESSENCIAL para que os botões de excluir e editar funcionem!** Sem ele, as operações DELETE e UPDATE serão bloqueadas pelas políticas de segurança do Supabase.
