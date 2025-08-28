import React, { useState, useEffect } from 'react';
import { supabase, ConfiguracaoRow } from '../../lib/supabaseClient';

interface ConfiguracoesViewProps {
  onBack: () => void;
}

interface ConfiguracaoSistema {
  nomeIgreja: string;
  enderecoIgreja: string;
  telefoneIgreja: string;
  emailIgreja: string;
  logoIgreja: string;
  corPrimaria: string;
  corSecundaria: string;
  versiculoBiblico: string;
  referenciaVersiculo: string;
  tituloSistema: string;
  subtituloSistema: string;
  mensagemBemVindo: string;
  textoRodape: string;
}

interface ConfiguracaoRelatorio {
  incluirLogo: boolean;
  incluirEndereco: boolean;
  incluirVersiculo: boolean;
  fonteTitulo: string;
  tamanhoFonte: number;
  margemPagina: number;
  orientacaoPagina: 'portrait' | 'landscape';
  formatoData: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sistema' | 'igreja' | 'relatorios' | 'whatsapp'>('sistema');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [configSistema, setConfigSistema] = useState<ConfiguracaoSistema>({
    nomeIgreja: 'Assembleia de Deus Vila Evangélica',
    enderecoIgreja: '',
    telefoneIgreja: '',
    emailIgreja: '',
    logoIgreja: '',
    corPrimaria: '#22d3ee',
    corSecundaria: '#0f172a',
    versiculoBiblico: 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor',
    referenciaVersiculo: 'Colossenses 3:23',
    tituloSistema: 'TEFILIN v1',
    subtituloSistema: 'Sistema de Gestão de Visitantes',
    mensagemBemVindo: 'Bem-vindo ao sistema de gestão de visitantes',
    textoRodape: 'DEV EMERSON 2025'
  });

  const [configRelatorio, setConfigRelatorio] = useState<ConfiguracaoRelatorio>({
    incluirLogo: true,
    incluirEndereco: true,
    incluirVersiculo: true,
    fonteTitulo: 'Arial',
    tamanhoFonte: 12,
    margemPagina: 20,
    orientacaoPagina: 'portrait',
    formatoData: 'DD/MM/YYYY'
  });

  const [configWhatsApp, setConfigWhatsApp] = useState({
    apiKey: '',
    instanceId: '',
    webhookUrl: '',
    autoResposta: true,
    mensagemPadrao: 'Olá! Obrigado por entrar em contato conosco. Em breve retornaremos sua mensagem.',
    horarioAtendimento: '08:00 - 18:00',
    diasAtendimento: 'Segunda a Sexta'
  });

  const loadConfiguracoes = async () => {
    setLoading(true);
    
    try {
      // Carregar configurações do banco de dados
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        // Mapear configurações do banco para o estado local
        data.forEach(config => {
          const chave = config.chave;
          const valor = config.valor;
          
          switch (chave) {
            case 'titulo_sistema':
              setConfigSistema(prev => ({ ...prev, tituloSistema: valor || prev.tituloSistema }));
              break;
            case 'subtitulo_sistema':
              setConfigSistema(prev => ({ ...prev, subtituloSistema: valor || prev.subtituloSistema }));
              break;
            case 'cor_primaria':
              setConfigSistema(prev => ({ ...prev, corPrimaria: valor || prev.corPrimaria }));
              break;
            case 'cor_secundaria':
              setConfigSistema(prev => ({ ...prev, corSecundaria: valor || prev.corSecundaria }));
              break;
            case 'versiculo_biblico':
              setConfigSistema(prev => ({ ...prev, versiculoBiblico: valor || prev.versiculoBiblico }));
              break;
            case 'referencia_versiculo':
              setConfigSistema(prev => ({ ...prev, referenciaVersiculo: valor || prev.referenciaVersiculo }));
              break;
            case 'nome_igreja':
              setConfigSistema(prev => ({ ...prev, nomeIgreja: valor || prev.nomeIgreja }));
              break;
            case 'endereco_igreja':
              setConfigSistema(prev => ({ ...prev, enderecoIgreja: valor || prev.enderecoIgreja }));
              break;
            case 'telefone_igreja':
              setConfigSistema(prev => ({ ...prev, telefoneIgreja: valor || prev.telefoneIgreja }));
              break;
            case 'email_igreja':
              setConfigSistema(prev => ({ ...prev, emailIgreja: valor || prev.emailIgreja }));
              break;
            case 'incluir_logo':
              setConfigRelatorio(prev => ({ ...prev, incluirLogo: valor === 'true' }));
              break;
            case 'incluir_endereco':
              setConfigRelatorio(prev => ({ ...prev, incluirEndereco: valor === 'true' }));
              break;
            case 'incluir_versiculo':
              setConfigRelatorio(prev => ({ ...prev, incluirVersiculo: valor === 'true' }));
              break;
            case 'fonte_titulo':
              setConfigRelatorio(prev => ({ ...prev, fonteTitulo: valor || prev.fonteTitulo }));
              break;
            case 'tamanho_fonte':
              setConfigRelatorio(prev => ({ ...prev, tamanhoFonte: parseInt(valor) || prev.tamanhoFonte }));
              break;
            case 'whatsapp_api_key':
              setConfigWhatsApp(prev => ({ ...prev, apiKey: valor || prev.apiKey }));
              break;
            case 'whatsapp_instance_id':
              setConfigWhatsApp(prev => ({ ...prev, instanceId: valor || prev.instanceId }));
              break;
            case 'whatsapp_webhook_url':
              setConfigWhatsApp(prev => ({ ...prev, webhookUrl: valor || prev.webhookUrl }));
              break;
            case 'whatsapp_auto_resposta':
              setConfigWhatsApp(prev => ({ ...prev, autoResposta: valor === 'true' }));
              break;
            case 'whatsapp_mensagem_padrao':
              setConfigWhatsApp(prev => ({ ...prev, mensagemPadrao: valor || prev.mensagemPadrao }));
              break;
            case 'whatsapp_horario_atendimento':
              setConfigWhatsApp(prev => ({ ...prev, horarioAtendimento: valor || prev.horarioAtendimento }));
              break;
            case 'whatsapp_dias_atendimento':
              setConfigWhatsApp(prev => ({ ...prev, diasAtendimento: valor || prev.diasAtendimento }));
              break;
          }
        });
      }

      console.log('Configurações carregadas com sucesso');

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações. Verifique se a tabela foi criada.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const salvarConfiguracoes = async (categoria: string, dados: Record<string, any>) => {
    setLoading(true);
    setMessage(null);

    try {
      const configsToSave: Array<{ chave: string; valor: string; tipo: string; categoria: string }> = [];

      // Mapear dados para o formato do banco
      switch (categoria) {
        case 'sistema':
          configsToSave.push(
            { chave: 'titulo_sistema', valor: dados.tituloSistema, tipo: 'text', categoria: 'sistema' },
            { chave: 'subtitulo_sistema', valor: dados.subtituloSistema, tipo: 'text', categoria: 'sistema' },
            { chave: 'cor_primaria', valor: dados.corPrimaria, tipo: 'color', categoria: 'sistema' },
            { chave: 'cor_secundaria', valor: dados.corSecundaria, tipo: 'color', categoria: 'sistema' },
            { chave: 'versiculo_biblico', valor: dados.versiculoBiblico, tipo: 'text', categoria: 'sistema' },
            { chave: 'referencia_versiculo', valor: dados.referenciaVersiculo, tipo: 'text', categoria: 'sistema' }
          );
          break;
        case 'igreja':
          configsToSave.push(
            { chave: 'nome_igreja', valor: dados.nomeIgreja, tipo: 'text', categoria: 'igreja' },
            { chave: 'endereco_igreja', valor: dados.enderecoIgreja, tipo: 'text', categoria: 'igreja' },
            { chave: 'telefone_igreja', valor: dados.telefoneIgreja, tipo: 'text', categoria: 'igreja' },
            { chave: 'email_igreja', valor: dados.emailIgreja, tipo: 'text', categoria: 'igreja' }
          );
          break;
        case 'relatorios':
          configsToSave.push(
            { chave: 'incluir_logo', valor: dados.incluirLogo.toString(), tipo: 'boolean', categoria: 'relatorios' },
            { chave: 'incluir_endereco', valor: dados.incluirEndereco.toString(), tipo: 'boolean', categoria: 'relatorios' },
            { chave: 'incluir_versiculo', valor: dados.incluirVersiculo.toString(), tipo: 'boolean', categoria: 'relatorios' },
            { chave: 'fonte_titulo', valor: dados.fonteTitulo, tipo: 'text', categoria: 'relatorios' },
            { chave: 'tamanho_fonte', valor: dados.tamanhoFonte.toString(), tipo: 'number', categoria: 'relatorios' },
            { chave: 'orientacao_pagina', valor: dados.orientacaoPagina, tipo: 'text', categoria: 'relatorios' },
            { chave: 'formato_data', valor: dados.formatoData, tipo: 'text', categoria: 'relatorios' }
          );
          break;
        case 'whatsapp':
          configsToSave.push(
            { chave: 'whatsapp_api_key', valor: dados.apiKey, tipo: 'text', categoria: 'whatsapp' },
            { chave: 'whatsapp_instance_id', valor: dados.instanceId, tipo: 'text', categoria: 'whatsapp' },
            { chave: 'whatsapp_webhook_url', valor: dados.webhookUrl, tipo: 'text', categoria: 'whatsapp' },
            { chave: 'whatsapp_auto_resposta', valor: dados.autoResposta.toString(), tipo: 'boolean', categoria: 'whatsapp' },
            { chave: 'whatsapp_mensagem_padrao', valor: dados.mensagemPadrao, tipo: 'text', categoria: 'whatsapp' },
            { chave: 'whatsapp_horario_atendimento', valor: dados.horarioAtendimento, tipo: 'text', categoria: 'whatsapp' },
            { chave: 'whatsapp_dias_atendimento', valor: dados.diasAtendimento, tipo: 'text', categoria: 'whatsapp' }
          );
          break;
      }

      // Salvar cada configuração no banco
      for (const config of configsToSave) {
        const { error } = await supabase
          .from('configuracoes')
          .upsert({
            chave: config.chave,
            valor: config.valor,
            tipo: config.tipo,
            categoria: config.categoria
          }, { onConflict: 'chave' });

        if (error) {
          throw error;
        }
      }

      setMessage({ type: 'success', text: `Configurações de ${categoria} salvas com sucesso!` });
      console.log(`Configurações de ${categoria} salvas:`, dados);

    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: `Erro ao salvar: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSistemaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfigSistema(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRelatorioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setConfigRelatorio(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setConfigWhatsApp(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simular upload da logo (aqui você integraria com storage do Supabase)
    setMessage({ type: 'success', text: 'Logo enviada com sucesso!' });
    setConfigSistema(prev => ({
      ...prev,
      logoIgreja: URL.createObjectURL(file)
    }));
  };

  const tabs = [
    { id: 'sistema', label: 'Sistema', icon: '⚙️' },
    { id: 'igreja', label: 'Igreja', icon: '⛪' },
    { id: 'relatorios', label: 'Relatórios', icon: '📄' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 3h4l1 3h3l1 4-3 1v2l3 1-1 4h-3l-1 3h-4l-1-3H6l-1-4 3-1v-2L5 10l1-4h3l1-3z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Configurações do Sistema</h2>
              <p className="text-slate-400 text-sm">Personalização e ajustes gerais</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-4 py-2 rounded-lg border font-semibold text-sm whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                  : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:border-cyan-500/30'
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="space-y-6">
          {/* Aba Sistema */}
          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold">Configurações Gerais do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Título do Sistema
                  </label>
                  <input
                    type="text"
                    name="tituloSistema"
                    value={configSistema.tituloSistema}
                    onChange={handleSistemaChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subtítulo do Sistema
                  </label>
                  <input
                    type="text"
                    name="subtituloSistema"
                    value={configSistema.subtituloSistema}
                    onChange={handleSistemaChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    name="corPrimaria"
                    value={configSistema.corPrimaria}
                    onChange={handleSistemaChange}
                    className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor Secundária
                  </label>
                  <input
                    type="color"
                    name="corSecundaria"
                    value={configSistema.corSecundaria}
                    onChange={handleSistemaChange}
                    className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Versículo Bíblico
                </label>
                <textarea
                  name="versiculoBiblico"
                  value={configSistema.versiculoBiblico}
                  onChange={handleSistemaChange}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Referência do Versículo
                </label>
                <input
                  type="text"
                  name="referenciaVersiculo"
                  value={configSistema.referenciaVersiculo}
                  onChange={handleSistemaChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                onClick={() => salvarConfiguracoes('sistema', configSistema)}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Configurações do Sistema'}
              </button>
            </div>
          )}

          {/* Aba Igreja */}
          {activeTab === 'igreja' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold">Informações da Igreja</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da Igreja
                  </label>
                  <input
                    type="text"
                    name="nomeIgreja"
                    value={configSistema.nomeIgreja}
                    onChange={handleSistemaChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Endereço Completo
                  </label>
                  <textarea
                    name="enderecoIgreja"
                    value={configSistema.enderecoIgreja}
                    onChange={handleSistemaChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="telefoneIgreja"
                    value={configSistema.telefoneIgreja}
                    onChange={handleSistemaChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="emailIgreja"
                    value={configSistema.emailIgreja}
                    onChange={handleSistemaChange}
                    placeholder="contato@igreja.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Logo da Igreja
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
                {configSistema.logoIgreja && (
                  <div className="mt-2">
                    <img
                      src={configSistema.logoIgreja}
                      alt="Logo da Igreja"
                      className="w-20 h-20 object-contain rounded-lg border border-slate-700"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => salvarConfiguracoes('igreja', configSistema)}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Informações da Igreja'}
              </button>
            </div>
          )}

          {/* Aba Relatórios */}
          {activeTab === 'relatorios' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold">Configurações de Relatórios PDF</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fonte dos Títulos
                  </label>
                  <select
                    name="fonteTitulo"
                    value={configRelatorio.fonteTitulo}
                    onChange={handleRelatorioChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tamanho da Fonte
                  </label>
                  <input
                    type="number"
                    name="tamanhoFonte"
                    value={configRelatorio.tamanhoFonte}
                    onChange={handleRelatorioChange}
                    min="8"
                    max="24"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Orientação da Página
                  </label>
                  <select
                    name="orientacaoPagina"
                    value={configRelatorio.orientacaoPagina}
                    onChange={handleRelatorioChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="portrait">Retrato</option>
                    <option value="landscape">Paisagem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Formato de Data
                  </label>
                  <select
                    name="formatoData"
                    value={configRelatorio.formatoData}
                    onChange={handleRelatorioChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-slate-300 font-medium">Incluir nos Relatórios:</h4>
                {[
                  { key: 'incluirLogo', label: 'Logo da Igreja' },
                  { key: 'incluirEndereco', label: 'Endereço da Igreja' },
                  { key: 'incluirVersiculo', label: 'Versículo Bíblico' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={item.key}
                      checked={configRelatorio[item.key as keyof ConfiguracaoRelatorio] as boolean}
                      onChange={handleRelatorioChange}
                      className="rounded"
                    />
                    <span className="text-slate-300">{item.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => salvarConfiguracoes('relatorios', configRelatorio)}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Configurações de Relatórios'}
              </button>
            </div>
          )}

          {/* Aba WhatsApp */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold">Configurações do WhatsApp</h3>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-300 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                  </svg>
                  <span className="font-medium">Integração Avançada</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  Estas configurações são para integração avançada com API do WhatsApp Business. 
                  Para uso básico, as configurações atuais já permitem envio via WhatsApp Web.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    name="apiKey"
                    value={configWhatsApp.apiKey}
                    onChange={handleWhatsAppChange}
                    placeholder="Sua chave da API do WhatsApp"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instance ID
                  </label>
                  <input
                    type="text"
                    name="instanceId"
                    value={configWhatsApp.instanceId}
                    onChange={handleWhatsAppChange}
                    placeholder="ID da instância"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    name="webhookUrl"
                    value={configWhatsApp.webhookUrl}
                    onChange={handleWhatsAppChange}
                    placeholder="https://seu-dominio.com/webhook"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Horário de Atendimento
                  </label>
                  <input
                    type="text"
                    name="horarioAtendimento"
                    value={configWhatsApp.horarioAtendimento}
                    onChange={handleWhatsAppChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dias de Atendimento
                  </label>
                  <input
                    type="text"
                    name="diasAtendimento"
                    value={configWhatsApp.diasAtendimento}
                    onChange={handleWhatsAppChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mensagem de Auto-Resposta
                </label>
                <textarea
                  name="mensagemPadrao"
                  value={configWhatsApp.mensagemPadrao}
                  onChange={handleWhatsAppChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="autoResposta"
                  checked={configWhatsApp.autoResposta}
                  onChange={handleWhatsAppChange}
                  className="rounded"
                />
                <label className="text-slate-300">Ativar auto-resposta</label>
              </div>

              <button
                onClick={() => salvarConfiguracoes('whatsapp', configWhatsApp)}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Configurações do WhatsApp'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ConfiguracoesView;
