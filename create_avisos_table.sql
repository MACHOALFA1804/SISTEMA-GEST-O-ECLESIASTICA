-- Criar tabela de avisos
CREATE TABLE IF NOT EXISTS avisos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    banner_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS na tabela avisos
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para avisos
-- Permitir leitura para usuários autenticados
CREATE POLICY "Usuários podem ler avisos" ON avisos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY "Usuários podem criar avisos" ON avisos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Usuários podem atualizar avisos" ON avisos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Usuários podem excluir avisos" ON avisos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Criar bucket para armazenar banners dos avisos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avisos-banners', 'avisos-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de banners
CREATE POLICY "Usuários podem fazer upload de banners" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avisos-banners' AND auth.role() = 'authenticated');

-- Política para permitir visualização de banners
CREATE POLICY "Banners são públicos" ON storage.objects
    FOR SELECT USING (bucket_id = 'avisos-banners');

-- Política para permitir atualização de banners
CREATE POLICY "Usuários podem atualizar banners" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avisos-banners' AND auth.role() = 'authenticated');

-- Política para permitir exclusão de banners
CREATE POLICY "Usuários podem excluir banners" ON storage.objects
    FOR DELETE USING (bucket_id = 'avisos-banners' AND auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela avisos
CREATE TRIGGER update_avisos_updated_at 
    BEFORE UPDATE ON avisos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

