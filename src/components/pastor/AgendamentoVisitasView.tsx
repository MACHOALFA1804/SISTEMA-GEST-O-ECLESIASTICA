import React, { useState, useEffect } from 'react';
import { supabase, VisitanteRow, VisitaRow } from '../../lib/supabaseClient';

interface AgendamentoVisitasViewProps {
  onBack: () => void;
}

interface CalendarioItem {
  data: string;
  visitas: VisitaRow[];
  disponivel: boolean;
}

const AgendamentoVisitasView: React.FC<AgendamentoVisitasViewProps> = ({ onBack }) => {
  const [visitantesDisponiveis, setVisitantesDisponiveis] = useState<VisitanteRow[]>([]);
  const [visitasAgendadas, setVisitasAgendadas] = useState<VisitaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  
  // Form data
  const [novaVisita, setNovaVisita] = useState<Partial<VisitaRow>>({
    visitante_id: '',
    data_agendada: '',
    tipo_visita: 'Presencial',
    status: 'Agendada',
    observacoes: '',
    requer_acompanhamento: false
  });

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Carregar TODOS os visitantes ativos, priorizando quem precisa de visita
      const { data: visitantes, error: visitantesError } = await supabase
        .from('visitantes')
        .select('*')
        .not('status', 'eq', 'Novo Membro') // Excluir apenas quem já virou membro
        .order('tipo', { ascending: false }) // Não cristãos primeiro
        .order('status', { ascending: false }) // Status prioritários primeiro
        .order('nome', { ascending: true }); // Depois por nome

      if (visitantesError) throw visitantesError;
      setVisitantesDisponiveis(visitantes || []);

      // Carregar visitas agendadas
      const { data: visitas, error: visitasError } = await supabase
        .from('visitas')
        .select(`
          *,
          visitantes:visitante_id (nome, telefone, tipo)
        `)
        .in('status', ['Agendada', 'Reagendada'])
        .order('data_agendada', { ascending: true });

      if (visitasError) throw visitasError;
      setVisitasAgendadas(visitas || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaVisita.visitante_id || !novaVisita.data_agendada) {
      alert('Visitante e data são obrigatórios!');
      return;
    }

    try {
      // Obter usuário logado para salvar como pastor_id
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Normalizar data para ISO (compatível com timestamp com fuso)
      const dataISO = new Date(novaVisita.data_agendada as string).toISOString();

      const { error } = await supabase
        .from('visitas')
        .insert([{
          ...novaVisita,
          data_agendada: dataISO,
          pastor_id: userId
        }]);

      if (error) throw error;

      // Atualizar status do visitante para "Aguardando Visita" se não estiver já
      const visitanteSelecionado = visitantesDisponiveis.find(v => v.id === novaVisita.visitante_id);
      if (visitanteSelecionado && visitanteSelecionado.status !== 'Aguardando Visita') {
        await supabase
          .from('visitantes')
          .update({ status: 'Aguardando Visita' })
          .eq('id', novaVisita.visitante_id);
      }

      alert('Visita agendada com sucesso!');
      setShowForm(false);
      setNovaVisita({
        visitante_id: '',
        data_agendada: '',
        tipo_visita: 'Presencial',
        status: 'Agendada',
        observacoes: '',
        requer_acompanhamento: false
      });
      loadData();

    } catch (error: any) {
      console.error('Erro ao agendar visita:', error);
      alert(`Erro ao agendar visita: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNovaVisita(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const gerarCalendario = () => {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const dias: CalendarioItem[] = [];

    for (let dia = 1; dia <= fim.getDate(); dia++) {
      const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
      const dataStr = data.toISOString().split('T')[0];
      
      const visitasDoDia = visitasAgendadas.filter(visita => 
        visita.data_agendada?.split('T')[0] === dataStr
      );

      dias.push({
        data: dataStr,
        visitas: visitasDoDia,
        disponivel: data >= new Date()
      });
    }

    return dias;
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Função para organizar visitantes por prioridade
  const getVisitantesPorPrioridade = () => {
    return visitantesDisponiveis.sort((a, b) => {
      // Prioridade 1: Não cristãos primeiro
      if (a.tipo === 'Não Cristão' && b.tipo !== 'Não Cristão') return -1;
      if (b.tipo === 'Não Cristão' && a.tipo !== 'Não Cristão') return 1;
      
      // Prioridade 2: Status que precisam mais de visita
      const prioridadeStatus: { [key: string]: number } = {
        'Aguardando Visita': 1,
        'Pendente': 2,
        'Aguardando': 3,
        'Visitado': 4
      };
      
      const prioA = prioridadeStatus[a.status || ''] || 5;
      const prioB = prioridadeStatus[b.status || ''] || 5;
      
      if (prioA !== prioB) return prioA - prioB;
      
      // Prioridade 3: Nome alfabético
      return (a.nome || '').localeCompare(b.nome || '');
    });
  };

  const diasCalendario = gerarCalendario();
  const visitantesOrdenados = getVisitantesPorPrioridade();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V8h14v11H5z"/>
                <path d="M7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Agendamento de Visitas</h2>
              <p className="text-slate-400 text-sm">Calendário de visitas pastorais</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300"
            >
              + Nova Visita
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={mesAnterior}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  ←
                </button>
                <button
                  onClick={proximoMes}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendário Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Headers dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                <div key={dia} className="text-center text-slate-400 text-sm font-medium p-2">
                  {dia}
                </div>
              ))}

              {/* Dias do mês */}
              {diasCalendario.map((item, index) => {
                const dia = new Date(item.data).getDate();
                const temVisitas = item.visitas.length > 0;
                const isHoje = item.data === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square border border-slate-700 rounded-lg p-1 text-sm
                      ${item.disponivel ? 'bg-slate-900/40' : 'bg-slate-800/60 opacity-50'}
                      ${isHoje ? 'ring-2 ring-cyan-400' : ''}
                      ${temVisitas ? 'bg-green-500/20 border-green-500/40' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className={`font-medium ${isHoje ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {dia}
                      </div>
                      {temVisitas && (
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 mx-auto"></div>
                          <div className="text-xs text-green-300 mt-1">
                            {item.visitas.length} visita{item.visitas.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Próximas Visitas */}
        <div className="space-y-6">
          {/* Próximas Visitas */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Próximas Visitas</h3>
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : visitasAgendadas.length === 0 ? (
              <div className="text-slate-400 text-sm">Nenhuma visita agendada</div>
            ) : (
              <div className="space-y-3">
                {visitasAgendadas.slice(0, 5).map((visita) => (
                  <div key={visita.id} className="rounded-lg border border-slate-700 p-3 bg-slate-900/40">
                    <div className="text-white font-medium text-sm">
                      {(visita as any).visitantes?.nome || 'Nome não encontrado'}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {visita.data_agendada ? formatarData(visita.data_agendada) : '-'}
                    </div>
                    <div className="text-slate-300 text-xs mt-1">
                      {visita.tipo_visita} • {visita.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visitantes Precisam de Visita */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Precisam de Visita</h3>
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : visitantesDisponiveis.filter(v => 
              v.status && ['Aguardando Visita', 'Pendente', 'Aguardando'].includes(v.status)
            ).length === 0 ? (
              <div className="text-slate-400 text-sm">Nenhum visitante pendente</div>
            ) : (
              <div className="space-y-3">
                {visitantesDisponiveis
                  .filter(v => v.status && ['Aguardando Visita', 'Pendente', 'Aguardando'].includes(v.status))
                  .slice(0, 5)
                  .map((visitante) => (
                    <div key={visitante.id} className="rounded-lg border border-slate-700 p-3 bg-slate-900/40">
                      <div className="text-white font-medium text-sm flex items-center gap-2">
                        {visitante.nome}
                        {visitante.tipo === 'Não Cristão' && (
                          <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                            Prioridade
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs">{visitante.telefone}</div>
                      <div className="text-slate-300 text-xs mt-1">
                        {visitante.tipo} • {visitante.status}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nova Visita */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Agendar Nova Visita</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Visitante *
                </label>
                <select
                  name="visitante_id"
                  value={novaVisita.visitante_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  required
                >
                  <option value="">Selecione um visitante</option>
                  {visitantesOrdenados.map((visitante) => (
                    <option key={visitante.id} value={visitante.id}>
                      {visitante.nome} - {visitante.tipo}
                      {visitante.tipo === 'Não Cristão' ? ' 🔥' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  name="data_agendada"
                  value={novaVisita.data_agendada || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Visita
                </label>
                <select
                  name="tipo_visita"
                  value={novaVisita.tipo_visita || 'Presencial'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Telefone">Telefone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={novaVisita.observacoes || ''}
                  onChange={handleInputChange}
                  placeholder="Detalhes sobre a visita..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="requer_acompanhamento"
                  checked={novaVisita.requer_acompanhamento || false}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-slate-300 text-sm">Requer acompanhamento posterior</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AgendamentoVisitasView;