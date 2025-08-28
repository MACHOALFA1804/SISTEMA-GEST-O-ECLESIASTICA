import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import CadastroVisitantesView from '../components/recepcao/CadastroVisitantesView';
import HistoricoVisitantesView from '../components/recepcao/HistoricoVisitantesView';
import AvisosView from '../components/recepcao/AvisosView';
import ThemeToggle from '../components/common/ThemeToggle';

type ActiveView = 'dashboard' | 'cadastro' | 'historico' | 'avisos';

const RecepcaoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [stats, setStats] = useState({
    total: 0,
    aguardando: 0,
    visitados: 0,
    novosMembros: 0
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas dos visitantes
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar todos os visitantes
      const { data: visitantes, error } = await supabase
        .from('visitantes')
        .select('*');

      if (error) {
        console.error('Erro ao carregar visitantes:', error);
        return;
      }

      if (visitantes) {
        const statsData = {
          total: visitantes.length,
          aguardando: visitantes.filter(v => v.status === 'Aguardando').length,
          visitados: visitantes.filter(v => v.status === 'Visitado').length,
          novosMembros: visitantes.filter(v => v.status === 'Novo Membro').length
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Recarregar dados quando voltar para o dashboard
  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    loadStats(); // Recarregar estatísticas
  };

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'cadastro':
        return <CadastroVisitantesView onBack={handleBackToDashboard} />;
      case 'historico':
        return <HistoricoVisitantesView onBack={handleBackToDashboard} />;
      case 'avisos':
        return <AvisosView onBack={handleBackToDashboard} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Toggle de Tema */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">Dashboard de Recepção</h1>
                <p className="text-slate-400 text-lg mt-1">Gestão de visitantes e agendamentos</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-2 py-1 rounded bg-cyan-400 text-slate-900 text-xs font-bold">AI</div>
                <ThemeToggle />
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>

            {/* Dashboard de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cadastro de Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Cadastro de Visitantes</h2>
                    <p className="text-slate-400 text-sm">Novos visitantes</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Cadastrar novos visitantes com informações completas, incluindo tipo, status e observações.
                </p>
                <button 
                  onClick={() => setActiveView('cadastro')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Cadastrar Visitante
                </button>
              </div>

              {/* Histórico de Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Histórico de Visitantes</h2>
                    <p className="text-slate-400 text-sm">Consulta e gestão</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Visualizar, filtrar e gerenciar todos os visitantes cadastrados no sistema.
                </p>
                <button 
                  onClick={() => setActiveView('historico')}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Ver Histórico
                </button>
              </div>

              {/* Gerenciar Avisos */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 5.882V19.24a1 1 0 01-1.447.894L5.618 18H2a1 1 0 01-1-1V7a1 1 0 011-1h3.618l3.935-2.134A1 1 0 0111 4.76v1.122zM13 7.22a6.025 6.025 0 010 9.56v-2.128a4 4 0 000-5.304V7.22zm3-2.594a10.025 10.025 0 010 14.748v-2.009a8 8 0 000-10.73V4.626z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Gerenciar Avisos</h2>
                    <p className="text-slate-400 text-sm">Dashboard pastoral</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Criar e gerenciar avisos com texto e banner para exibição na dashboard pastoral.
                </p>
                <button 
                  onClick={() => setActiveView('avisos')}
                  className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors"
                >
                  Gerenciar Avisos
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {loading ? '...' : stats.total}
                </div>
                <div className="text-slate-400 text-sm">Total Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {loading ? '...' : stats.aguardando}
                </div>
                <div className="text-slate-400 text-sm">Aguardando</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {loading ? '...' : stats.visitados}
                </div>
                <div className="text-slate-400 text-sm">Visitados</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {loading ? '...' : stats.novosMembros}
                </div>
                <div className="text-slate-400 text-sm">Novos Membros</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </main>
        );
    }
  };

  return renderContent();
};

export default RecepcaoDashboard;