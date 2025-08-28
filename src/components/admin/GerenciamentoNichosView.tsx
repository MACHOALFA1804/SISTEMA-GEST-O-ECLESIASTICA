import React, { useState, useEffect } from "react";

// Simulando o AdminService e NichoMercado para demonstração
const AdminService = {
  obterNichos: async () => [
    {
      id: "1",
      nome: "Igreja Evangélica",
      descricao: "Sistema adaptado para igrejas e comunidades religiosas",
      icone: "church",
      configuracoes: {
        nome_sistema: "ChurchManager Pro",
        cores: { primary: "#6366f1", secondary: "#1e293b" },
        modulos: ["membros", "dizimos", "eventos", "ministerios"],
        textos_especificos: { cliente: "membro", produto: "evento" },
      },
    },
    {
      id: "2",
      nome: "Pizzaria",
      descricao: "Solução completa para pizzarias e restaurantes",
      icone: "pizza",
      configuracoes: {
        nome_sistema: "PizzaPoint System",
        cores: { primary: "#ef4444", secondary: "#0f172a" },
        modulos: ["pedidos", "cardapio", "delivery", "estoque"],
        textos_especificos: { cliente: "cliente", produto: "pizza" },
      },
    },
    {
      id: "3",
      nome: "Academia",
      descricao: "Gestão completa para academias e centros de fitness",
      icone: "dumbbell",
      configuracoes: {
        nome_sistema: "FitManager Pro",
        cores: { primary: "#22c55e", secondary: "#0f172a" },
        modulos: ["alunos", "treinos", "financeiro", "equipamentos"],
        textos_especificos: { cliente: "aluno", produto: "plano" },
      },
    },
    {
      id: "4",
      nome: "Escola",
      descricao: "Sistema educacional para escolas e instituições de ensino",
      icone: "graduation-cap",
      configuracoes: {
        nome_sistema: "EduSystem Plus",
        cores: { primary: "#3b82f6", secondary: "#1e293b" },
        modulos: ["alunos", "professores", "turmas", "notas"],
        textos_especificos: { cliente: "aluno", produto: "curso" },
      },
    },
    {
      id: "5",
      nome: "Clínica Médica",
      descricao: "Gestão para clínicas e consultórios médicos",
      icone: "stethoscope",
      configuracoes: {
        nome_sistema: "MediClinic System",
        cores: { primary: "#06b6d4", secondary: "#0f172a" },
        modulos: ["pacientes", "consultas", "prontuarios", "agenda"],
        textos_especificos: { cliente: "paciente", produto: "consulta" },
      },
    },
    {
      id: "6",
      nome: "Loja de Varejo",
      descricao: "Solução completa para lojas e comércio em geral",
      icone: "store",
      configuracoes: {
        nome_sistema: "RetailMax Pro",
        cores: { primary: "#f59e0b", secondary: "#1e293b" },
        modulos: ["produtos", "vendas", "estoque", "clientes"],
        textos_especificos: { cliente: "cliente", produto: "produto" },
      },
    },
  ],
  aplicarNicho: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Nicho ${id} aplicado com sucesso!`);
  },
};

interface NichoMercado {
  id?: string;
  nome: string;
  descricao: string;
  icone?: string;
  configuracoes?: any;
}

// Componente do Modal de Confirmação
interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  details?: string[];
  type?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  details = [],
  type = "warning",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-500/20",
          iconColor: "text-red-300",
          confirmBg: "bg-red-500 hover:bg-red-400",
          border: "border-red-500/30",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-500/20",
          iconColor: "text-yellow-300",
          confirmBg: "bg-yellow-500 hover:bg-yellow-400",
          border: "border-yellow-500/30",
        };
      case "info":
        return {
          iconBg: "bg-blue-500/20",
          iconColor: "text-blue-300",
          confirmBg: "bg-blue-500 hover:bg-blue-400",
          border: "border-blue-500/30",
        };
    }
  };

  const styles = getTypeStyles();

  const defaultIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="m12 17 .01 0" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-cyan-500/30 shadow-xl shadow-black/40 w-full max-w-md">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${styles.iconBg} ${styles.iconColor} grid place-items-center flex-shrink-0`}
            >
              {icon || defaultIcon}
            </div>
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div className="px-6 pb-4">
            <div
              className={`rounded-lg border ${styles.border} bg-slate-900/40 p-4`}
            >
              <div className="text-slate-300 text-sm space-y-2">
                <p className="font-medium mb-3">Esta ação irá:</p>
                <ul className="space-y-1">
                  {details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`${styles.iconColor} mt-0.5`}>•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${styles.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal
interface GerenciamentoNichosViewProps {
  onBack: () => void;
}

const GerenciamentoNichosView: React.FC<GerenciamentoNichosViewProps> = ({
  onBack,
}) => {
  const [nichos, setNichos] = useState<NichoMercado[]>([]);
  const [loading, setLoading] = useState(true);
  const [aplicando, setAplicando] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<NichoMercado | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // Estado para o modal de confirmação
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    nicho?: NichoMercado;
  }>({ show: false });

  useEffect(() => {
    carregarNichos();
  }, []);

  const carregarNichos = async () => {
    try {
      setLoading(true);
      const lista = await AdminService.obterNichos();
      setNichos(lista);
    } catch (error: any) {
      console.error("Erro ao carregar nichos:", error);
      setMessage({ type: "error", text: "Erro ao carregar nichos de mercado" });
    } finally {
      setLoading(false);
    }
  };

  // Função que abre o modal de confirmação
  const aplicarNicho = async (nicho: NichoMercado) => {
    setConfirmModal({ show: true, nicho });
  };

  // Função que executa a aplicação após confirmação
  const handleConfirmApply = async () => {
    const { nicho } = confirmModal;
    if (!nicho) return;

    try {
      setAplicando(nicho.id!);
      await AdminService.aplicarNicho(nicho.id!);

      setMessage({
        type: "success",
        text: `Nicho "${nicho.nome}" aplicado com sucesso! Recarregue a página para ver as mudanças.`,
      });
    } catch (error: any) {
      console.error("Erro ao aplicar nicho:", error);
      setMessage({
        type: "error",
        text: `Erro ao aplicar nicho: ${error.message}`,
      });
    } finally {
      setAplicando(null);
      setConfirmModal({ show: false });
    }
  };

  const getIconeNicho = (icone?: string) => {
    switch (icone) {
      case "church":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3 3v2h2v2h2v13H5V9h2V7h2V5l3-3z" />
            <path d="M12 8v4m-2-2h4" />
          </svg>
        );
      case "pizza":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1.5-1.5L10 14l1.5 1.5L13 14l1.5 1.5L16 14l1.5 1.5L16 17l-1.5-1.5L13 17l-1.5-1.5L10 17z" />
          </svg>
        );
      case "dumbbell":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
          </svg>
        );
      case "graduation-cap":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9l-11-6zM18.82 9L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
          </svg>
        );
      case "stethoscope":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.21 0-4-1.79-4-4 0-1.45.78-2.73 1.95-3.43C16.95 11.56 16 10.38 16 9V3h-2V1h6v2h-2v6c0 1.38-.95 2.56-1.95 3.57C17.22 13.27 18 14.55 18 16c0 2.21-1.79 4-4 4z" />
            <path d="M12 1H8v2H6v6c0 2.21 1.79 4 4 4s4-1.79 4-4V3h-2V1zm0 10c-1.1 0-2-.9-2-2V5h4v4c0 1.1-.9 2-2 2z" />
          </svg>
        );
      case "store":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
    }
  };

  const getCorPrimaria = (configuracoes: any) => {
    return configuracoes?.cores?.primary || "#22d3ee";
  };

  const getCorSecundaria = (configuracoes: any) => {
    return configuracoes?.cores?.secondary || "#0f172a";
  };

  const formatarModulos = (modulos: string[]) => {
    return modulos
      .map((modulo) => modulo.charAt(0).toUpperCase() + modulo.slice(1))
      .join(", ");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Nichos de Mercado</h1>
            <p className="text-slate-400 text-sm">
              Adapte o sistema para diferentes tipos de negócio
            </p>
          </div>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : message.type === "warning"
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Informações sobre nichos */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">
              O que são Nichos de Mercado?
            </h2>
            <p className="text-slate-400 text-sm">
              Configurações pré-definidas para adaptar o sistema
            </p>
          </div>
        </div>

        <div className="text-slate-300 text-sm space-y-2">
          <p>
            Os nichos de mercado permitem transformar rapidamente o sistema para
            atender diferentes tipos de negócio. Cada nicho inclui:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>
              <strong>Nome do sistema</strong> personalizado
            </li>
            <li>
              <strong>Cores e tema</strong> adequados ao segmento
            </li>
            <li>
              <strong>Módulos específicos</strong> para cada tipo de negócio
            </li>
            <li>
              <strong>Textos adaptados</strong> à terminologia do setor
            </li>
          </ul>
          <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
            <strong>⚠️ Atenção:</strong> Aplicar um nicho irá alterar
            configurações globais do sistema. Recomendamos fazer backup das
            configurações atuais antes de aplicar.
          </div>
        </div>
      </div>

      {/* Lista de Nichos */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">
              Nichos Disponíveis
            </h2>
            <p className="text-slate-400 text-sm">
              {loading
                ? "Carregando..."
                : `${nichos.length} nichos pré-configurados`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-slate-400">
              Carregando nichos de mercado...
            </div>
          </div>
        ) : nichos.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Nenhum nicho encontrado</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nichos.map((nicho) => (
              <div
                key={nicho.id}
                className="rounded-xl border border-slate-700 bg-slate-900/40 p-5 hover:border-slate-600 transition-colors"
              >
                {/* Header do card */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center text-white"
                    style={{
                      backgroundColor: `${getCorPrimaria(
                        nicho.configuracoes
                      )}20`,
                      color: getCorPrimaria(nicho.configuracoes),
                    }}
                  >
                    {getIconeNicho(nicho.icone)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{nicho.nome}</h3>
                    <p className="text-slate-400 text-sm">{nicho.descricao}</p>
                  </div>
                </div>

                {/* Preview das cores */}
                <div className="mb-4">
                  <div className="text-slate-300 text-sm font-medium mb-2">
                    Cores do tema:
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-lg border border-slate-600"
                      style={{
                        backgroundColor: getCorPrimaria(nicho.configuracoes),
                      }}
                      title="Cor primária"
                    />
                    <div
                      className="w-8 h-8 rounded-lg border border-slate-600"
                      style={{
                        backgroundColor: getCorSecundaria(nicho.configuracoes),
                      }}
                      title="Cor secundária"
                    />
                  </div>
                </div>

                {/* Informações do sistema */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-slate-400 text-xs">
                      Nome do sistema:
                    </div>
                    <div className="text-slate-300 text-sm font-medium">
                      {nicho.configuracoes?.nome_sistema || nicho.nome}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-xs">
                      Módulos inclusos:
                    </div>
                    <div className="text-slate-300 text-sm">
                      {formatarModulos(nicho.configuracoes?.modulos || [])}
                    </div>
                  </div>

                  {nicho.configuracoes?.textos_especificos && (
                    <div>
                      <div className="text-slate-400 text-xs">
                        Terminologia:
                      </div>
                      <div className="text-slate-300 text-sm">
                        {Object.entries(
                          nicho.configuracoes.textos_especificos
                        ).map(([key, value]) => (
                          <span key={key} className="inline-block mr-2">
                            {key}: <em>{value as string}</em>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(nicho)}
                    className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => aplicarNicho(nicho)}
                    disabled={aplicando === nicho.id}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        aplicando === nicho.id
                          ? "#6b7280"
                          : getCorPrimaria(nicho.configuracoes),
                    }}
                  >
                    {aplicando === nicho.id ? "Aplicando..." : "Aplicar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">
                Preview: {showPreview.nome}
              </h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Simulação do header */}
              <div
                className="rounded-lg p-4 text-white"
                style={{
                  backgroundColor: getCorSecundaria(showPreview.configuracoes),
                  borderLeft: `4px solid ${getCorPrimaria(
                    showPreview.configuracoes
                  )}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg grid place-items-center"
                    style={{
                      backgroundColor: `${getCorPrimaria(
                        showPreview.configuracoes
                      )}20`,
                      color: getCorPrimaria(showPreview.configuracoes),
                    }}
                  >
                    {getIconeNicho(showPreview.icone)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {showPreview.configuracoes?.nome_sistema ||
                        showPreview.nome}
                    </h4>
                    <p className="text-sm opacity-80">Sistema de Gestão</p>
                  </div>
                </div>
              </div>

              {/* Configurações detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">
                    Configurações do Sistema
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nome:</span>
                      <span className="text-slate-300">
                        {showPreview.configuracoes?.nome_sistema}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cor primária:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-slate-600"
                          style={{
                            backgroundColor: getCorPrimaria(
                              showPreview.configuracoes
                            ),
                          }}
                        />
                        <span className="text-slate-300">
                          {getCorPrimaria(showPreview.configuracoes)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cor secundária:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-slate-600"
                          style={{
                            backgroundColor: getCorSecundaria(
                              showPreview.configuracoes
                            ),
                          }}
                        />
                        <span className="text-slate-300">
                          {getCorSecundaria(showPreview.configuracoes)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">
                    Módulos e Terminologia
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-400">Módulos:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {showPreview.configuracoes?.modulos?.map(
                          (modulo: string) => (
                            <span
                              key={modulo}
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: `${getCorPrimaria(
                                  showPreview.configuracoes
                                )}20`,
                                color: getCorPrimaria(
                                  showPreview.configuracoes
                                ),
                              }}
                            >
                              {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {showPreview.configuracoes?.textos_especificos && (
                      <div>
                        <span className="text-slate-400">
                          Terminologia específica:
                        </span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(
                            showPreview.configuracoes.textos_especificos
                          ).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-400 capitalize">
                                {key}:
                              </span>
                              <span className="text-slate-300">
                                {value as string}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Simulação de cards */}
              <div>
                <h4 className="text-white font-medium mb-3">
                  Preview da Interface
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {showPreview.configuracoes?.modulos
                    ?.slice(0, 3)
                    .map((modulo: string) => (
                      <div
                        key={modulo}
                        className="rounded-lg p-4 border"
                        style={{
                          backgroundColor: `${getCorPrimaria(
                            showPreview.configuracoes
                          )}10`,
                          borderColor: `${getCorPrimaria(
                            showPreview.configuracoes
                          )}30`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded grid place-items-center text-xs"
                            style={{
                              backgroundColor: getCorPrimaria(
                                showPreview.configuracoes
                              ),
                              color: "white",
                            }}
                          >
                            {modulo.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium capitalize">
                            {modulo}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Módulo de {modulo} do sistema
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Botão de aplicar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowPreview(null)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowPreview(null);
                    aplicarNicho(showPreview);
                  }}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: getCorPrimaria(showPreview.configuracoes),
                  }}
                >
                  Aplicar Este Nicho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        type="warning"
        title="Aplicar Nicho de Mercado"
        message={`Tem certeza que deseja aplicar o nicho "${confirmModal.nicho?.nome}"?`}
        details={[
          "Alterar o nome do sistema",
          "Modificar as cores do tema",
          "Adaptar textos e módulos",
          "Pode afetar a experiência atual dos usuários",
        ]}
        onConfirm={handleConfirmApply}
        onCancel={() => setConfirmModal({ show: false })}
        confirmText="Aplicar Nicho"
        cancelText="Cancelar"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        }
      />
    </main>
  );
};

export default GerenciamentoNichosView;
