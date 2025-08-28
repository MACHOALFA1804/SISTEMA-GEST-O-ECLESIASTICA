import React, { useState, useEffect } from 'react';
import { AdminService, ConfiguracaoSistema, TemaSistema, TextoSistema } from '../../services/adminService';

interface PersonalizacaoSistemaViewProps {
  onBack: () => void;
}

const PersonalizacaoSistemaView: React.FC<PersonalizacaoSistemaViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'configuracoes' | 'tema' | 'textos'>('configuracoes');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Estados para configurações
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);
  const [configuracoesEditadas, setConfiguracoesEditadas] = useState<Record<string, string>>({});

  // Estados para tema
  const [temaAtivo, setTemaAtivo] = useState<TemaSistema | null>(null);
  const [coresEditadas, setCoresEditadas] = useState({
    primary: '#22d3ee',
    secondary: '#0f172a',
    accent: '#10b981',
    background: '#0f172a',
    text: '#ffffff',
    muted: '#64748b'
  });

  // Estados para textos
  const [textos, setTextos] = useState<TextoSistema[]>([]);
  const [textosEditados, setTextosEditados] = useState<Record<string, string>>({});
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroPagina, setFiltroPagina] = useState<string>('');

  // Estado para modais de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  // Auto-hide da mensagem após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Função para criar configurações padrão se não existirem
  const criarConfiguracoesPadrao = async () => {
    const configsPadrao = [
      { chave: 'titulo_sistema', valor: 'TEFILIN v3', tipo: 'string', categoria: 'geral', descricao: 'Título do Sistema', editavel: true },
      { chave: 'subtitulo_sistema', valor: 'Sistema de Gestão de Visitantes 2', tipo: 'string', categoria: 'geral', descricao: 'Subtítulo do Sistema', editavel: true },
      { chave: 'versiculo_biblico', valor: 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor', tipo: 'string', categoria: 'geral', descricao: 'Versículo Bíblico', editavel: true },
      { chave: 'referencia_versiculo', valor: 'Colossenses 3:23', tipo: 'string', categoria: 'geral', descricao: 'Referência do Versículo', editavel: true },
      { chave: 'cor_primaria', valor: '#22d3ee', tipo: 'color', categoria: 'tema', descricao: 'Cor Primária', editavel: true },
      { chave: 'cor_secundaria', valor: '#0f172a', tipo: 'color', categoria: 'tema', descricao: 'Cor Secundária', editavel: true }
    ];

    try {
      setMessage({ type: 'warning', text: 'Criando configurações padrão...' });
      
      for (const config of configsPadrao) {
        await AdminService.criarConfiguracao(config as any);
      }
      
      setMessage({ type: 'success', text: 'Configurações padrão criadas com sucesso!' });
      console.log('Configurações padrão criadas');
    } catch (error: any) {
      console.error('Erro ao criar configurações padrão:', error);
      setMessage({ type: 'error', text: `Erro ao criar configurações: ${error.message}` });
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      const [configsData, temaData, textosData] = await Promise.all([
        AdminService.obterConfiguracoes(),
        AdminService.obterTemaAtivo(),
        AdminService.obterTextos()
      ]);

      console.log('Configurações carregadas:', configsData);
      console.log('Tema ativo carregado:', temaData);
      console.log('Textos carregados:', textosData);

      setConfiguracoes(configsData);
      setTemaAtivo(temaData);
      setTextos(textosData);

      // Inicializar valores editados das configurações
      const configsObj: Record<string, string> = {};
      configsData.forEach(config => {
        configsObj[config.chave] = config.valor;
      });
      setConfiguracoesEditadas(configsObj);
      console.log('Configurações editadas inicializadas:', configsObj);

      // Inicializar cores editadas
      if (temaData?.cores) {
        setCoresEditadas(temaData.cores);
        console.log('Cores editadas inicializadas:', temaData.cores);
      }

      // Inicializar textos editados
      const textosObj: Record<string, string> = {};
      textosData.forEach(texto => {
        textosObj[texto.chave] = texto.texto_personalizado || texto.texto_original;
      });
      setTextosEditados(textosObj);
      console.log('Textos editados inicializados:', textosObj);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: `Erro ao carregar dados: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Inicializar dados se estiverem vazios
  useEffect(() => {
    if (!loading && configuracoes.length === 0) {
      console.log('Configurações vazias, criando configurações padrão...');
      criarConfiguracoesPadrao().then(() => carregarDados());
    }
  }, [loading, configuracoes.length]);

  const salvarConfiguracoes = async () => {
    try {
      setSaving(true);
      console.log('Salvando configurações:', configuracoesEditadas);
      
      // Verificar se há configurações para salvar
      if (Object.keys(configuracoesEditadas).length === 0) {
        setMessage({ type: 'warning', text: 'Nenhuma configuração para salvar' });
        return;
      }
      
      const promises = Object.entries(configuracoesEditadas).map(([chave, valor]) => {
        console.log(`Salvando configuração: ${chave} = ${valor}`);
        return AdminService.atualizarConfiguracao(chave, valor);
      });
      
      const resultados = await Promise.all(promises);
      console.log('Configurações salvas:', resultados);
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      await carregarDados(); // Recarregar para confirmar as mudanças
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: `Erro ao salvar configurações: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const salvarTema = async () => {
    try {
      setSaving(true);
      console.log('Salvando tema:', coresEditadas);
      
      if (temaAtivo?.id) {
        // Atualizar tema existente
        const resultado = await AdminService.atualizarTema(temaAtivo.id, { cores: coresEditadas });
        console.log('Tema atualizado:', resultado);
      } else {
        // Criar novo tema
        const novoTema = {
          nome: 'Tema Personalizado',
          ativo: true,
          cores: coresEditadas
        };
        const tema = await AdminService.criarTema(novoTema);
        console.log('Novo tema criado:', tema);
        await AdminService.ativarTema(tema.id!);
      }
      
      setMessage({ type: 'success', text: 'Tema salvo com sucesso!' });
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar tema:', error);
      setMessage({ type: 'error', text: `Erro ao salvar tema: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const salvarTextos = async () => {
    try {
      setSaving(true);
      console.log('Salvando textos:', textosEditados);
      
      const promises = Object.entries(textosEditados).map(([chave, texto]) => {
        console.log(`Salvando texto: ${chave} = ${texto}`);
        return AdminService.atualizarTexto(chave, texto);
      });
      
      const resultados = await Promise.all(promises);
      console.log('Textos salvos:', resultados);
      
      setMessage({ type: 'success', text: 'Textos salvos com sucesso!' });
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar textos:', error);
      setMessage({ type: 'error', text: `Erro ao salvar textos: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (chave: string, valor: string) => {
    console.log(`Alterando configuração: ${chave} = ${valor}`);
    setConfiguracoesEditadas(prev => ({
      ...prev,
      [chave]: valor
    }));
  };

  const handleCorChange = (cor: string, valor: string) => {
    console.log(`Alterando cor: ${cor} = ${valor}`);
    setCoresEditadas(prev => ({
      ...prev,
      [cor]: valor
    }));
  };

  const handleTextoChange = (chave: string, valor: string) => {
    console.log(`Alterando texto: ${chave} = ${valor}`);
    setTextosEditados(prev => ({
      ...prev,
      [chave]: valor
    }));
  };

  // Função para mostrar modal de confirmação
  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    confirmAction();
    setShowConfirmModal(false);
  };

  const resetarConfiguracoes = () => {
    showConfirmation(
      'Tem certeza que deseja resetar todas as configurações para os valores padrão?',
      () => {
        const configsObj: Record<string, string> = {};
        configuracoes.forEach(config => {
          configsObj[config.chave] = config.valor;
        });
        setConfiguracoesEditadas(configsObj);
        
        setMessage({ type: 'warning', text: 'Configurações resetadas. Clique em "Salvar" para aplicar.' });
      }
    );
  };

  const resetarTema = () => {
    showConfirmation(
      'Tem certeza que deseja resetar o tema para as cores padrão?',
      () => {
        const coresPadrao = AdminService.getTemaDefault().cores;
        setCoresEditadas(coresPadrao);
        
        setMessage({ type: 'warning', text: 'Tema resetado. Clique em "Salvar" para aplicar.' });
      }
    );
  };

  const resetarTextos = () => {
    showConfirmation(
      'Tem certeza que deseja resetar todos os textos para os valores originais?',
      () => {
        const textosObj: Record<string, string> = {};
        textos.forEach(texto => {
          textosObj[texto.chave] = texto.texto_original;
        });
        setTextosEditados(textosObj);
        
        setMessage({ type: 'warning', text: 'Textos resetados. Clique em "Salvar" para aplicar.' });
      }
    );
  };

  const categorias = [...new Set(textos.map(t => t.categoria))];
  const paginas = [...new Set(textos.map(t => t.pagina))];

  const textosFiltrados = textos.filter(texto => {
    const matchCategoria = !filtroCategoria || texto.categoria === filtroCategoria;
    const matchPagina = !filtroPagina || texto.pagina === filtroPagina;
    return matchCategoria && matchPagina;
  });

  const configsPorCategoria = configuracoes.reduce((acc, config) => {
    if (!acc[config.categoria]) acc[config.categoria] = [];
    acc[config.categoria].push(config);
    return acc;
  }, {} as Record<string, ConfiguracaoSistema[]>);

  // Modal de confirmação
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-600">
          <h3 className="text-white text-lg font-semibold mb-4">Confirmação</h3>
          <p className="text-slate-300 mb-6">{confirmMessage}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-slate-300 border border-slate-600 rounded hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAction}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
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
            <h1 className="text-white text-2xl font-bold">Personalização do Sistema</h1>
            <p className="text-slate-400 text-sm">Configure aparência, textos e comportamento</p>
          </div>
        </div>
      </div>

      {/* Debug Info (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm">
          <strong>Debug:</strong> Configs: {configuracoes.length}, Tema: {temaAtivo?.id ? 'OK' : 'Vazio'}, Textos: {textos.length}
        </div>
      )}

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : message.type === 'warning'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              className="text-current opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 mb-6">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'configuracoes'
                ? 'text-cyan-300 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Configurações Gerais
          </button>
          <button
            onClick={() => setActiveTab('tema')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'tema'
                ? 'text-cyan-300 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Cores e Tema
          </button>
          <button
            onClick={() => setActiveTab('textos')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'textos'
                ? 'text-cyan-300 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Textos da Interface
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <div className="text-slate-400">Carregando dados de personalização...</div>
            </div>
          ) : (
            <>
              {/* Tab: Configurações Gerais */}
              {activeTab === 'configuracoes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-lg font-semibold">Configurações do Sistema</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={resetarConfiguracoes}
                        className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded text-sm hover:bg-slate-500 transition-colors"
                      >
                        Resetar
                      </button>
                      <button
                        onClick={salvarConfiguracoes}
                        disabled={saving}
                        className="px-4 py-1.5 bg-green-500 text-white rounded font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                      </button>
                    </div>
                  </div>

                  {configuracoes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-slate-400 mb-4">Nenhuma configuração encontrada</div>
                      <button 
                        onClick={() => criarConfiguracoesPadrao().then(() => carregarDados())}
                        className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-400 transition-colors"
                      >
                        Criar Configurações Padrão
                      </button>
                    </div>
                  ) : (
                    Object.entries(configsPorCategoria).map(([categoria, configs]) => (
                      <div key={categoria} className="space-y-4">
                        <h4 className="text-slate-300 font-medium capitalize border-b border-slate-700 pb-2">
                          {categoria.replace('_', ' ')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {configs.filter(config => config.editavel !== false).map((config) => (
                            <div key={config.chave} className="space-y-2">
                              <label className="block text-slate-300 text-sm font-medium">
                                {config.descricao || config.chave}
                              </label>
                              
                              {config.tipo === 'boolean' ? (
                                <select
                                  value={configuracoesEditadas[config.chave] ?? config.valor}
                                  onChange={(e) => handleConfigChange(config.chave, e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                >
                                  <option value="true">Sim</option>
                                  <option value="false">Não</option>
                                </select>
                              ) : config.tipo === 'color' ? (
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={configuracoesEditadas[config.chave] ?? config.valor}
                                    onChange={(e) => handleConfigChange(config.chave, e.target.value)}
                                    className="w-12 h-10 rounded border border-slate-600 bg-slate-700"
                                  />
                                  <input
                                    type="text"
                                    value={configuracoesEditadas[config.chave] ?? config.valor}
                                    onChange={(e) => handleConfigChange(config.chave, e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                  />
                                </div>
                              ) : config.tipo === 'number' ? (
                                <input
                                  type="number"
                                  value={configuracoesEditadas[config.chave] ?? config.valor}
                                  onChange={(e) => handleConfigChange(config.chave, e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={configuracoesEditadas[config.chave] ?? config.valor}
                                  onChange={(e) => handleConfigChange(config.chave, e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                />
                              )}
                              
                              {/* Mostrar valor atual vs editado */}
                              {process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-slate-500">
                                  Original: {config.valor} | Atual: {configuracoesEditadas[config.chave] ?? 'vazio'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Cores e Tema */}
              {activeTab === 'tema' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-lg font-semibold">Personalização de Cores</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={resetarTema}
                        className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded text-sm hover:bg-slate-500 transition-colors"
                      >
                        Resetar
                      </button>
                      <button
                        onClick={salvarTema}
                        disabled={saving}
                        className="px-4 py-1.5 bg-green-500 text-white rounded font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Salvando...' : 'Salvar Tema'}
                      </button>
                    </div>
                  </div>

                  {/* Preview do tema */}
                  <div 
                    className="rounded-lg p-6 border-2"
                    style={{ 
                      backgroundColor: coresEditadas.background,
                      borderColor: coresEditadas.primary,
                      color: coresEditadas.text
                    }}
                  >
                    <h4 className="font-bold text-lg mb-2">Preview do Tema</h4>
                    <p className="mb-4" style={{ color: coresEditadas.muted }}>
                      Este é um exemplo de como o sistema ficará com as cores selecionadas.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        className="px-4 py-2 rounded font-medium"
                        style={{ backgroundColor: coresEditadas.primary, color: coresEditadas.background }}
                      >
                        Botão Primário
                      </button>
                      <button 
                        className="px-4 py-2 rounded font-medium"
                        style={{ backgroundColor: coresEditadas.accent, color: coresEditadas.background }}
                      >
                        Botão Destaque
                      </button>
                    </div>
                  </div>

                  {/* Controles de cor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(coresEditadas).map(([nome, cor]) => (
                      <div key={nome} className="space-y-2">
                        <label className="block text-slate-300 text-sm font-medium capitalize">
                          {nome === 'primary' ? 'Cor Primária' :
                           nome === 'secondary' ? 'Cor Secundária' :
                           nome === 'accent' ? 'Cor de Destaque' :
                           nome === 'background' ? 'Cor de Fundo' :
                           nome === 'text' ? 'Cor do Texto' :
                           nome === 'muted' ? 'Cor Secundária do Texto' : nome}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={cor}
                            onChange={(e) => handleCorChange(nome, e.target.value)}
                            className="w-12 h-10 rounded border border-slate-600 bg-slate-700"
                          />
                          <input
                            type="text"
                            value={cor}
                            onChange={(e) => handleCorChange(nome, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Textos da Interface */}
              {activeTab === 'textos' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-lg font-semibold">Personalização de Textos</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={resetarTextos}
                        className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded text-sm hover:bg-slate-500 transition-colors"
                      >
                        Resetar
                      </button>
                      <button
                        onClick={salvarTextos}
                        disabled={saving}
                        className="px-4 py-1.5 bg-green-500 text-white rounded font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Salvando...' : 'Salvar Textos'}
                      </button>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-1">Categoria</label>
                      <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      >
                        <option value="">Todas</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-1">Página</label>
                      <select
                        value={filtroPagina}
                        onChange={(e) => setFiltroPagina(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      >
                        <option value="">Todas</option>
                        {paginas.map(pag => (
                          <option key={pag} value={pag}>{pag}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lista de textos */}
                  {textos.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      Nenhum texto encontrado. Configure os textos no banco de dados.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {textosFiltrados.map((texto) => (
                        <div key={texto.chave} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-white font-medium">{texto.chave}</h4>
                              <div className="flex gap-2 mt-1">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                  {texto.categoria}
                                </span>
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                  {texto.pagina}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-400 text-sm mb-1">Texto Original</label>
                              <div className="p-2 bg-slate-800 rounded text-slate-300 text-sm">
                                {texto.texto_original}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-slate-400 text-sm mb-1">Texto Personalizado</label>
                              <input
                                type="text"
                                value={textosEditados[texto.chave] || ''}
                                onChange={(e) => handleTextoChange(texto.chave, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                placeholder="Digite o texto personalizado..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {textosFiltrados.length === 0 && textos.length > 0 && (
                    <div className="text-center py-8 text-slate-400">
                      Nenhum texto encontrado com os filtros selecionados.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
      <ConfirmModal />
    </main>
  );
};

export default PersonalizacaoSistemaView;