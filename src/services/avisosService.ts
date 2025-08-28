import { supabase } from '../lib/supabaseClient';

export interface Aviso {
  id?: number;
  titulo: string;
  texto: string;
  banner_url?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CreateAvisoData {
  titulo: string;
  texto: string;
  banner?: File;
  ativo?: boolean;
}

export interface UpdateAvisoData {
  titulo?: string;
  texto?: string;
  banner?: File;
  ativo?: boolean;
  removeBanner?: boolean;
}

class AvisosService {
  // Listar todos os avisos
  async listarAvisos(): Promise<Aviso[]> {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar avisos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço listarAvisos:', error);
      throw error;
    }
  }

  // Listar apenas avisos ativos
  async listarAvisosAtivos(): Promise<Aviso[]> {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar avisos ativos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço listarAvisosAtivos:', error);
      throw error;
    }
  }

  // Buscar aviso por ID
  async buscarAviso(id: number): Promise<Aviso | null> {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar aviso:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço buscarAviso:', error);
      throw error;
    }
  }

  // Upload de banner
  private async uploadBanner(file: File, avisoId?: number): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avisos-banners')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload do banner:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avisos-banners')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload do banner:', error);
      throw error;
    }
  }

  // Remover banner do storage
  private async removerBanner(bannerUrl: string): Promise<void> {
    try {
      // Extrair o nome do arquivo da URL
      const fileName = bannerUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('avisos-banners')
        .remove([fileName]);

      if (error) {
        console.error('Erro ao remover banner:', error);
        // Não lançar erro aqui para não impedir a operação principal
      }
    } catch (error) {
      console.error('Erro ao remover banner do storage:', error);
    }
  }

  // Criar novo aviso
  async criarAviso(dados: CreateAvisoData): Promise<Aviso> {
    try {
      let bannerUrl: string | undefined;

      // Upload do banner se fornecido
      if (dados.banner) {
        bannerUrl = await this.uploadBanner(dados.banner);
      }

      const { data, error } = await supabase
        .from('avisos')
        .insert({
          titulo: dados.titulo,
          texto: dados.texto,
          banner_url: bannerUrl,
          ativo: dados.ativo ?? true,
        })
        .select()
        .single();

      if (error) {
        // Se houve erro na criação e já fez upload do banner, remover o banner
        if (bannerUrl) {
          await this.removerBanner(bannerUrl);
        }
        console.error('Erro ao criar aviso:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço criarAviso:', error);
      throw error;
    }
  }

  // Atualizar aviso
  async atualizarAviso(id: number, dados: UpdateAvisoData): Promise<Aviso> {
    try {
      // Buscar aviso atual para obter banner_url se necessário
      const avisoAtual = await this.buscarAviso(id);
      if (!avisoAtual) {
        throw new Error('Aviso não encontrado');
      }

      let bannerUrl = avisoAtual.banner_url;

      // Se deve remover o banner
      if (dados.removeBanner) {
        if (bannerUrl) {
          await this.removerBanner(bannerUrl);
        }
        bannerUrl = undefined;
      }

      // Upload do novo banner se fornecido
      if (dados.banner) {
        // Remover banner anterior se existir
        if (bannerUrl) {
          await this.removerBanner(bannerUrl);
        }
        bannerUrl = await this.uploadBanner(dados.banner, id);
      }

      const updateData: any = {};
      if (dados.titulo !== undefined) updateData.titulo = dados.titulo;
      if (dados.texto !== undefined) updateData.texto = dados.texto;
      if (dados.ativo !== undefined) updateData.ativo = dados.ativo;
      if (dados.banner || dados.removeBanner) updateData.banner_url = bannerUrl;

      const { data, error } = await supabase
        .from('avisos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar aviso:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço atualizarAviso:', error);
      throw error;
    }
  }

  // Alternar status ativo/inativo
  async alternarStatus(id: number): Promise<Aviso> {
    try {
      const avisoAtual = await this.buscarAviso(id);
      if (!avisoAtual) {
        throw new Error('Aviso não encontrado');
      }

      return await this.atualizarAviso(id, { ativo: !avisoAtual.ativo });
    } catch (error) {
      console.error('Erro no serviço alternarStatus:', error);
      throw error;
    }
  }

  // Excluir aviso
  async excluirAviso(id: number): Promise<void> {
    try {
      // Buscar aviso para obter banner_url
      const aviso = await this.buscarAviso(id);
      if (!aviso) {
        throw new Error('Aviso não encontrado');
      }

      // Remover banner se existir
      if (aviso.banner_url) {
        await this.removerBanner(aviso.banner_url);
      }

      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir aviso:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço excluirAviso:', error);
      throw error;
    }
  }

  // Validar arquivo de banner
  validarBanner(file: File): { valido: boolean; erro?: string } {
    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return { valido: false, erro: 'Arquivo deve ser uma imagem' };
    }

    // Verificar se é JPG
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      return { valido: false, erro: 'Apenas arquivos JPG são permitidos' };
    }

    // Verificar tamanho (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { valido: false, erro: 'Arquivo deve ter no máximo 2MB' };
    }

    return { valido: true };
  }

  // Subscrever a mudanças em tempo real
  subscribeToAvisos(callback: (avisos: Aviso[]) => void) {
    const subscription = supabase
      .channel('avisos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avisos',
        },
        async (payload) => {
          console.log('Mudança detectada na tabela avisos:', payload);
          // Recarregar todos os avisos ativos
          try {
            const avisosAtivos = await this.listarAvisosAtivos();
            callback(avisosAtivos);
          } catch (error) {
            console.error('Erro ao recarregar avisos:', error);
          }
        }
      )
      .subscribe();

    return subscription;
  }
}

export const avisosService = new AvisosService();

