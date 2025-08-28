import { supabase } from '../lib/supabaseClient';

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

export interface EstatisticasContribuicao {
  totalDizimos: number;
  totalOfertas: number;
  totalGeral: number;
  ultimoMes: number;
  mediaAnual: number;
  metaMensal?: number;
  percentualMeta?: number;
  totalContribuintes: number;
  contribuicoesPorTipo: { [key: string]: number };
  contribuicoesPorMes: { mes: string; valor: number }[];
}

// Classe de serviço para gerenciar dizimistas e contribuições
export class DizimistaService {
  
  // CRUD para Dizimistas
  static async criarDizimista(dizimista: Omit<DizimistaRow, 'id' | 'created_at' | 'updated_at'>): Promise<DizimistaRow> {
    const { data, error } = await supabase
      .from('dizimistas')
      .insert([dizimista])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar dizimista: ${error.message}`);
    }

    return data;
  }

  static async listarDizimistas(filtros?: {
    status?: string;
    nome?: string;
    limite?: number;
    offset?: number;
  }): Promise<DizimistaRow[]> {
    let query = supabase
      .from('dizimistas')
      .select('*')
      .order('nome', { ascending: true });

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.nome) {
      query = query.ilike('nome', `%${filtros.nome}%`);
    }

    if (filtros?.limite) {
      query = query.limit(filtros.limite);
    }

    if (filtros?.offset) {
      query = query.range(filtros.offset, filtros.offset + (filtros.limite || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar dizimistas: ${error.message}`);
    }

    return data || [];
  }

  static async obterDizimista(id: string): Promise<DizimistaRow | null> {
    const { data, error } = await supabase
      .from('dizimistas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao obter dizimista: ${error.message}`);
    }

    return data;
  }

  static async atualizarDizimista(id: string, dados: Partial<DizimistaRow>): Promise<DizimistaRow> {
    const { data, error } = await supabase
      .from('dizimistas')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar dizimista: ${error.message}`);
    }

    return data;
  }

  static async excluirDizimista(id: string): Promise<void> {
    const { error } = await supabase
      .from('dizimistas')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir dizimista: ${error.message}`);
    }
  }

  // CRUD para Contribuições
  static async registrarContribuicao(contribuicao: Omit<ContribuicaoRow, 'id' | 'created_at' | 'updated_at'>): Promise<ContribuicaoRow> {
    // Obter usuário atual para registrar quem cadastrou
    const { data: userData } = await supabase.auth.getUser();
    const contribuicaoComUsuario = {
      ...contribuicao,
      usuario_cadastro: userData.user?.id
    };

    const { data, error } = await supabase
      .from('contribuicoes')
      .insert([contribuicaoComUsuario])
      .select(`
        *,
        dizimistas:dizimista_id (nome, telefone)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao registrar contribuição: ${error.message}`);
    }

    return data;
  }

  static async listarContribuicoes(filtros?: {
    dizimista_id?: string;
    tipo_contribuicao?: string;
    data_inicio?: string;
    data_fim?: string;
    limite?: number;
    offset?: number;
  }): Promise<ContribuicaoRow[]> {
    let query = supabase
      .from('contribuicoes')
      .select(`
        *,
        dizimistas:dizimista_id (nome, telefone, email)
      `)
      .order('data_contribuicao', { ascending: false });

    if (filtros?.dizimista_id) {
      query = query.eq('dizimista_id', filtros.dizimista_id);
    }

    if (filtros?.tipo_contribuicao) {
      query = query.eq('tipo_contribuicao', filtros.tipo_contribuicao);
    }

    if (filtros?.data_inicio) {
      query = query.gte('data_contribuicao', filtros.data_inicio);
    }

    if (filtros?.data_fim) {
      query = query.lte('data_contribuicao', filtros.data_fim);
    }

    if (filtros?.limite) {
      query = query.limit(filtros.limite);
    }

    if (filtros?.offset) {
      query = query.range(filtros.offset, filtros.offset + (filtros.limite || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar contribuições: ${error.message}`);
    }

    return data || [];
  }

  static async obterContribuicao(id: string): Promise<ContribuicaoRow | null> {
    const { data, error } = await supabase
      .from('contribuicoes')
      .select(`
        *,
        dizimistas:dizimista_id (nome, telefone, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao obter contribuição: ${error.message}`);
    }

    return data;
  }

  static async atualizarContribuicao(id: string, dados: Partial<ContribuicaoRow>): Promise<ContribuicaoRow> {
    const { data, error } = await supabase
      .from('contribuicoes')
      .update(dados)
      .eq('id', id)
      .select(`
        *,
        dizimistas:dizimista_id (nome, telefone, email)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar contribuição: ${error.message}`);
    }

    return data;
  }

  static async excluirContribuicao(id: string): Promise<void> {
    const { error } = await supabase
      .from('contribuicoes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir contribuição: ${error.message}`);
    }
  }

  // Estatísticas e Relatórios
  static async obterEstatisticas(periodo?: {
    data_inicio?: string;
    data_fim?: string;
  }): Promise<EstatisticasContribuicao> {
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const dataInicio = periodo?.data_inicio || inicioAno.toISOString().split('T')[0];
    const dataFim = periodo?.data_fim || hoje.toISOString().split('T')[0];

    // Buscar todas as contribuições do período
    const { data: contribuicoes, error } = await supabase
      .from('contribuicoes')
      .select('*')
      .gte('data_contribuicao', dataInicio)
      .lte('data_contribuicao', dataFim);

    if (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }

    const contribuicoesData = contribuicoes || [];

    // Calcular estatísticas
    const totalDizimos = contribuicoesData
      .filter(c => c.tipo_contribuicao === 'Dízimo')
      .reduce((sum, c) => sum + parseFloat(c.valor.toString()), 0);

    const totalOfertas = contribuicoesData
      .filter(c => c.tipo_contribuicao !== 'Dízimo')
      .reduce((sum, c) => sum + parseFloat(c.valor.toString()), 0);

    const totalGeral = totalDizimos + totalOfertas;

    // Último mês
    const inicioUltimoMes = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimUltimoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    const ultimoMes = contribuicoesData
      .filter(c => {
        const dataContrib = new Date(c.data_contribuicao);
        return dataContrib >= inicioUltimoMes && dataContrib <= fimUltimoMes;
      })
      .reduce((sum, c) => sum + parseFloat(c.valor.toString()), 0);

    // Média anual (baseada nos meses com contribuições)
    const mesesComContribuicoes = new Set(
      contribuicoesData.map(c => new Date(c.data_contribuicao).getMonth())
    ).size;
    const mediaAnual = mesesComContribuicoes > 0 ? totalGeral / mesesComContribuicoes : 0;

    // Contribuintes únicos
    const totalContribuintes = new Set(contribuicoesData.map(c => c.dizimista_id)).size;

    // Contribuições por tipo
    const contribuicoesPorTipo: { [key: string]: number } = {};
    contribuicoesData.forEach(c => {
      contribuicoesPorTipo[c.tipo_contribuicao] = 
        (contribuicoesPorTipo[c.tipo_contribuicao] || 0) + parseFloat(c.valor.toString());
    });

    // Contribuições por mês (últimos 12 meses)
    const contribuicoesPorMes: { mes: string; valor: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      const valorMes = contribuicoesData
        .filter(c => {
          const dataContrib = new Date(c.data_contribuicao);
          return dataContrib.getMonth() === data.getMonth() && 
                 dataContrib.getFullYear() === data.getFullYear();
        })
        .reduce((sum, c) => sum + parseFloat(c.valor.toString()), 0);

      contribuicoesPorMes.push({ mes: mesAno, valor: valorMes });
    }

    return {
      totalDizimos,
      totalOfertas,
      totalGeral,
      ultimoMes,
      mediaAnual,
      totalContribuintes,
      contribuicoesPorTipo,
      contribuicoesPorMes
    };
  }

  // Buscar dizimista por nome ou telefone
  static async buscarDizimista(termo: string): Promise<DizimistaRow[]> {
    const { data, error } = await supabase
      .from('dizimistas')
      .select('*')
      .or(`nome.ilike.%${termo}%,telefone.ilike.%${termo}%`)
      .eq('status', 'Ativo')
      .order('nome', { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Erro ao buscar dizimista: ${error.message}`);
    }

    return data || [];
  }

  // Obter histórico de contribuições de um dizimista
  static async obterHistoricoContribuicoes(dizimistaId: string, limite = 20): Promise<ContribuicaoRow[]> {
    const { data, error } = await supabase
      .from('contribuicoes')
      .select('*')
      .eq('dizimista_id', dizimistaId)
      .order('data_contribuicao', { ascending: false })
      .limit(limite);

    if (error) {
      throw new Error(`Erro ao obter histórico: ${error.message}`);
    }

    return data || [];
  }
}

export default DizimistaService;

