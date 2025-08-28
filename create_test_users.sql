-- =====================================================
-- CRIAÇÃO DE USUÁRIOS DE TESTE - TEFILIN v1
-- =====================================================

-- IMPORTANTE: Execute este script APÓS criar os usuários no Supabase Auth
-- e APÓS executar o database_setup.sql

-- 1. Inserir perfil para Recepcionista
INSERT INTO profiles (user_id, role, nome, email, ativo) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'recepcionista@igreja.com'),
  'recepcionista',
  'Recepcionista',
  'recepcionista@igreja.com',
  true
);

-- 2. Inserir perfil para Pastor
INSERT INTO profiles (user_id, role, nome, email, ativo) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'pastor@igreja.com'),
  'pastor',
  'Pastor',
  'pastor@igreja.com',
  true
);

-- 3. Inserir perfil para Administrador
INSERT INTO profiles (user_id, role, nome, email, ativo) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'admin@igreja.com'),
  'admin',
  'Administrador',
  'admin@igreja.com',
  true
);

-- 4. Verificar se os perfis foram criados
SELECT 
  p.role,
  p.nome,
  p.email,
  p.ativo,
  u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.role;

-- 5. Mensagem de sucesso
SELECT 'Usuários de teste criados com sucesso!' as status;
