import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/common/ThemeToggle";
import AgendamentoVisitasView from "../components/pastor/AgendamentoVisitasView";
import EnvioMensagensView from "../components/pastor/EnvioMensagensView";
import DadosVisitantesView from "../components/pastor/DadosVisitantesView";
import RelatoriosView from "../components/pastor/RelatoriosView";
import AvisosDisplay from "../components/pastor/AvisosDisplay";

type ActiveView =
  | "dashboard"
  | "dados"
  | "agendamento"
  | "mensagens"
  | "relatorios";

interface DashboardCard {
  id: ActiveView;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  iconPath: string;
  bgColor: string;
  textColor: string;
  shadowColor: string;
  hoverColor: string;
}

interface StatsType {
  totalVisitantes: number;
  novosMembros: number;
  emDiscipulado: number;
  cultosRealizados: number;
}

interface StatCard {
  value: number;
  label: string;
  color: string;
  key: keyof StatsType;
}

const PastorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [stats, setStats] = useState<StatsType>({
    totalVisitantes: 0,
    novosMembros: 0,
    emDiscipulado: 0,
    cultosRealizados: 0,
  });
  const [loading, setLoading] = useState(false);

  // Configuração dos cards do dashboard
  const dashboardCards: DashboardCard[] = [
    {
      id: "dados",
      title: "Dados dos Visitantes",
      subtitle: "Atualização automática",
      description:
        "Visualize e gerencie informações completas dos visitantes cadastrados.",
      buttonText: "Acessar Dados",
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-300",
      shadowColor: "shadow-blue-500/30",
      hoverColor: "hover:bg-blue-300",
    },
    {
      id: "agendamento",
      title: "Agendamento de Visitas",
      subtitle: "Tempo real",
      description:
        "Agende, acompanhe e gerencie visitas pastorais em tempo real.",
      buttonText: "Acessar Agendamento",
      iconPath:
        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      bgColor: "bg-green-500/20",
      textColor: "text-green-300",
      shadowColor: "shadow-green-500/30",
      hoverColor: "hover:bg-green-300",
    },
    {
      id: "mensagens",
      title: "Mensagens e Comunicação",
      subtitle: "Notificações live",
      description: "Sistema de mensagens e comunicação com os visitantes.",
      buttonText: "Acessar Mensagens",
      iconPath:
        "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-300",
      shadowColor: "shadow-purple-500/30",
      hoverColor: "hover:bg-purple-300",
    },
    {
      id: "relatorios",
      title: "Relatórios e Análises",
      subtitle: "Dados atualizados",
      description: "Relatórios detalhados e análises do ministério pastoral.",
      buttonText: "Acessar Relatórios",
      iconPath:
        "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-300",
      shadowColor: "shadow-emerald-500/30",
      hoverColor: "hover:bg-emerald-300",
    },
  ];

  // Configuração das estatísticas
  const statCards: StatCard[] = [
    {
      value: stats.totalVisitantes,
      label: "Total Visitantes",
      color: "text-blue-400",
      key: "totalVisitantes",
    },
    {
      value: stats.novosMembros,
      label: "Novos Membros",
      color: "text-green-400",
      key: "novosMembros",
    },
    {
      value: stats.emDiscipulado,
      label: "Em Discipulado",
      color: "text-purple-400",
      key: "emDiscipulado",
    },
    {
      value: stats.cultosRealizados,
      label: "Cultos Realizados",
      color: "text-emerald-400",
      key: "cultosRealizados",
    },
  ];

  // Carregar estatísticas pastorais
  const loadStats = useCallback(async () => {
    setLoading(true);

    try {
      const [visitantesResponse, visitasResponse] = await Promise.all([
        supabase.from("visitantes").select("*"),
        supabase.from("visitas").select("*"),
      ]);

      if (visitantesResponse.data) {
        const visitantes = visitantesResponse.data;
        const visitas = visitasResponse.data || [];

        const statsData = {
          totalVisitantes: visitantes.length,
          novosMembros: visitantes.filter((v) => v.status === "Novo Membro")
            .length,
          emDiscipulado: visitantes.filter((v) => v.status === "Visitado")
            .length,
          cultosRealizados: visitas.filter((v) => v.status === "Realizada")
            .length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Configurar escuta em tempo real do Supabase
  useEffect(() => {
    loadStats();

    // Configurar subscriptions em tempo real
    const subscriptions = [
      {
        channel: "visitantes-changes",
        table: "visitantes",
      },
      {
        channel: "visitas-changes",
        table: "visitas",
      },
    ].map(({ channel, table }) =>
      supabase
        .channel(channel)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
          },
          (payload) => {
            console.log(`Mudança detectada na tabela ${table}:`, payload);
            loadStats();
          }
        )
        .subscribe()
    );

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [loadStats]);

  // Handlers
  const handleBackToDashboard = () => {
    setActiveView("dashboard");
    loadStats();
  };

  const handleCardClick = (viewId: ActiveView) => {
    setActiveView(viewId);
  };

  // Componente reutilizável para cards do dashboard
  const DashboardCardComponent: React.FC<{ card: DashboardCard }> = ({
    card,
  }) => (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${card.bgColor} ${card.textColor} grid place-items-center`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d={card.iconPath} />
          </svg>
        </div>
        <div>
          <h2 className="text-white text-xl font-semibold">{card.title}</h2>
          <p className="text-slate-400 text-sm">{card.subtitle}</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-4">{card.description}</p>
      <button
        onClick={() => handleCardClick(card.id)}
        className={`w-full px-4 py-3 rounded-lg ${card.bgColor.replace(
          "/20",
          "-400"
        )} text-slate-900 font-bold shadow-md ${card.shadowColor} ${
          card.hoverColor
        } transition-colors`}
      >
        {card.buttonText}
      </button>
    </div>
  );

  // Componente reutilizável para estatísticas
  const StatCardComponent: React.FC<{ stat: StatCard }> = ({ stat }) => (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center relative">
      {loading && (
        <div
          className={`absolute top-2 right-2 w-2 h-2 ${stat.color.replace(
            "text-",
            "bg-"
          )} rounded-full animate-pulse`}
        ></div>
      )}
      <div className={`text-2xl font-bold ${stat.color}`}>
        {loading ? "..." : stat.value}
      </div>
      <div className="text-slate-400 text-sm">{stat.label}</div>
    </div>
  );

  // Renderizar view baseado na seleção
  const renderContent = () => {
    const viewComponents = {
      dados: <DadosVisitantesView onBack={handleBackToDashboard} />,
      agendamento: <AgendamentoVisitasView onBack={handleBackToDashboard} />,
      mensagens: <EnvioMensagensView onBack={handleBackToDashboard} />,
      relatorios: <RelatoriosView onBack={handleBackToDashboard} />,
    };

    if (activeView !== "dashboard") {
      return viewComponents[activeView];
    }

    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header com Toggle de Tema */}
        <div className="mb-6">
          {/* LINHA 1: Título + Versículo */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white text-3xl font-bold">
              Dashboard Pastoral
            </h1>
            
            {/* Versículo na mesma linha do título */}
            <div className="px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-300 text-sm italic">
                "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor" 
              </span>
              <span className="text-cyan-400 text-xs font-semibold ml-2">
                - Colossenses 3:23
              </span>
            </div>
          </div>

          {/* LINHA 2: Subtítulo + Botões */}
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-lg">
              Sincronização em tempo real ativado 🔴
            </p>
            
            {/* Botões na segunda linha */}
            <div className="flex items-center gap-4">
              <div className="px-2 py-1 rounded bg-green-400 text-slate-900 text-xs font-bold">
                LIVE
              </div>
              <ThemeToggle />
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Avisos - Tempo Real */}
        <div className="mb-8">
          <AvisosDisplay />
        </div>

        {/* Dashboard de Navegação - Dados atualizados em tempo real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <DashboardCardComponent key={index} card={card} />
          ))}
        </div>

        {/* Estatísticas Rápidas - atualizadas em tempo real */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCardComponent key={index} stat={stat} />
          ))}
        </div>

        <footer className="text-center text-cyan-400 text-xs mt-10">
          DEV EMERSON 2025 - Sincronização em Tempo Real Ativada
        </footer>
      </main>
    );
  };

  return renderContent();
};

export default PastorDashboard;