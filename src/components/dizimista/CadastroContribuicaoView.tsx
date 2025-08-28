import React, { useState, useEffect } from 'react';
import { DizimistaService, DizimistaRow, ContribuicaoRow } from '../../services/dizimistaService';

interface CadastroContribuicaoViewProps {
  onBack: () => void;
  onSuccess?: (contribuicao: ContribuicaoRow) => void;
  dizimistaPreSelecionado?: DizimistaRow;
}

const CadastroContribuicaoView: React.FC<CadastroContribuicaoViewProps> = ({ 
  onBack, 
  onSuccess, 
  dizimistaPreSelecionado 
}) => {
  const [contribuicao, setContribuicao] = useState<Partial<ContribuicaoRow>>({
    dizimista_id: dizimistaPreSelecionado?.id || '',
    tipo_contribuicao: 'Dízimo',
    valor: 0,
    data_contribuicao: new Date().toISOString().split('T')[0],
    forma_pagamento: 'Dinheiro',
    numero_envelope: '',
    observacoes: ''
  });
  const [dizimistas, setDizimistas] = useState<DizimistaRow[]>([]);
  const [buscaDizimista, setBuscaDizimista] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDizimistas, setLoadingDizimistas] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar dizimistas ativos
  useEffect(() => {
    carregarDizimistas();
  }, []);

  const carregarDizimistas = async () => {
    try {
      setLoadingDizimistas(true);
      const lista = await DizimistaService.listarDizimistas({ 
        status: 'Ativo',
        limite: 100 
      });
      setDizimistas(lista);
    } catch (error: any) {
      console.error('Erro ao carregar dizimistas:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar lista de dizimistas' });
    } finally {
      setLoadingDizimistas(false);
    }
  };

  const buscarDizimista = async (termo: string) => {
    if (termo.length < 2) {
      carregarDizimistas();
      return;
    }

    try {
      setLoadingDizimistas(true);
      const resultados = await DizimistaService.buscarDizimista(termo);
      setDizimistas(resultados);
    } catch (error: any) {
      console.error('Erro ao buscar dizimista:', error);
    } finally {
      setLoadingDizimistas(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContribuicao(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value
    }));
  };

  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const termo = e.target.value;
    setBuscaDizimista(termo);
    buscarDizimista(termo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!contribuicao.dizimista_id) {
      setMessage({ type: 'error', text: 'Selecione um dizimista!' });
      return;
    }

    if (!contribuicao.valor || contribuicao.valor <= 0) {
      setMessage({ type: 'error', text: 'Valor deve ser maior que zero!' });
      return;
    }

    if (!contribuicao.data_contribuicao) {
      setMessage({ type: 'error', text: 'Data da contribuição é obrigatória!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const novaContribuicao = await DizimistaService.registrarContribuicao(
        contribuicao as Omit<ContribuicaoRow, 'id' | 'created_at' | 'updated_at'>
      );
      
      setMessage({ type: 'success', text: 'Contribuição registrada com sucesso!' });
      
      // Limpar formulário após sucesso
      setContribuicao({
        dizimista_id: dizimistaPreSelecionado?.id || '',
        tipo_contribuicao: 'Dízimo',
        valor: 0,
        data_contribuicao: new Date().toISOString().split('T')[0],
        forma_pagamento: 'Dinheiro',
        numero_envelope: '',
        observacoes: ''
      });

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(novaContribuicao);
      }

    } catch (error: any) {
      console.error('Erro ao registrar contribuição:', error);
      setMessage({ type: 'error', text: `Erro ao registrar contribuição: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const dizimistasSelecionaveis = dizimistas.filter(d => 
    d.nome?.toLowerCase().includes(buscaDizimista.toLowerCase()) ||
    d.telefone?.includes(buscaDizimista)
  );

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
            <h1 className="text-white text-2xl font-bold">Registrar Contribuição</h1>
            <p className="text-slate-400 text-sm">Cadastrar dízimo ou oferta</p>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2v20m5-5l-5 5-5-5m5-10V2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Registrar Nova Contribuição</h2>
            <p className="text-slate-400 text-sm">Preencha os dados da contribuição abaixo</p>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Dizimista */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Dizimista/Ofertante *
            </label>
            {!dizimistaPreSelecionado && (
              <div className="mb-2">
                <input
                  type="text"
                  value={buscaDizimista}
                  onChange={handleBuscaChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="Buscar por nome ou telefone..."
                />
              </div>
            )}
            <select
              name="dizimista_id"
              value={contribuicao.dizimista_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              required
              disabled={!!dizimistaPreSelecionado}
            >
              <option value="">Selecione um dizimista</option>
              {dizimistasSelecionaveis.map((dizimista) => (
                <option key={dizimista.id} value={dizimista.id}>
                  {dizimista.nome} {dizimista.telefone ? `- ${dizimista.telefone}` : ''}
                </option>
              ))}
            </select>
            {loadingDizimistas && (
              <p className="text-slate-400 text-xs mt-1">Carregando dizimistas...</p>
            )}
          </div>

          {/* Tipo e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Contribuição */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Tipo de Contribuição *
              </label>
              <select
                name="tipo_contribuicao"
                value={contribuicao.tipo_contribuicao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              >
                <option value="Dízimo">Dízimo</option>
                <option value="Oferta de Gratidão">Oferta de Gratidão</option>
                <option value="Oferta Especial">Oferta Especial</option>
                <option value="Missões">Missões</option>
                <option value="Construção">Construção</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                name="valor"
                value={contribuicao.valor}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Data e Forma de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data da Contribuição */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Data da Contribuição *
              </label>
              <input
                type="date"
                name="data_contribuicao"
                value={contribuicao.data_contribuicao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Forma de Pagamento
              </label>
              <select
                name="forma_pagamento"
                value={contribuicao.forma_pagamento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Transferência">Transferência</option>
                <option value="Cheque">Cheque</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Número do Envelope */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Número do Envelope
            </label>
            <input
              type="text"
              name="numero_envelope"
              value={contribuicao.numero_envelope}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Ex: ENV001, 123, etc."
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={contribuicao.observacoes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Informações adicionais sobre a contribuição"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg shadow-md shadow-yellow-500/30 hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Contribuição'}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-500 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CadastroContribuicaoView;

