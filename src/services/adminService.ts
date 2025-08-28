import { supabase } from "../lib/supabaseClient";

// Interfaces para o sistema administrativo
export interface ConfiguracaoSistema {
  id?: string;
  chave: string;
  valor: string;
  tipo: "string" | "number" | "boolean" | "json" | "color" | "file";
  categoria: string;
  descricao?: string;
  editavel?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemaSistema {
  id?: string;
  nome: string;
  ativo: boolean;
  cores: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  fontes?: {
    family: string;
    sizes: Record<string, string>;
  };
  espacamentos?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface TextoSistema {
  id?: string;
  chave: string;
  texto_original: string;
  texto_personalizado?: string;
  categoria: string;
  pagina: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioSistema {
  id?: string;
  email: string;
  nome_completo: string;
  senha_hash?: string;
  tipo_usuario: "admin" | "pastor" | "recepcao" | "dizimista" | "usuario";
  permissoes: Record<string, boolean>;
  ativo: boolean;
  ultimo_login?: string;
  foto_perfil?: string;
  telefone?: string;
  cargo?: string;
  observacoes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LogotipoSistema {
  id?: string;
  nome: string;
  tipo: "logo_principal" | "logo_login" | "favicon" | "background";
  arquivo_url: string;
  arquivo_nome?: string;
  tamanho_bytes?: number;
  dimensoes?: { width: number; height: number };
  ativo: boolean;
  especificacoes?: {
    width_min?: number;
    width_max?: number;
    height_min?: number;
    height_max?: number;
    formato?: string[];
    tamanho_max_mb?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface NichoMercado {
  id?: string;
  nome: string;
  descricao?: string;
  icone?: string;
  configuracoes: {
    nome_sistema: string;
    cores: Record<string, string>;
    modulos: string[];
    textos_especificos: Record<string, string>;
  };
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateRelatorio {
  id?: string;
  nome: string;
  tipo: string;
  template_html?: string;
  template_css?: string;
  variaveis?: Record<string, string>;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LogAdmin {
  id?: string;
  usuario_id: string;
  acao: string;
  tabela_afetada?: string;
  registro_id?: string;
  dados_anteriores?: Record<string, any>;
  dados_novos?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Classe principal do serviço administrativo
export class AdminService {
  // ==================== TEMA PADRÃO ====================

  static getTemaDefault(): TemaSistema {
    return {
      nome: "Tema Padrão",
      ativo: true,
      cores: {
        primary: "#007bff",
        secondary: "#6c757d",
        accent: "#28a745",
        background: "#ffffff",
        text: "#212529",
        muted: "#6c757d",
      },
      fontes: {
        family: "Inter, system-ui, sans-serif",
        sizes: {
          xs: "0.75rem",
          sm: "0.875rem",
          base: "1rem",
          lg: "1.125rem",
          xl: "1.25rem",
          "2xl": "1.5rem",
        },
      },
      espacamentos: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
      },
    };
  }

  // ==================== CONFIGURAÇÕES DO SISTEMA ====================

  static async obterConfiguracoes(
    categoria?: string
  ): Promise<ConfiguracaoSistema[]> {
    try {
      let query = supabase.from("configuracoes_sistema").select("*");

      if (categoria) {
        query = query.eq("categoria", categoria);
      }

      const { data, error } = await query.order("categoria", {
        ascending: true,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter configurações:", error);
      throw error;
    }
  }

  static async atualizarConfiguracao(
    chave: string,
    valor: string
  ): Promise<ConfiguracaoSistema> {
    try {
      const { data, error } = await supabase
        .from("configuracoes_sistema")
        .update({ valor, updated_at: new Date().toISOString() })
        .eq("chave", chave)
        .select()
        .single();

      if (error) throw error;

      // Log da ação
      await this.registrarLog(
        "atualizar_configuracao",
        "configuracoes_sistema",
        data.id,
        { chave, valor }
      );

      return data;
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      throw error;
    }
  }

  static async criarConfiguracao(
    configuracao: Omit<ConfiguracaoSistema, "id" | "created_at" | "updated_at">
  ): Promise<ConfiguracaoSistema> {
    try {
      const { data, error } = await supabase
        .from("configuracoes_sistema")
        .insert(configuracao)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog(
        "criar_configuracao",
        "configuracoes_sistema",
        data.id,
        configuracao
      );

      return data;
    } catch (error) {
      console.error("Erro ao criar configuração:", error);
      throw error;
    }
  }

  // ==================== TEMAS DO SISTEMA ====================

  static async obterTemas(): Promise<TemaSistema[]> {
    try {
      const { data, error } = await supabase
        .from("temas_sistema")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter temas:", error);
      throw error;
    }
  }

  static async obterTemaAtivo(): Promise<TemaSistema> {
    try {
      const { data, error } = await supabase
        .from("temas_sistema")
        .select("*")
        .eq("ativo", true)
        .single();

      // Se não encontrou tema ativo ou ocorreu erro, retorna tema padrão
      if (error || !data) {
        console.warn("Nenhum tema ativo encontrado, usando tema padrão");
        return this.getTemaDefault();
      }

      // Garantir que todas as propriedades de cores existam
      const temaDefault = this.getTemaDefault();
      const coresCompletas = {
        ...temaDefault.cores,
        ...data.cores,
      };

      return {
        ...data,
        cores: coresCompletas,
      };
    } catch (error) {
      console.error("Erro ao obter tema ativo:", error);
      return this.getTemaDefault();
    }
  }

  static async ativarTema(temaId: string): Promise<void> {
    try {
      // Desativar todos os temas
      await supabase.from("temas_sistema").update({ ativo: false });

      // Ativar o tema selecionado
      const { error } = await supabase
        .from("temas_sistema")
        .update({ ativo: true, updated_at: new Date().toISOString() })
        .eq("id", temaId);

      if (error) throw error;

      await this.registrarLog("ativar_tema", "temas_sistema", temaId);
    } catch (error) {
      console.error("Erro ao ativar tema:", error);
      throw error;
    }
  }

  static async criarTema(
    tema: Omit<TemaSistema, "id" | "created_at" | "updated_at">
  ): Promise<TemaSistema> {
    try {
      // Garantir que o tema tenha todas as cores necessárias
      const temaDefault = this.getTemaDefault();
      const temaCompleto = {
        ...tema,
        cores: {
          ...temaDefault.cores,
          ...tema.cores,
        },
      };

      const { data, error } = await supabase
        .from("temas_sistema")
        .insert(temaCompleto)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog(
        "criar_tema",
        "temas_sistema",
        data.id,
        temaCompleto
      );

      return data;
    } catch (error) {
      console.error("Erro ao criar tema:", error);
      throw error;
    }
  }

  static async atualizarTema(
    temaId: string,
    tema: Partial<TemaSistema>
  ): Promise<TemaSistema> {
    try {
      // Se estiver atualizando cores, garantir que todas as cores necessárias estejam presentes
      if (tema.cores) {
        const temaAtual = await supabase
          .from("temas_sistema")
          .select("cores")
          .eq("id", temaId)
          .single();

        const temaDefault = this.getTemaDefault();
        tema.cores = {
          ...temaDefault.cores,
          ...(temaAtual.data?.cores || {}),
          ...tema.cores,
        };
      }

      const { data, error } = await supabase
        .from("temas_sistema")
        .update({ ...tema, updated_at: new Date().toISOString() })
        .eq("id", temaId)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog("atualizar_tema", "temas_sistema", temaId, tema);

      return data;
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
      throw error;
    }
  }

  // ==================== TEXTOS DO SISTEMA ====================

  static async obterTextos(
    categoria?: string,
    pagina?: string
  ): Promise<TextoSistema[]> {
    try {
      let query = supabase.from("textos_sistema").select("*");

      if (categoria) {
        query = query.eq("categoria", categoria);
      }

      if (pagina) {
        query = query.eq("pagina", pagina);
      }

      const { data, error } = await query.order("chave", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter textos:", error);
      throw error;
    }
  }

  static async atualizarTexto(
    chave: string,
    textoPersonalizado: string
  ): Promise<TextoSistema> {
    try {
      const { data, error } = await supabase
        .from("textos_sistema")
        .update({
          texto_personalizado: textoPersonalizado,
          updated_at: new Date().toISOString(),
        })
        .eq("chave", chave)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog("atualizar_texto", "textos_sistema", data.id, {
        chave,
        textoPersonalizado,
      });

      return data;
    } catch (error) {
      console.error("Erro ao atualizar texto:", error);
      throw error;
    }
  }

  static async obterTexto(chave: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("textos_sistema")
        .select("texto_original, texto_personalizado")
        .eq("chave", chave)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      return data?.texto_personalizado || data?.texto_original || chave;
    } catch (error) {
      console.error("Erro ao obter texto:", error);
      return chave; // Fallback para a chave se não encontrar
    }
  }

  // ==================== USUÁRIOS DO SISTEMA ====================

  static async obterUsuarios(): Promise<UsuarioSistema[]> {
    try {
      const { data, error } = await supabase
        .from("usuarios_sistema")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      throw error;
    }
  }

  static async criarUsuario(
    usuario: Omit<UsuarioSistema, "id" | "created_at" | "updated_at">
  ): Promise<UsuarioSistema> {
    try {
      const { data, error } = await supabase
        .from("usuarios_sistema")
        .insert(usuario)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog("criar_usuario", "usuarios_sistema", data.id, {
        email: usuario.email,
        tipo: usuario.tipo_usuario,
      });

      return data;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }

  static async atualizarUsuario(
    usuarioId: string,
    usuario: Partial<UsuarioSistema>
  ): Promise<UsuarioSistema> {
    try {
      const { data, error } = await supabase
        .from("usuarios_sistema")
        .update({ ...usuario, updated_at: new Date().toISOString() })
        .eq("id", usuarioId)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog(
        "atualizar_usuario",
        "usuarios_sistema",
        usuarioId,
        usuario
      );

      return data;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  static async desativarUsuario(usuarioId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("usuarios_sistema")
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq("id", usuarioId);

      if (error) throw error;

      await this.registrarLog(
        "desativar_usuario",
        "usuarios_sistema",
        usuarioId
      );
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      throw error;
    }
  }

  // ==================== LOGOTIPOS DO SISTEMA ====================

  static async obterLogotipos(): Promise<LogotipoSistema[]> {
    try {
      const { data, error } = await supabase
        .from("logotipos_sistema")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter logotipos:", error);
      throw error;
    }
  }

  static async obterLogotipoPorTipo(
    tipo: string
  ): Promise<LogotipoSistema | null> {
    try {
      const { data, error } = await supabase
        .from("logotipos_sistema")
        .select("*")
        .eq("tipo", tipo)
        .eq("ativo", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (error) {
      console.error("Erro ao obter logotipo por tipo:", error);
      return null;
    }
  }

  static async uploadLogotipo(
    arquivo: File,
    tipo: string,
    nome: string
  ): Promise<LogotipoSistema> {
    try {
      // Upload do arquivo para o Supabase Storage
      const nomeArquivo = `${tipo}_${Date.now()}_${arquivo.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("logotipos")
        .upload(nomeArquivo, arquivo);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("logotipos")
        .getPublicUrl(nomeArquivo);

      // Desativar logotipo anterior do mesmo tipo
      await supabase
        .from("logotipos_sistema")
        .update({ ativo: false })
        .eq("tipo", tipo);

      // Criar registro do logotipo
      const logotipo: Omit<
        LogotipoSistema,
        "id" | "created_at" | "updated_at"
      > = {
        nome,
        tipo: tipo as any,
        arquivo_url: urlData.publicUrl,
        arquivo_nome: arquivo.name,
        tamanho_bytes: arquivo.size,
        ativo: true,
      };

      const { data, error } = await supabase
        .from("logotipos_sistema")
        .insert(logotipo)
        .select()
        .single();

      if (error) throw error;

      await this.registrarLog("upload_logotipo", "logotipos_sistema", data.id, {
        tipo,
        nome,
      });

      return data;
    } catch (error) {
      console.error("Erro ao fazer upload do logotipo:", error);
      throw error;
    }
  }

  // ==================== NICHOS DE MERCADO ====================

  static async obterNichos(): Promise<NichoMercado[]> {
    try {
      const { data, error } = await supabase
        .from("nichos_mercado")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter nichos:", error);
      throw error;
    }
  }

  static async aplicarNicho(nichoId: string): Promise<void> {
    try {
      // Obter configurações do nicho
      const { data: nicho, error: nichoError } = await supabase
        .from("nichos_mercado")
        .select("*")
        .eq("id", nichoId)
        .single();

      if (nichoError) throw nichoError;

      if (!nicho?.configuracoes?.cores) {
        throw new Error("Configurações de cores do nicho não encontradas");
      }

      // Aplicar configurações do nicho
      const configuracoes = nicho.configuracoes;

      // Atualizar nome do sistema
      if (configuracoes.nome_sistema) {
        await this.atualizarConfiguracao(
          "nome_sistema",
          configuracoes.nome_sistema
        );
      }

      // Atualizar nicho ativo
      await this.atualizarConfiguracao("nicho_ativo", nicho.nome.toLowerCase());

      // Garantir que todas as cores necessárias estão presentes
      const temaDefault = this.getTemaDefault();
      const coresNicho = {
        ...temaDefault.cores,
        primary: configuracoes.cores.primary || temaDefault.cores.primary,
        secondary: configuracoes.cores.secondary || temaDefault.cores.secondary,
        accent:
          configuracoes.cores.accent ||
          configuracoes.cores.primary ||
          temaDefault.cores.accent,
        background:
          configuracoes.cores.background ||
          configuracoes.cores.secondary ||
          temaDefault.cores.background,
        text: configuracoes.cores.text || temaDefault.cores.text,
        muted: configuracoes.cores.muted || temaDefault.cores.muted,
      };

      // Criar/atualizar tema com as cores do nicho
      const temaData: Omit<TemaSistema, "id" | "created_at" | "updated_at"> = {
        nome: `Tema ${nicho.nome}`,
        ativo: false, // Será ativado depois
        cores: coresNicho,
        fontes: temaDefault.fontes,
        espacamentos: temaDefault.espacamentos,
      };

      const novoTema = await this.criarTema(temaData);
      await this.ativarTema(novoTema.id!);

      await this.registrarLog("aplicar_nicho", "nichos_mercado", nichoId, {
        nome: nicho.nome,
      });
    } catch (error) {
      console.error("Erro ao aplicar nicho:", error);
      throw error;
    }
  }

  // ==================== LOGS ADMINISTRATIVOS ====================

  static async registrarLog(
    acao: string,
    tabelaAfetada?: string,
    registroId?: string,
    dadosNovos?: Record<string, any>,
    dadosAnteriores?: Record<string, any>
  ): Promise<void> {
    try {
      // Obter usuário atual (implementar conforme seu sistema de auth)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const log: Omit<LogAdmin, "id" | "created_at"> = {
        usuario_id: user?.id || "sistema",
        acao,
        tabela_afetada: tabelaAfetada,
        registro_id: registroId,
        dados_novos: dadosNovos,
        dados_anteriores: dadosAnteriores,
      };

      await supabase.from("logs_admin").insert(log);
    } catch (error) {
      console.error("Erro ao registrar log:", error);
      // Não propagar erro de log para não quebrar a operação principal
    }
  }

  static async obterLogs(limite: number = 100): Promise<LogAdmin[]> {
    try {
      const { data, error } = await supabase
        .from("logs_admin")
        .select(
          `
          *,
          usuarios_sistema!logs_admin_usuario_id_fkey(nome_completo, email)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao obter logs:", error);
      throw error;
    }
  }

  // ==================== UTILITÁRIOS ====================

  static async exportarConfiguracoes(): Promise<any> {
    try {
      const [configuracoes, temas, textos, logotipos] = await Promise.all([
        this.obterConfiguracoes(),
        this.obterTemas(),
        this.obterTextos(),
        this.obterLogotipos(),
      ]);

      return {
        configuracoes,
        temas,
        textos,
        logotipos,
        exportado_em: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao exportar configurações:", error);
      throw error;
    }
  }

  static async importarConfiguracoes(dados: any): Promise<void> {
    try {
      // Implementar importação de configurações
      // (Cuidado com segurança e validação)
      await this.registrarLog("importar_configuracoes", undefined, undefined, {
        total_itens: Object.keys(dados).length,
      });
    } catch (error) {
      console.error("Erro ao importar configurações:", error);
      throw error;
    }
  }

  // ==================== INICIALIZAÇÃO ====================

  static async inicializarSistema(): Promise<void> {
    try {
      // Verificar se existe tema ativo
      const temaAtivo = await supabase
        .from("temas_sistema")
        .select("id")
        .eq("ativo", true)
        .single();

      // Se não existe tema ativo, criar e ativar tema padrão
      if (!temaAtivo.data) {
        console.log("Criando tema padrão...");
        const temaDefault = this.getTemaDefault();
        const novoTema = await this.criarTema(temaDefault);
        await this.ativarTema(novoTema.id!);
      }

      console.log("Sistema inicializado com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar sistema:", error);
      throw error;
    }
  }
}

export default AdminService;
