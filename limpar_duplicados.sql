-- =====================================================
-- LIMPEZA DE REGISTROS DUPLICADOS - TEFILIN v1
-- =====================================================

-- 1. VERIFICAR REGISTROS DUPLICADOS
SELECT 
    user_id,
    COUNT(*) as total_duplicados,
    array_agg(id) as ids_duplicados
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC;

-- 2. REMOVER REGISTROS DUPLICADOS (MANTER O MAIS ANTIGO)
DELETE FROM profiles a USING profiles b 
WHERE a.id > b.id 
AND a.user_id = b.user_id;

-- 3. VERIFICAR SE AINDA EXISTEM DUPLICADOS
SELECT 
    user_id,
    COUNT(*) as total_duplicados
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 4. ADICIONAR CONSTRAINT ÚNICA
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_key' 
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Constraint única adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Constraint única já existe!';
    END IF;
END $$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 
    'LIMPEZA CONCLUÍDA' as status,
    COUNT(*) as total_perfis,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM profiles;

-- 6. MOSTRAR PERFIS RESTANTES
SELECT 
    p.role,
    p.nome,
    p.email,
    p.ativo,
    u.email as auth_email
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.role;
