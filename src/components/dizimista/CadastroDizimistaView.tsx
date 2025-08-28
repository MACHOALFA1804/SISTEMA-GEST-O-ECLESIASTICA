import React, { useState } from 'react';
import { DizimistaService, DizimistaRow } from '../../services/dizimistaService';

interface CadastroDizimistaViewProps {
  onBack: () => void;
  onSuccess?: (dizimista: DizimistaRow) => void;
}

const CadastroDizimistaView: React.FC<CadastroDizimistaViewProps> = ({ onBack, onSuccess }) => {
  const [dizimista, setDizimista] = useState<Partial<DizimistaRow>>({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    data_nascimento: '',
    profissao: '',
    status: 'Ativo',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDizimista(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!dizimista.nome?.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório!' });
      return;
    }

    // Validação do telefone (se preenchido)
    if (dizimista.telefone && !/^[0-9\s\-\(\)]+$/.test(dizimista.telefone)) {
      setMessage({ type: 'error', text: 'Telefone deve conter apenas números!' });
      return;
    }

    // Validação do email (se preenchido)
    if (dizimista.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dizimista.email)) {
      setMessage({ type: 'error', text: 'Email deve ter um formato válido!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const novoDizimista = await DizimistaService.criarDizimista(dizimista as Omit<DizimistaRow, 'id' | 'created_at' | 'updated_at'>);
      
      setMessage({ type: 'success', text: 'Dizimista cadastrado com sucesso!' });
      
      // Limpar formulário após sucesso
      setDizimista({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        data_nascimento: '',
        profissao: '',
        status: 'Ativo',
        observacoes: ''
      });

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(novoDizimista);
      }

    } catch (error: any) {
      console.error('Erro ao cadastrar dizimista:', error);
      setMessage({ type: 'error', text: `Erro ao cadastrar dizimista: ${error.message}` });
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
            <h1 className="text-white text-2xl font-bold">Cadastro de Dizimista</h1>
            <p className="text-slate-400 text-sm">Registrar novo dizimista/ofertante</p>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Cadastrar Novo Dizimista</h2>
            <p className="text-slate-400 text-sm">Preencha os dados do dizimista/ofertante abaixo</p>
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
          {/* Campos principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={dizimista.nome}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={dizimista.telefone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Email e Data de Nascimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={dizimista.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="email@exemplo.com"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="data_nascimento"
                value={dizimista.data_nascimento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Profissão e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profissão */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Profissão
              </label>
              <input
                type="text"
                name="profissao"
                value={dizimista.profissao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="Profissão do dizimista"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Status
              </label>
              <select
                name="status"
                value={dizimista.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={dizimista.endereco}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Endereço completo"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={dizimista.observacoes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Informações adicionais sobre o dizimista"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-green-400 text-slate-900 font-bold rounded-lg shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Dizimista'}
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

export default CadastroDizimistaView;

