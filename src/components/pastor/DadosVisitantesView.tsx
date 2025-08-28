import React, { useState, useEffect, useCallback } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface DadosVisitantesViewProps {
  onBack: () => void;
}

const DadosVisitantesView: React.FC<DadosVisitantesViewProps> = ({ onBack }) => {
  const [visitantes, setVisitantes] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [ordenacao, setOrdenacao] = useState('created_at');

  // Carregar visitantes com filtros
  const loadVisitantes = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('visitantes')
        .select('*')
        .order(ordenacao, { ascending: false });

      // Aplicar filtro de período
      if (filtroPeriodo !== 'todos') {
        const hoje = new Date();
        let dataLimite = new Date();
        
        switch (filtroPeriodo) {
          case 'semana':
            dataLimite.setDate(hoje.getDate() - 7);
            break;
          case 'mes':
            dataLimite.setMonth(hoje.getMonth() - 1);
            break;
          case 'trimestre':
            dataLimite.setMonth(hoje.getMonth() - 3);
            break;
        }
        
        query = query.gte('created_at', dataLimite.toISOString());
      }

      // Aplicar filtro de tipo
      if (filtroTipo !== 'Todos') {
        query = query.eq('tipo', filtroTipo);
      }

      // Aplicar filtro de status
      if (filtroStatus !== 'Todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVisitantes(data || []);

    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroPeriodo, filtroTipo, filtroStatus, ordenacao]);

  useEffect(() => {
    loadVisitantes();
  }, [loadVisitantes]);

  // Calcular estatísticas
  const estatisticas = {
    total: visitantes.length,
    cristaos: visitantes.filter(v => v.tipo === 'Cristão').length,
    naoCristaos: visitantes.filter(v => v.tipo === 'Não Cristão').length,
    aguardando: visitantes.filter(v => v.status === 'Aguardando').length,
    visitados: visitantes.filter(v => v.status === 'Visitado').length,
    novosMembros: visitantes.filter(v => v.status === 'Novo Membro').length,
    comTelefone: visitantes.filter(v => v.telefone).length,
    semTelefone: visitantes.filter(v => !v.telefone).length
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Dados de Visitantes</h2>
              <p className="text-slate-400 text-sm">Estatísticas detalhadas e análise pastoral</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="Cristão">Cristão</option>
              <option value="Não Cristão">Não Cristão</option>
              <option value="Pregador">Pregador</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Visitado">Visitado</option>
              <option value="Novo Membro">Novo Membro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ordenar por</label>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="created_at">Data de Cadastro</option>
              <option value="nome">Nome</option>
              <option value="tipo">Tipo</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{estatisticas.total}</div>
          <div className="text-blue-300 text-sm">Total</div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{estatisticas.novosMembros}</div>
          <div className="text-green-300 text-sm">Novos Membros</div>
        </div>
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{estatisticas.naoCristaos}</div>
          <div className="text-purple-300 text-sm">Não Cristãos</div>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{estatisticas.aguardando}</div>
          <div className="text-yellow-300 text-sm">Aguardando</div>
        </div>
      </div>

      {/* Lista de Visitantes */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <h3 className="text-white font-semibold mb-4">Visitantes ({visitantes.length})</h3>
        
        {loading ? (
          <div className="text-center text-slate-400 py-8">
            Carregando visitantes...
          </div>
        ) : visitantes.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Nenhum visitante encontrado com os filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="px-3 py-3 font-medium">Nome</th>
                  <th className="px-3 py-3 font-medium">Telefone</th>
                  <th className="px-3 py-3 font-medium">Tipo</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Data de Cadastro</th>
                  <th className="px-3 py-3 font-medium">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {visitantes.map((visitante) => (
                  <tr key={visitante.id} className="hover:bg-slate-900/40">
                    <td className="px-3 py-3">
                      <span className="text-white font-medium">
                        {visitante.nome || 'Nome não informado'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {visitante.telefone || '-'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        visitante.tipo === 'Cristão' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                        visitante.tipo === 'Não Cristão' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
                        'bg-gray-500/10 border-gray-500/30 text-gray-300'
                      }`}>
                        {visitante.tipo || 'Não informado'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        visitante.status === 'Aguardando' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                        visitante.status === 'Visitado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                        visitante.status === 'Novo Membro' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
                        'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      }`}>
                        {visitante.status || 'Não informado'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {visitante.created_at ? new Date(visitante.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-400 max-w-xs truncate">
                      {visitante.observacoes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default DadosVisitantesView;
