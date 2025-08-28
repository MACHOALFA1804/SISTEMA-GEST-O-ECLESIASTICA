import React, { useState, useEffect } from 'react';
import { DizimistaService, DizimistaRow } from '../../services/dizimistaService';
import { DizimistaReportService } from '../../services/dizimistaReportService';

interface RelatoriosDizimistaViewProps {
  onBack: () => void;
}

const RelatoriosDizimistaView: React.FC<RelatoriosDizimistaViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [dizimistas, setDizimistas] = useState<DizimistaRow[]>([]);
  const [configRelatorio, setConfigRelatorio] = useState({
    tipo: 'contribuicoes',
    periodo: {
      inicio: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      fim: new Date().toISOString().split('T')[0]
    },
    filtros: {
      tipo_contribuicao: '',
      dizimista_id: '',
      forma_pagamento: '',
      status_dizimista: ''
    }
  });

  useEffect(() => {
    carregarDizimistas();
  }, []);

  const carregarDizimistas = async () => {
    try {
      const lista = await DizimistaService.listarDizimistas({ 
        status: 'Ativo',
        limite: 200 
      });
      setDizimistas(lista);
    } catch (error) {
      console.error('Erro ao carregar dizimistas:', error);
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('periodo.')) {
      const campo = name.split('.')[1];
      setConfigRelatorio(prev => ({
        ...prev,
        periodo: {
          ...prev.periodo,
          [campo]: value
        }
      }));
    } else if (name.startsWith('filtros.')) {
      const campo = name.split('.')[1];
      setConfigRelatorio(prev => ({
        ...prev,
        filtros: {
          ...prev.filtros,
          [campo]: value
        }
      }));
    } else {
      setConfigRelatorio(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const gerarRelatorioPDF = async () => {
    try {
      setLoading(true);

      if (configRelatorio.tipo === 'contribuicoes') {
        const filtros: any = {};
        if (configRelatorio.filtros.tipo_contribuicao) {
          filtros.tipo_contribuicao = configRelatorio.filtros.tipo_contribuicao;
        }
        if (configRelatorio.filtros.dizimista_id) {
          filtros.dizimista_id = configRelatorio.filtros.dizimista_id;
        }
        if (configRelatorio.filtros.forma_pagamento) {
          filtros.forma_pagamento = configRelatorio.filtros.forma_pagamento;
        }

        await DizimistaReportService.gerarRelatorioContribuicoesPDF(
          configRelatorio.periodo,
          filtros
        );
      } else if (configRelatorio.tipo === 'dizimistas') {
        const filtros: any = {};
        if (configRelatorio.filtros.status_dizimista) {
          filtros.status = configRelatorio.filtros.status_dizimista;
        }

        await DizimistaReportService.gerarRelatorioDizimistasPDF(filtros);
      } else if (configRelatorio.tipo === 'consolidado') {
        await DizimistaReportService.gerarRelatorioConsolidadoPDF(configRelatorio.periodo);
      }

      alert('Relatório gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      alert(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const gerarCSV = async () => {
    try {
      setLoading(true);

      if (configRelatorio.tipo === 'contribuicoes') {
        const filtros: any = {
          data_inicio: configRelatorio.periodo.inicio,
          data_fim: configRelatorio.periodo.fim
        };
        
        if (configRelatorio.filtros.tipo_contribuicao) {
          filtros.tipo_contribuicao = configRelatorio.filtros.tipo_contribuicao;
        }
        if (configRelatorio.filtros.dizimista_id) {
          filtros.dizimista_id = configRelatorio.filtros.dizimista_id;
        }

        const contribuicoes = await DizimistaService.listarContribuicoes(filtros);
        const csvContent = DizimistaReportService.gerarCSVContribuicoes(contribuicoes);
        
        // Download do CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contribuicoes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      } else if (configRelatorio.tipo === 'dizimistas') {
        const filtros: any = {};
        if (configRelatorio.filtros.status_dizimista) {
          filtros.status = configRelatorio.filtros.status_dizimista;
        }

        const dizimistasData = await DizimistaService.listarDizimistas(filtros);
        const csvContent = DizimistaReportService.gerarCSVDizimistas(dizimistasData);
        
        // Download do CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dizimistas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }

      alert('CSV gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar CSV:', error);
      alert(`Erro ao gerar CSV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Relatórios de Dizimistas</h1>
            <p className="text-slate-400 text-sm">Gerar relatórios de contribuições e dizimistas</p>
          </div>
        </div>
      </div>

      {/* Configuração do Relatório */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Configurar Relatório</h2>
            <p className="text-slate-400 text-sm">Selecione o tipo e configure os filtros</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tipo de Relatório */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Tipo de Relatório
            </label>
            <select
              name="tipo"
              value={configRelatorio.tipo}
              onChange={handleConfigChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            >
              <option value="contribuicoes">Relatório de Contribuições</option>
              <option value="dizimistas">Relatório de Dizimistas</option>
              <option value="consolidado">Relatório Consolidado</option>
            </select>
          </div>

          {/* Período (para contribuições e consolidado) */}
          {(configRelatorio.tipo === 'contribuicoes' || configRelatorio.tipo === 'consolidado') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  name="periodo.inicio"
                  value={configRelatorio.periodo.inicio}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  name="periodo.fim"
                  value={configRelatorio.periodo.fim}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Filtros específicos para contribuições */}
          {configRelatorio.tipo === 'contribuicoes' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Tipo de Contribuição
                </label>
                <select
                  name="filtros.tipo_contribuicao"
                  value={configRelatorio.filtros.tipo_contribuicao}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  <option value="">Todos os tipos</option>
                  <option value="Dízimo">Dízimo</option>
                  <option value="Oferta de Gratidão">Oferta de Gratidão</option>
                  <option value="Oferta Especial">Oferta Especial</option>
                  <option value="Missões">Missões</option>
                  <option value="Construção">Construção</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Dizimista Específico
                </label>
                <select
                  name="filtros.dizimista_id"
                  value={configRelatorio.filtros.dizimista_id}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  <option value="">Todos os dizimistas</option>
                  {dizimistas.map((dizimista) => (
                    <option key={dizimista.id} value={dizimista.id}>
                      {dizimista.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Forma de Pagamento
                </label>
                <select
                  name="filtros.forma_pagamento"
                  value={configRelatorio.filtros.forma_pagamento}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  <option value="">Todas as formas</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          )}

          {/* Filtros específicos para dizimistas */}
          {configRelatorio.tipo === 'dizimistas' && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Status do Dizimista
              </label>
              <select
                name="filtros.status_dizimista"
                value={configRelatorio.filtros.status_dizimista}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Gerar Relatório</h2>
            <p className="text-slate-400 text-sm">Escolha o formato de saída</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={gerarRelatorioPDF}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-md shadow-red-500/30 hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            {loading ? 'Gerando PDF...' : 'Gerar PDF'}
          </button>

          {configRelatorio.tipo !== 'consolidado' && (
            <button
              onClick={gerarCSV}
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md shadow-green-500/30 hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              {loading ? 'Gerando CSV...' : 'Gerar CSV'}
            </button>
          )}
        </div>

        {/* Informações sobre os relatórios */}
        <div className="mt-6 p-4 rounded-lg bg-slate-700/30 border border-slate-600">
          <h3 className="text-white font-medium mb-2">Sobre os Relatórios:</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• <strong>Relatório de Contribuições:</strong> Lista todas as contribuições do período com detalhes dos dizimistas</li>
            <li>• <strong>Relatório de Dizimistas:</strong> Lista todos os dizimistas cadastrados com suas informações</li>
            <li>• <strong>Relatório Consolidado:</strong> Análise completa com estatísticas, top contribuintes e análise temporal</li>
            <li>• <strong>PDF:</strong> Relatório formatado para impressão com gráficos e estatísticas</li>
            <li>• <strong>CSV:</strong> Dados em formato de planilha para análise externa</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default RelatoriosDizimistaView;

