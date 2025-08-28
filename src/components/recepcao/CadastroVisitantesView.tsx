import React, { useState } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface CadastroVisitantesViewProps {
  onBack: () => void;
}

const CadastroVisitantesView: React.FC<CadastroVisitantesViewProps> = ({ onBack }) => {
  const [visitante, setVisitante] = useState<Partial<VisitanteRow>>({
    nome: '',
    telefone: '',
    tipo: 'Cristão',
    status: 'Aguardando',
    quem_acompanha: '',
    congregacao_origem: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVisitante(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!visitante.nome || !visitante.telefone) {
      setMessage({ type: 'error', text: 'Nome e Telefone são campos obrigatórios!' });
      return;
    }

    // Validação do telefone (apenas números)
    const telefoneRegex = /^[0-9]+$/;
    if (!telefoneRegex.test(visitante.telefone || '')) {
      setMessage({ type: 'error', text: 'Telefone deve conter apenas números!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('visitantes')
        .insert([visitante]);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Visitante cadastrado com sucesso!' });
      
      // Limpar formulário após sucesso
      setVisitante({
        nome: '',
        telefone: '',
        tipo: 'Cristão',
        status: 'Aguardando',
        quem_acompanha: '',
        congregacao_origem: '',
        observacoes: ''
      });

    } catch (error: any) {
      console.error('Erro ao cadastrar visitante:', error);
      setMessage({ type: 'error', text: `Erro ao cadastrar visitante: ${error.message}` });
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
            <h1 className="text-white text-2xl font-bold">Cadastro de Visitantes</h1>
            <p className="text-slate-400 text-sm">Registrar novos visitantes na igreja</p>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Cadastrar Novo Visitante</h2>
            <p className="text-slate-400 text-sm">Preencha os dados do visitante abaixo</p>
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
                value={visitante.nome}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                name="telefone"
                value={visitante.telefone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="11999999999"
                required
              />
            </div>
          </div>

          {/* Campos secundários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Tipo de Visitante
              </label>
              <select
                name="tipo"
                value={visitante.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="Cristão">Cristão</option>
                <option value="Não Cristão">Não Cristão</option>
                <option value="Pregador">Pregador</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Status
              </label>
              <select
                name="status"
                value={visitante.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="Aguardando">Aguardando</option>
                <option value="Aguardando Visita">Aguardando Visita</option>
                <option value="Visitado">Visitado</option>
                <option value="Novo Membro">Novo Membro</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* Campos adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quem Acompanha */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Quem Acompanha
              </label>
              <input
                type="text"
                name="quem_acompanha"
                value={visitante.quem_acompanha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="Nome de quem acompanha"
              />
            </div>

            {/* Congregação de Origem */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Congregação de Origem
              </label>
              <input
                type="text"
                name="congregacao_origem"
                value={visitante.congregacao_origem}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="Nome da congregação"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={visitante.observacoes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Informações adicionais sobre o visitante"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-cyan-400 text-slate-900 font-bold rounded-lg shadow-md shadow-cyan-500/30 hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Visitante'}
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

export default CadastroVisitantesView;
