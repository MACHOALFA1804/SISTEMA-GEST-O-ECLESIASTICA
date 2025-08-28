import React, { useState, useEffect } from 'react';
import { DizimistaService, DizimistaRow } from '../../services/dizimistaService';

interface ListaDizimistasViewProps {
  onBack: () => void;
  onSelectDizimista?: (dizimista: DizimistaRow) => void;
  onEditDizimista?: (dizimista: DizimistaRow) => void;
}

const ListaDizimistasView: React.FC<ListaDizimistasViewProps> = ({ 
  onBack, 
  onSelectDizimista, 
  onEditDizimista 
}) => {
  const [dizimistas, setDizimistas] = useState<DizimistaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nome: '',
    status: 'Todos'
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 20,
    total: 0
  });

  useEffect(() => {
    carregarDizimistas();
  }, [filtros, paginacao.pagina]);

  const carregarDizimistas = async () => {
    try {
      setLoading(true);
      
      const filtrosQuery: any = {
        limite: paginacao.limite,
        offset: (paginacao.pagina - 1) * paginacao.limite
      };

      if (filtros.nome) {
        filtrosQuery.nome = filtros.nome;
      }

      if (filtros.status !== 'Todos') {
        filtrosQuery.status = filtros.status;
      }

      const lista = await DizimistaService.listarDizimistas(filtrosQuery);
      setDizimistas(lista);
      
      // Para simplificar, vamos assumir que temos mais dados se retornou o limite completo
      setPaginacao(prev => ({
        ...prev,
        total: lista.length === paginacao.limite ? (paginacao.pagina * paginacao.limite) + 1 : (paginacao.pagina - 1) * paginacao.limite + lista.length
      }));

    } catch (error: any) {
      console.error('Erro ao carregar dizimistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
    setPaginacao(prev => ({ ...prev, pagina: 1 })); // Reset para primeira página
  };

  const handlePaginaChange = (novaPagina: number) => {
    setPaginacao(prev => ({ ...prev, pagina: novaPagina }));
  };

  const formatarTelefone = (telefone?: string) => {
    if (!telefone) return '-';
    // Formato simples para exibição
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatarData = (data?: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Ativo':
        return 'text-green-400 bg-green-500/20';
      case 'Inativo':
        return 'text-gray-400 bg-gray-500/20';
      case 'Suspenso':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Lista de Dizimistas</h1>
            <p className="text-slate-400 text-sm">Gerenciar dizimistas e ofertantes</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Buscar por Nome
            </label>
            <input
              type="text"
              name="nome"
              value={filtros.nome}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Digite o nome..."
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Status
            </label>
            <select
              name="status"
              value={filtros.status}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Suspenso">Suspenso</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={carregarDizimistas}
              className="px-4 py-2 bg-cyan-400 text-slate-900 font-bold rounded-lg shadow-md shadow-cyan-500/30 hover:bg-cyan-300 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Dizimistas */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="m22 21-3-3m0 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Dizimistas Cadastrados</h2>
            <p className="text-slate-400 text-sm">
              {loading ? 'Carregando...' : `${dizimistas.length} dizimistas encontrados`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Carregando dizimistas...</div>
          </div>
        ) : dizimistas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Nenhum dizimista encontrado</div>
          </div>
        ) : (
          <>
            {/* Tabela para desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Nome</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Telefone</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Email</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Status</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Cadastro</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dizimistas.map((dizimista) => (
                    <tr key={dizimista.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-2">
                        <div className="text-white font-medium">{dizimista.nome}</div>
                        {dizimista.profissao && (
                          <div className="text-slate-400 text-sm">{dizimista.profissao}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {formatarTelefone(dizimista.telefone)}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {dizimista.email || '-'}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dizimista.status)}`}>
                          {dizimista.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-sm">
                        {formatarData(dizimista.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          {onSelectDizimista && (
                            <button
                              onClick={() => onSelectDizimista(dizimista)}
                              className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm hover:bg-green-500/30 transition-colors"
                            >
                              Selecionar
                            </button>
                          )}
                          {onEditDizimista && (
                            <button
                              onClick={() => onEditDizimista(dizimista)}
                              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para mobile */}
            <div className="md:hidden space-y-4">
              {dizimistas.map((dizimista) => (
                <div key={dizimista.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium">{dizimista.nome}</h3>
                      {dizimista.profissao && (
                        <p className="text-slate-400 text-sm">{dizimista.profissao}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dizimista.status)}`}>
                      {dizimista.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="text-slate-300">
                      📞 {formatarTelefone(dizimista.telefone)}
                    </div>
                    {dizimista.email && (
                      <div className="text-slate-300">
                        ✉️ {dizimista.email}
                      </div>
                    )}
                    <div className="text-slate-400">
                      📅 {formatarData(dizimista.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {onSelectDizimista && (
                      <button
                        onClick={() => onSelectDizimista(dizimista)}
                        className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm hover:bg-green-500/30 transition-colors"
                      >
                        Selecionar
                      </button>
                    )}
                    {onEditDizimista && (
                      <button
                        onClick={() => onEditDizimista(dizimista)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
              <div className="text-slate-400 text-sm">
                Página {paginacao.pagina} - {dizimistas.length} registros
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePaginaChange(paginacao.pagina - 1)}
                  disabled={paginacao.pagina === 1}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePaginaChange(paginacao.pagina + 1)}
                  disabled={dizimistas.length < paginacao.limite}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ListaDizimistasView;

