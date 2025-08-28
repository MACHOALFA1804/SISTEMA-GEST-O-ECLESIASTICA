import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { DizimistaService, EstatisticasContribuicao } from '../services/dizimistaService';
import ThemeToggle from '../components/common/ThemeToggle';
import CadastroDizimistaView from '../components/dizimista/CadastroDizimistaView';
import CadastroContribuicaoView from '../components/dizimista/CadastroContribuicaoView';
import ListaDizimistasView from '../components/dizimista/ListaDizimistasView';
import RelatoriosDizimistaView from '../components/dizimista/RelatoriosDizimistaView';

type ActiveView = 'dashboard' | 'cadastro-dizimista' | 'cadastro-contribuicao' | 'lista-dizimistas' | 'relatorios';

const DizimistaDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [stats, setStats] = useState<EstatisticasContribuicao>({
    totalDizimos: 0,
    totalOfertas: 0,
    totalGeral: 0,
    ultimoMes: 0,
    mediaAnual: 0,
    totalContribuintes: 0,
    contribuicoesPorTipo: {},
    contribuicoesPorMes: []
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const estatisticas = await DizimistaService.obterEstatisticas();
      setStats(estatisticas);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Manter dados simulados em caso de erro
      setStats({
        totalDizimos: 1800.00,
        totalOfertas: 450.00,
        totalGeral: 2250.00,
        ultimoMes: 200.00,
        mediaAnual: 187.50,
        totalContribuintes: 15,
        contribuicoesPorTipo: {
          'Dízimo': 1800,
          'Oferta de Gratidão': 300,
          'Oferta Especial': 150
        },
        contribuicoesPorMes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    loadStats(); // Recarregar estatísticas
  };

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'cadastro-dizimista':
        return <CadastroDizimistaView onBack={handleBackToDashboard} />;
      case 'cadastro-contribuicao':
        return <CadastroContribuicaoView onBack={handleBackToDashboard} />;
      case 'lista-dizimistas':
        return <ListaDizimistasView onBack={handleBackToDashboard} />;
      case 'relatorios':
        return <RelatoriosDizimistaView onBack={handleBackToDashboard} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Toggle de Tema */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">Dashboard do Dizimista</h1>
                <p className="text-slate-400 text-lg mt-1">Acompanhe suas contribuições e ofertas</p>
                {user && (
                  <p className="text-cyan-400 text-sm mt-1">Bem-vindo, {user.email}</p>
                )}
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

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total de Dízimos */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2v20m5-5l-5 5-5-5m5-10V2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Total Dízimos</h3>
                    <p className="text-slate-400 text-sm">Este ano</p>
                  </div>
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-700 rounded mb-2"></div>
                  </div>
                ) : (
                  <p className="text-green-400 text-2xl font-bold">
                    R$ {stats.totalDizimos.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              {/* Total de Ofertas */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h8a2 2 0 002-2v-4m-8 6h4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Total Ofertas</h3>
                    <p className="text-slate-400 text-sm">Este ano</p>
                  </div>
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-700 rounded mb-2"></div>
                  </div>
                ) : (
                  <p className="text-blue-400 text-2xl font-bold">
                    R$ {stats.totalOfertas.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              {/* Último Mês */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Último Mês</h3>
                    <p className="text-slate-400 text-sm">Agosto 2025</p>
                  </div>
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-700 rounded mb-2"></div>
                  </div>
                ) : (
                  <p className="text-purple-400 text-2xl font-bold">
                    R$ {stats.ultimoMes.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              {/* Média Anual */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Média Mensal</h3>
                    <p className="text-slate-400 text-sm">2025</p>
                  </div>
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-700 rounded mb-2"></div>
                  </div>
                ) : (
                  <p className="text-yellow-400 text-2xl font-bold">
                    R$ {stats.mediaAnual.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </div>

            {/* Menu de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Cadastrar Dizimista */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors cursor-pointer"
                   onClick={() => setActiveView('cadastro-dizimista')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Cadastrar Dizimista</h2>
                    <p className="text-slate-400 text-sm">Novo dizimista</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Cadastrar novos dizimistas e ofertantes no sistema.
                </p>
              </div>

              {/* Registrar Contribuição */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors cursor-pointer"
                   onClick={() => setActiveView('cadastro-contribuicao')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2v20m5-5l-5 5-5-5m5-10V2"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Registrar Contribuição</h2>
                    <p className="text-slate-400 text-sm">Dízimos e ofertas</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Registrar dízimos, ofertas e outras contribuições.
                </p>
              </div>

              {/* Gerenciar Dizimistas */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors cursor-pointer"
                   onClick={() => setActiveView('lista-dizimistas')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="m22 21-3-3m0 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Gerenciar Dizimistas</h2>
                    <p className="text-slate-400 text-sm">Lista e edição</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Visualizar e gerenciar todos os dizimistas cadastrados.
                </p>
              </div>

              {/* Relatórios */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors cursor-pointer"
                   onClick={() => setActiveView('relatorios')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Relatórios</h2>
                    <p className="text-slate-400 text-sm">PDF e CSV</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Gerar relatórios detalhados de contribuições e dizimistas.
                </p>
              </div>
            </div>

            {/* Seções Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Histórico de Contribuições */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Histórico de Contribuições</h2>
                    <p className="text-slate-400 text-sm">Últimas contribuições registradas</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Exemplo de contribuições - substituir por dados reais */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="text-white font-medium">Dízimo - Agosto 2025</p>
                      <p className="text-slate-400 text-sm">15/08/2025</p>
                    </div>
                    <p className="text-green-400 font-bold">R$ 200,00</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="text-white font-medium">Oferta de Gratidão</p>
                      <p className="text-slate-400 text-sm">08/08/2025</p>
                    </div>
                    <p className="text-blue-400 font-bold">R$ 50,00</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="text-white font-medium">Dízimo - Julho 2025</p>
                      <p className="text-slate-400 text-sm">15/07/2025</p>
                    </div>
                    <p className="text-green-400 font-bold">R$ 180,00</p>
                  </div>
                </div>
              </div>

              {/* Estatísticas Detalhadas */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Estatísticas Detalhadas</h2>
                    <p className="text-slate-400 text-sm">Análise das contribuições</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <h3 className="text-white font-medium mb-2">Total de Contribuintes</h3>
                    <p className="text-cyan-400 text-2xl font-bold">{stats.totalContribuintes}</p>
                    <p className="text-slate-400 text-sm">Pessoas que contribuíram este ano</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <h3 className="text-white font-medium mb-2">Contribuições por Tipo</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.contribuicoesPorTipo).map(([tipo, valor]) => (
                        <div key={tipo} className="flex justify-between">
                          <span className="text-slate-300 text-sm">{tipo}</span>
                          <span className="text-cyan-400 text-sm font-medium">
                            R$ {valor.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Versículo Inspiracional */}
            <div className="mt-8 text-center">
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
                <p className="text-slate-300 text-lg italic mb-2">
                  "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; 
                  porque Deus ama ao que dá com alegria."
                </p>
                <p className="text-cyan-400 text-sm">2 Coríntios 9:7</p>
              </div>
            </div>
          </main>
        );
    }
  };

  return renderContent();
};

export default DizimistaDashboard;


