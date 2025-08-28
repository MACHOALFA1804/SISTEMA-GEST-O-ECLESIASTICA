import React, { useState, useEffect, useCallback } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface HistoricoVisitantesViewProps {
  onBack: () => void;
}

const HistoricoVisitantesView: React.FC<HistoricoVisitantesViewProps> = ({ onBack }) => {
  const [visitantes, setVisitantes] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitante, setSelectedVisitante] = useState<VisitanteRow | null>(null);
  const [editingVisitante, setEditingVisitante] = useState<VisitanteRow | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // Carregar visitantes
  const loadVisitantes = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('visitantes')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,congregacao_origem.ilike.%${searchTerm}%`);
      }

      if (filtroStatus !== 'Todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVisitantes(data || []);

    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar visitantes' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filtroStatus]);

  useEffect(() => {
    loadVisitantes();
  }, [loadVisitantes]);

  // Editar visitante
  const handleEdit = (visitante: VisitanteRow) => {
    setEditingVisitante(visitante);
  };

  // Salvar edição
  const handleSaveEdit = async (visitante: VisitanteRow) => {
    if (!visitante.id) {
      setMessage({ type: 'error', text: 'ID do visitante não encontrado!' });
      return;
    }

    try {
      console.log('Salvando visitante:', visitante);
      
      const updateData = {
        nome: visitante.nome || '',
        telefone: visitante.telefone || '',
        tipo: visitante.tipo || 'Cristão',
        status: visitante.status || 'Aguardando',
        quem_acompanha: visitante.quem_acompanha || '',
        congregacao_origem: visitante.congregacao_origem || '',
        observacoes: visitante.observacoes || '',
        updated_at: new Date().toISOString()
      };

      console.log('Dados para atualização:', updateData);

      const { data, error } = await supabase
        .from('visitantes')
        .update(updateData)
        .eq('id', visitante.id)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Resposta do Supabase:', data);

      setMessage({ type: 'success', text: 'Visitante atualizado com sucesso!' });
      setEditingVisitante(null);
      
      // Recarregar dados após um pequeno delay
      setTimeout(() => {
        loadVisitantes();
      }, 500);

    } catch (error: any) {
      console.error('Erro ao atualizar visitante:', error);
      setMessage({ 
        type: 'error', 
        text: `Erro ao atualizar: ${error.message || 'Erro desconhecido'}` 
      });
    }
  };

  // Excluir visitante
  const handleDelete = async (visitante: VisitanteRow) => {
    if (!window.confirm(`Tem certeza que deseja excluir o visitante "${visitante.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('visitantes')
        .delete()
        .eq('id', visitante.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Visitante excluído com sucesso!' });
      loadVisitantes(); // Recarregar dados

    } catch (error: any) {
      console.error('Erro ao excluir visitante:', error);
      setMessage({ type: 'error', text: `Erro ao excluir: ${error.message}` });
    }
  };

  // Abrir WhatsApp
  const handleWhatsApp = (visitante: VisitanteRow) => {
    const telefone = visitante.telefone?.replace(/\D/g, '') || '';
    if (telefone) {
      const mensagem = `Olá ${visitante.nome}! Aqui é da igreja. Como você está?`;
      const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    } else {
      setMessage({ type: 'error', text: 'Telefone não informado para este visitante' });
    }
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingVisitante(null);
  };

  // Atualizar campo em edição
  const handleEditChange = (field: keyof VisitanteRow, value: string) => {
    if (editingVisitante) {
      console.log(`Alterando campo ${field} de "${editingVisitante[field]}" para "${value}"`);
      
      setEditingVisitante(prev => {
        if (!prev) return null;
        
        const updated = {
          ...prev,
          [field]: value
        };
        
        console.log('Visitante atualizado:', updated);
        return updated;
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Aguardando': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'Visitado': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'Novo Membro': return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      default: return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    }
  };

  const getTipoColor = (tipo?: string) => {
    switch (tipo) {
      case 'Cristão': return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'Não Cristão': return 'bg-orange-500/10 border-orange-500/30 text-orange-300';
      case 'Pregador': return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Histórico de Visitantes</h2>
              <p className="text-slate-400 text-sm">Visualizar e gerenciar todos os visitantes</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, telefone ou congregação..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            />
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
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFiltroStatus('Todos');
              }}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
            >
              Limpar Filtros
            </button>
          </div>
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
            Nenhum visitante encontrado
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
                  <th className="px-3 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {visitantes.map((visitante) => (
                  <tr key={visitante.id} className="hover:bg-slate-900/40">
                    <td className="px-3 py-3">
                      {editingVisitante?.id === visitante.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingVisitante?.nome || ''}
                            onChange={(e) => handleEditChange('nome', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 text-white border border-cyan-500 focus:outline-none focus:border-cyan-400"
                            placeholder="Nome do visitante"
                          />
                          <div className="text-xs text-cyan-400">Editando...</div>
                        </div>
                      ) : (
                        <span className="text-white font-medium">
                          {visitante.nome || 'Nome não informado'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editingVisitante?.id === visitante.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingVisitante?.telefone || ''}
                            onChange={(e) => handleEditChange('telefone', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 text-white border border-cyan-500 focus:outline-none focus:border-cyan-400"
                            placeholder="Telefone"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-300">
                          {visitante.telefone || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editingVisitante?.id === visitante.id ? (
                        <div className="space-y-2">
                          <select
                            value={editingVisitante?.tipo || ''}
                            onChange={(e) => handleEditChange('tipo', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 text-white border border-cyan-500 focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Cristão">Cristão</option>
                            <option value="Não Cristão">Não Cristão</option>
                            <option value="Pregador">Pregador</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getTipoColor(visitante.tipo)}`}>
                          {visitante.tipo || 'Não informado'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editingVisitante?.id === visitante.id ? (
                        <div className="space-y-2">
                          <select
                            value={editingVisitante?.status || ''}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 text-white border border-cyan-500 focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Aguardando">Aguardando</option>
                            <option value="Visitado">Visitado</option>
                            <option value="Novo Membro">Novo Membro</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusColor(visitante.status)}`}>
                          {visitante.status || 'Não informado'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {visitante.created_at ? new Date(visitante.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {editingVisitante?.id === visitante.id ? (
                          <>
                            <button
                              onClick={() => editingVisitante && handleSaveEdit(editingVisitante)}
                              title="Salvar"
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Salvar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              title="Cancelar"
                              className="px-3 py-1.5 rounded-lg bg-slate-500 text-white font-medium hover:bg-slate-600 transition-colors flex items-center gap-2"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 6L6 18M6 6l12 12"/>
                              </svg>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedVisitante(visitante)}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                              title="Ver Detalhes"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(visitante)}
                              title="Editar"
                              className="p-2 rounded-lg bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(visitante)}
                              title="Excluir"
                              className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedVisitante && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVisitante(null)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-lg font-semibold mb-4">
              Detalhes do Visitante
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">Nome:</span>
                <div className="text-white font-medium">{selectedVisitante.nome}</div>
              </div>
              <div>
                <span className="text-slate-400">Telefone:</span>
                <div className="text-white">{selectedVisitante.telefone || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400">Tipo:</span>
                <div className="text-white">{selectedVisitante.tipo || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <div className="text-white">{selectedVisitante.status || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400">Quem Acompanha:</span>
                <div className="text-white">{selectedVisitante.quem_acompanha || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400">Congregação de Origem:</span>
                <div className="text-white">{selectedVisitante.congregacao_origem || '-'}</div>
              </div>
              {selectedVisitante.observacoes && (
                <div>
                  <span className="text-slate-400">Observações:</span>
                  <div className="text-white">{selectedVisitante.observacoes}</div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedVisitante(null)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleWhatsApp(selectedVisitante);
                  setSelectedVisitante(null);
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HistoricoVisitantesView;
