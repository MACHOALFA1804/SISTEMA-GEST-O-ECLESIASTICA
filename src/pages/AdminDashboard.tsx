import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/common/ThemeToggle";
import GerenciamentoUsuariosView from "../components/admin/GerenciamentoUsuariosView";
import GerenciamentoLogotiposView from "../components/admin/GerenciamentoLogotiposView";
import GerenciamentoNichosView from "../components/admin/GerenciamentoNichosView";
import PersonalizacaoSistemaView from "../components/admin/PersonalizacaoSistemaView";
import ConfiguracoesView from "../components/admin/ConfiguracoesView";
import BackupView from "../components/admin/BackupView";
import WhatsAppConfigView from "../components/admin/WhatsAppConfigView";
import { AdminService, LogAdmin } from "../services/adminService";

// Definir tipos para as estatísticas
interface AdminStats {
  usuarios: number;
  usuariosAtivos: number;
  visitantes: number;
  relatorios: number;
  mensagens: number;
  configuracoes: number;
  logotipos: number;
  nichos: number;
  ultimasAtividades: LogAdmin[];
}

type ActiveView =
  | "dashboard"
  | "usuarios"
  | "logotipos"
  | "nichos"
  | "personalizacao"
  | "configuracoes"
  | "backup"
  | "whatsapp"
  | "logs";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [stats, setStats] = useState<AdminStats>({
    usuarios: 0,
    usuariosAtivos: 0,
    visitantes: 0,
    relatorios: 0,
    mensagens: 0,
    configuracoes: 0,
    logotipos: 0,
    nichos: 0,
    ultimasAtividades: [],
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas do sistema
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar estatísticas tradicionais
      const { count: usuariosCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: visitantesCount } = await supabase
        .from("visitantes")
        .select("*", { count: "exact", head: true });

      const { count: mensagensCount } = await supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true });

      // Buscar estatísticas das novas funcionalidades
      let adminStats: {
        usuariosAdmin: number;
        usuariosAtivos: number;
        configuracoes: number;
        logotipos: number;
        nichos: number;
        ultimasAtividades: LogAdmin[];
      } = {
        usuariosAdmin: 0,
        usuariosAtivos: 0,
        configuracoes: 0,
        logotipos: 0,
        nichos: 0,
        ultimasAtividades: [],
      };

      try {
        const [usuarios, configuracoes, logotipos, nichos, logs] =
          await Promise.all([
            AdminService.obterUsuarios(),
            AdminService.obterConfiguracoes(),
            AdminService.obterLogotipos(),
            AdminService.obterNichos(),
            AdminService.obterLogs(5),
          ]);

        adminStats = {
          usuariosAdmin: usuarios.length,
          usuariosAtivos: usuarios.filter((u) => u.ativo).length,
          configuracoes: configuracoes.length,
          logotipos: logotipos.length,
          nichos: nichos.length,
          ultimasAtividades: logs,
        };
      } catch (adminError) {
        console.warn(
          "Erro ao carregar estatísticas administrativas:",
          adminError
        );
      }

      setStats({
        usuarios: usuariosCount || adminStats.usuariosAdmin,
        usuariosAtivos: adminStats.usuariosAtivos,
        visitantes: visitantesCount || 0,
        relatorios: 0,
        mensagens: mensagensCount || 0,
        configuracoes: adminStats.configuracoes,
        logotipos: adminStats.logotipos,
        nichos: adminStats.nichos,
        ultimasAtividades: adminStats.ultimasAtividades,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
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
    setActiveView("dashboard");
    loadStats(); // Recarregar estatísticas
  };

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case "usuarios":
        return <GerenciamentoUsuariosView onBack={handleBackToDashboard} />;
      case "logotipos":
        return <GerenciamentoLogotiposView onBack={handleBackToDashboard} />;
      case "nichos":
        return <GerenciamentoNichosView onBack={handleBackToDashboard} />;
      case "personalizacao":
        return <PersonalizacaoSistemaView onBack={handleBackToDashboard} />;
      case "configuracoes":
        return <ConfiguracoesView onBack={handleBackToDashboard} />;
      case "backup":
        return <BackupView onBack={handleBackToDashboard} />;
      case "whatsapp":
        return <WhatsAppConfigView onBack={handleBackToDashboard} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Toggle de Tema */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">
                  Dashboard Administrativo
                </h1>
                <p className="text-slate-400 text-lg mt-1">
                  Gerenciamento completo do sistema
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-2 py-1 rounded bg-cyan-400 text-slate-900 text-xs font-bold">
                  AI
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

            {/* Dashboard de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gerenciar Usuários */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">
                      Gerenciar Usuários
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Controle de acesso avançado
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Gerenciar usuários com permissões granulares, tipos de acesso
                  e controle completo.
                </p>
                <button
                  onClick={() => setActiveView("usuarios")}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Gerenciar Usuários
                </button>
              </div>

              {/* Personalização do Sistema */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5v10h2V3zM19 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM19 3h-2v10h2V3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">
                      Personalização
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Cores, textos e configurações
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Personalize completamente a aparência, cores, temas e textos
                  da interface.
                </p>
                <button
                  onClick={() => setActiveView("personalizacao")}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Personalizar
                </button>
              </div>

              {/* Logotipos */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-300 grid place-items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">
                      Logotipos
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Upload e gerenciamento
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Faça upload de logotipos, favicons e imagens com
                  especificações técnicas.
                </p>
                <button
                  onClick={() => setActiveView("logotipos")}
                  className="w-full px-4 py-3 rounded-lg bg-orange-400 text-slate-900 font-bold shadow-md shadow-orange-500/30 hover:bg-orange-300 transition-colors"
                >
                  Gerenciar Logotipos
                </button>
              </div>

              {/* Nichos de Mercado */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">
                      Nichos de Mercado
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Adaptar para outros negócios
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Transforme o sistema para pizzaria, academia, escola, clínica
                  e muito mais.
                </p>
                <button
                  onClick={() => setActiveView("nichos")}
                  className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors"
                >
                  Explorar Nichos
                </button>
              </div>

              {/* Configurações */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">
                      Configurações
                    </h2>
                    <p className="text-slate-400 text-sm">Sistema e igreja</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Configurar parâmetros do sistema, informações da igreja e
                  preferências.
                </p>
                <button
                  onClick={() => setActiveView("configuracoes")}
                  className="w-full px-4 py-3 rounded-lg bg-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-300 transition-colors"
                >
                  Configurações
                </button>
              </div>

              {/* WhatsApp */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">
                      WhatsApp
                    </h2>
                    <p className="text-slate-400 text-sm">Integração</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Configurar integração com WhatsApp para envio de mensagens
                  automáticas.
                </p>
                <button
                  onClick={() => setActiveView("whatsapp")}
                  className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {loading ? "..." : stats.usuarios}
                </div>
                <div className="text-slate-400 text-sm">Usuários</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {loading ? "..." : stats.visitantes}
                </div>
                <div className="text-slate-400 text-sm">Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {loading ? "..." : stats.configuracoes}
                </div>
                <div className="text-slate-400 text-sm">Configurações</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {loading ? "..." : stats.logotipos}
                </div>
                <div className="text-slate-400 text-sm">Logotipos</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {loading ? "..." : stats.nichos}
                </div>
                <div className="text-slate-400 text-sm">Nichos</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {loading ? "..." : stats.mensagens}
                </div>
                <div className="text-slate-400 text-sm">Mensagens</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">
              DEV EMERSON 2025
            </footer>
          </main>
        );
    }
  };

  return renderContent();
};

export default AdminDashboard;
