import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://oghibmokjwoeyywkgpcc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naGlibW9randvZXl5d2tncGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjU0NTUsImV4cCI6MjA3MTEwMTQ1NX0.gmDD_yT96LplAH2BSbxwsy8gnVghREvvJ4m1KkB983s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces para o banco de dados
export interface VisitanteRow {
  id?: string;
  nome?: string;
  telefone?: string;
  tipo?: 'Cristão' | 'Não Cristão' | 'Pregador' | 'Outro';
  status?: 'Aguardando' | 'Aguardando Visita' | 'Visitado' | 'Novo Membro' | 'Pendente';
  quem_acompanha?: string;
  congregacao_origem?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileRow {
  id?: string;
  user_id?: string;
  role?: 'admin' | 'pastor' | 'recepcionista';
  nome?: string;
  email?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VisitaRow {
  id?: string;
  visitante_id?: string;
  pastor_id?: string;
  data_agendada?: string;
  data_realizada?: string;
  tipo_visita?: 'Presencial' | 'Telefone' | 'WhatsApp' | 'Outro';
  status?: 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada';
  observacoes?: string;
  requer_acompanhamento?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MensagemRow {
  id?: string;
  visitante_id?: string;
  usuario_id?: string;
  template_usado?: string;
  conteudo?: string;
  data_envio?: string;
  status_envio?: 'Enviada' | 'Falhada' | 'Pendente';
  whatsapp_message_id?: string;
  created_at?: string;
}

export interface ConfiguracaoRow {
  id?: string;
  chave?: string;
  valor?: string;
  descricao?: string;
  categoria?: 'sistema' | 'igreja' | 'whatsapp' | 'email' | 'pdf';
  created_at?: string;
  updated_at?: string;
}

export interface LoginAttemptRow {
  id?: string;
  email?: string;
  tentativas?: number;
  bloqueado_ate?: string;
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
}

// Interfaces para Dizimistas e Contribuições
export interface DizimistaRow {
  id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  data_nascimento?: string;
  profissao?: string;
  status?: 'Ativo' | 'Inativo' | 'Suspenso';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContribuicaoRow {
  id?: string;
  dizimista_id: string;
  tipo_contribuicao: 'Dízimo' | 'Oferta de Gratidão' | 'Oferta Especial' | 'Missões' | 'Construção' | 'Outro';
  valor: number;
  data_contribuicao: string;
  forma_pagamento?: 'Dinheiro' | 'PIX' | 'Cartão' | 'Transferência' | 'Cheque' | 'Outro';
  numero_envelope?: string;
  observacoes?: string;
  usuario_cadastro?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MetaArrecadacaoRow {
  id?: string;
  ano: number;
  mes: number;
  tipo_contribuicao: string;
  valor_meta: number;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

// Interfaces adicionais para Admin e Sistema
export interface PermissoesUsuario {
  gerenciar_usuarios: boolean;
  editar_configuracoes: boolean;
  personalizar_tema: boolean;
  gerenciar_nichos: boolean;
  acessar_logs: boolean;
  editar_relatorios: boolean;
  acessar_admin: boolean;
  acessar_pastor: boolean;
  acessar_recepcao: boolean;
  acessar_dizimista: boolean;
}

export interface UsuarioSistemaRow {
  id?: string;
  user_id?: string;
  nome: string;
  email: string;
  cargo?: string;
  permissoes?: PermissoesUsuario;
  ativo?: boolean;
  ultimo_login?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LogAdminRow {
  id?: string;
  user_id?: string;
  usuario_nome?: string;
  acao: string;
  recurso: string;
  detalhes?: string;
  ip_address?: string;
  timestamp?: string;
  created_at?: string;
}

export interface TextoPersonalizadoRow {
  id?: string;
  chave: string;
  categoria: string;
  pagina: string;
  texto_original: string;
  texto_personalizado?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateEmailRow {
  id?: string;
  nome: string;
  assunto: string;
  corpo: string;
  tipo: 'visitante' | 'membro' | 'admin' | 'geral';
  variaveis_disponiveis?: string[];
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LogotipoRow {
  id?: string;
  nome: string;
  descricao?: string;
  url_arquivo: string;
  tamanho_arquivo?: number;
  tipo_mime?: string;
  posicao: 'header' | 'footer' | 'login' | 'relatorio';
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NichoMinisterioRow {
  id?: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
  cor_tema?: string;
  ativo?: boolean;
  ordem_exibicao?: number;
  created_at?: string;
  updated_at?: string;
}

// Interfaces para relatórios e estatísticas
export interface RelatorioGeralRow {
  id?: string;
  nome: string;
  tipo: 'visitantes' | 'dizimistas' | 'contribuicoes' | 'sistema' | 'personalizado';
  parametros?: any;
  agendamento?: 'diario' | 'semanal' | 'mensal' | 'manual';
  formato: 'pdf' | 'excel' | 'csv';
  destinatarios?: string[];
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuditoriaRow {
  id?: string;
  tabela: string;
  registro_id: string;
  operacao: 'INSERT' | 'UPDATE' | 'DELETE';
  dados_antigos?: any;
  dados_novos?: any;
  usuario_id?: string;
  timestamp?: string;
  created_at?: string;
}

// Interfaces para notificações
export interface NotificacaoRow {
  id?: string;
  usuario_id?: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  lida?: boolean;
  url_acao?: string;
  data_expiracao?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para backup do sistema
export interface BackupRow {
  id?: string;
  nome: string;
  descricao?: string;
  tipo: 'completo' | 'incremental' | 'tabelas_especificas';
  tamanho_arquivo?: number;
  url_arquivo?: string;
  status: 'em_progresso' | 'concluido' | 'erro';
  usuario_solicitante?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos auxiliares para TypeScript
export type Database = {
  public: {
    Tables: {
      visitantes: {
        Row: VisitanteRow;
        Insert: Omit<VisitanteRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VisitanteRow, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
      };
      visitas: {
        Row: VisitaRow;
        Insert: Omit<VisitaRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VisitaRow, 'id' | 'created_at'>>;
      };
      mensagens: {
        Row: MensagemRow;
        Insert: Omit<MensagemRow, 'id' | 'created_at'>;
        Update: Partial<Omit<MensagemRow, 'id' | 'created_at'>>;
      };
      configuracoes: {
        Row: ConfiguracaoRow;
        Insert: Omit<ConfiguracaoRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ConfiguracaoRow, 'id' | 'created_at'>>;
      };
      dizimistas: {
        Row: DizimistaRow;
        Insert: Omit<DizimistaRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DizimistaRow, 'id' | 'created_at'>>;
      };
      contribuicoes: {
        Row: ContribuicaoRow;
        Insert: Omit<ContribuicaoRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ContribuicaoRow, 'id' | 'created_at'>>;
      };
      metas_arrecadacao: {
        Row: MetaArrecadacaoRow;
        Insert: Omit<MetaArrecadacaoRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MetaArrecadacaoRow, 'id' | 'created_at'>>;
      };
      usuarios_sistema: {
        Row: UsuarioSistemaRow;
        Insert: Omit<UsuarioSistemaRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UsuarioSistemaRow, 'id' | 'created_at'>>;
      };
      logs_admin: {
        Row: LogAdminRow;
        Insert: Omit<LogAdminRow, 'id' | 'created_at'>;
        Update: Partial<Omit<LogAdminRow, 'id' | 'created_at'>>;
      };
      textos_personalizados: {
        Row: TextoPersonalizadoRow;
        Insert: Omit<TextoPersonalizadoRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TextoPersonalizadoRow, 'id' | 'created_at'>>;
      };
      logotipos: {
        Row: LogotipoRow;
        Insert: Omit<LogotipoRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LogotipoRow, 'id' | 'created_at'>>;
      };
      nichos_ministerios: {
        Row: NichoMinisterioRow;
        Insert: Omit<NichoMinisterioRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NichoMinisterioRow, 'id' | 'created_at'>>;
      };
      notificacoes: {
        Row: NotificacaoRow;
        Insert: Omit<NotificacaoRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NotificacaoRow, 'id' | 'created_at'>>;
      };
    };
  };
};

// Cliente tipado do Supabase
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Funções utilitárias para verificação de tipos - CORRIGIDAS
export const isValidStatus = (status: string | undefined): status is NonNullable<VisitanteRow['status']> => {
  if (!status) return false;
  return (['Aguardando', 'Aguardando Visita', 'Visitado', 'Novo Membro', 'Pendente'] as const).includes(status as any);
};

export const isValidRole = (role: string | undefined): role is NonNullable<ProfileRow['role']> => {
  if (!role) return false;
  return (['admin', 'pastor', 'recepcionista'] as const).includes(role as any);
};

export const isValidTipoContribuicao = (tipo: string | undefined): tipo is ContribuicaoRow['tipo_contribuicao'] => {
  if (!tipo) return false;
  return (['Dízimo', 'Oferta de Gratidão', 'Oferta Especial', 'Missões', 'Construção', 'Outro'] as const).includes(tipo as any);
};

// Constantes para validações
export const TIPOS_VISITANTE = ['Cristão', 'Não Cristão', 'Pregador', 'Outro'] as const;
export const STATUS_VISITANTE = ['Aguardando', 'Aguardando Visita', 'Visitado', 'Novo Membro', 'Pendente'] as const;
export const ROLES_USUARIO = ['admin', 'pastor', 'recepcionista'] as const;
export const TIPOS_CONTRIBUICAO = ['Dízimo', 'Oferta de Gratidão', 'Oferta Especial', 'Missões', 'Construção', 'Outro'] as const;
export const FORMAS_PAGAMENTO = ['Dinheiro', 'PIX', 'Cartão', 'Transferência', 'Cheque', 'Outro'] as const;