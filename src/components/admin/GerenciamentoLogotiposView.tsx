import React, { useState, useEffect } from 'react';
import { AdminService, LogotipoSistema } from '../../services/adminService';

interface GerenciamentoLogotiposViewProps {
  onBack: () => void;
}

const GerenciamentoLogotiposView: React.FC<GerenciamentoLogotiposViewProps> = ({ onBack }) => {
  const [logotipos, setLogotipos] = useState<LogotipoSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<string>('logo_principal');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nomeLogotipo, setNomeLogotipo] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Especificações para cada tipo de logotipo
  const especificacoes = {
    logo_principal: {
      nome: 'Logo Principal',
      descricao: 'Logotipo principal exibido no cabeçalho do sistema',
      dimensoes: 'Largura: 200-400px, Altura: 50-100px',
      formatos: ['PNG', 'SVG', 'JPG'],
      tamanho_max: '2MB',
      recomendacoes: 'Use fundo transparente (PNG/SVG) para melhor integração'
    },
    logo_login: {
      nome: 'Logo Login',
      descricao: 'Logotipo exibido na tela de login',
      dimensoes: 'Largura: 150-300px, Altura: 40-80px',
      formatos: ['PNG', 'SVG'],
      tamanho_max: '1MB',
      recomendacoes: 'Prefira versão horizontal e fundo transparente'
    },
    favicon: {
      nome: 'Favicon',
      descricao: 'Ícone exibido na aba do navegador',
      dimensoes: '32x32px (quadrado)',
      formatos: ['ICO', 'PNG'],
      tamanho_max: '100KB',
      recomendacoes: 'Use design simples e reconhecível em tamanho pequeno'
    },
    background: {
      nome: 'Imagem de Fundo',
      descricao: 'Imagem de fundo para telas específicas',
      dimensoes: 'Mínimo: 1920x1080px',
      formatos: ['JPG', 'PNG'],
      tamanho_max: '5MB',
      recomendacoes: 'Use imagens de alta qualidade com boa compressão'
    }
  };

  useEffect(() => {
    carregarLogotipos();
  }, []);

  const carregarLogotipos = async () => {
    try {
      setLoading(true);
      const lista = await AdminService.obterLogotipos();
      setLogotipos(lista);
    } catch (error: any) {
      console.error('Erro ao carregar logotipos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar logotipos' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const tipoEspec = especificacoes[tipoSelecionado as keyof typeof especificacoes];
    const extensao = file.name.split('.').pop()?.toUpperCase();
    
    if (!extensao || !tipoEspec.formatos.includes(extensao)) {
      setMessage({ 
        type: 'error', 
        text: `Formato não suportado. Use: ${tipoEspec.formatos.join(', ')}` 
      });
      return;
    }

    // Validar tamanho
    const tamanhoMaxBytes = {
      '100KB': 100 * 1024,
      '1MB': 1024 * 1024,
      '2MB': 2 * 1024 * 1024,
      '5MB': 5 * 1024 * 1024
    }[tipoEspec.tamanho_max] || 2 * 1024 * 1024;

    if (file.size > tamanhoMaxBytes) {
      setMessage({ 
        type: 'error', 
        text: `Arquivo muito grande. Máximo: ${tipoEspec.tamanho_max}` 
      });
      return;
    }

    setArquivo(file);
    setNomeLogotipo(file.name.split('.')[0]);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setMessage(null);
  };

  const handleUpload = async () => {
    if (!arquivo || !nomeLogotipo.trim()) {
      setMessage({ type: 'error', text: 'Selecione um arquivo e informe o nome' });
      return;
    }

    try {
      setUploading(true);
      await AdminService.uploadLogotipo(arquivo, tipoSelecionado, nomeLogotipo.trim());
      
      setMessage({ type: 'success', text: 'Logotipo enviado com sucesso!' });
      await carregarLogotipos();
      
      // Limpar formulário
      setArquivo(null);
      setNomeLogotipo('');
      setPreviewUrl('');
      setShowModal(false);
    } catch (error: any) {
      console.error('Erro ao enviar logotipo:', error);
      setMessage({ type: 'error', text: `Erro ao enviar logotipo: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const abrirModal = (tipo: string = 'logo_principal') => {
    setTipoSelecionado(tipo);
    setArquivo(null);
    setNomeLogotipo('');
    setPreviewUrl('');
    setMessage(null);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setArquivo(null);
    setNomeLogotipo('');
    setPreviewUrl('');
    setMessage(null);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'logo_principal':
        return 'text-blue-400 bg-blue-500/20';
      case 'logo_login':
        return 'text-green-400 bg-green-500/20';
      case 'favicon':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'background':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatarTamanho = (bytes?: number) => {
    if (!bytes) return '-';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatarData = (data?: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const logotiposPorTipo = logotipos.reduce((acc, logo) => {
    if (!acc[logo.tipo]) acc[logo.tipo] = [];
    acc[logo.tipo].push(logo);
    return acc;
  }, {} as Record<string, LogotipoSistema[]>);

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
            <h1 className="text-white text-2xl font-bold">Gerenciamento de Logotipos</h1>
            <p className="text-slate-400 text-sm">Upload e configuração de logotipos do sistema</p>
          </div>
        </div>
        <button
          onClick={() => abrirModal()}
          className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md shadow-green-500/30 hover:bg-green-400 transition-colors"
        >
          Novo Logotipo
        </button>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : message.type === 'warning'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Especificações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(especificacoes).map(([tipo, spec]) => (
          <div key={tipo} className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg grid place-items-center ${getTipoColor(tipo)}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16v16H4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">{spec.nome}</h3>
                <p className="text-slate-400 text-xs">{spec.descricao}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Dimensões: </span>
                <span className="text-slate-300">{spec.dimensoes}</span>
              </div>
              <div>
                <span className="text-slate-400">Formatos: </span>
                <span className="text-slate-300">{spec.formatos.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-400">Tamanho máx: </span>
                <span className="text-slate-300">{spec.tamanho_max}</span>
              </div>
            </div>

            <button
              onClick={() => abrirModal(tipo)}
              className="w-full mt-3 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded text-sm hover:bg-cyan-500/30 transition-colors"
            >
              Upload {spec.nome}
            </button>
          </div>
        ))}
      </div>

      {/* Lista de Logotipos */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Logotipos Cadastrados</h2>
            <p className="text-slate-400 text-sm">
              {loading ? 'Carregando...' : `${logotipos.length} logotipos encontrados`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Carregando logotipos...</div>
          </div>
        ) : logotipos.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Nenhum logotipo encontrado</div>
            <button
              onClick={() => abrirModal()}
              className="mt-3 px-4 py-2 bg-green-500 text-white font-bold rounded-lg"
            >
              Enviar Primeiro Logotipo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(logotiposPorTipo).map(([tipo, logos]) => (
              <div key={tipo}>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getTipoColor(tipo)}`}>
                    {especificacoes[tipo as keyof typeof especificacoes]?.nome || tipo}
                  </span>
                  <span className="text-slate-400 text-sm">({logos.length})</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {logos.map((logo) => (
                    <div key={logo.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                      {/* Preview da imagem */}
                      <div className="aspect-video bg-slate-800 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                        {logo.arquivo_url ? (
                          <img
                            src={logo.arquivo_url}
                            alt={logo.nome}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-slate-500 text-sm">Sem preview</div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white font-medium text-sm">{logo.nome}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            logo.ativo 
                              ? 'text-green-400 bg-green-500/20' 
                              : 'text-gray-400 bg-gray-500/20'
                          }`}>
                            {logo.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="text-slate-400 text-xs space-y-1">
                          <div>Arquivo: {logo.arquivo_nome}</div>
                          <div>Tamanho: {formatarTamanho(logo.tamanho_bytes)}</div>
                          {logo.dimensoes && (
                            <div>Dimensões: {logo.dimensoes.width}x{logo.dimensoes.height}px</div>
                          )}
                          <div>Enviado: {formatarData(logo.created_at)}</div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 pt-2">
                          {logo.arquivo_url && (
                            <a
                              href={logo.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                            >
                              Ver
                            </a>
                          )}
                          {!logo.ativo && (
                            <button
                              onClick={() => {
                                // Implementar ativação
                                console.log('Ativar logotipo:', logo.id);
                              }}
                              className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm hover:bg-green-500/30 transition-colors"
                            >
                              Ativar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">
                Upload de Logotipo
              </h3>
              <button
                onClick={fecharModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Mensagem de feedback no modal */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : message.type === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              {/* Seleção do tipo */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Tipo de Logotipo
                </label>
                <select
                  value={tipoSelecionado}
                  onChange={(e) => setTipoSelecionado(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  {Object.entries(especificacoes).map(([tipo, spec]) => (
                    <option key={tipo} value={tipo}>{spec.nome}</option>
                  ))}
                </select>
              </div>

              {/* Especificações do tipo selecionado */}
              <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                <h4 className="text-white font-medium mb-2">Especificações</h4>
                <div className="text-slate-300 text-sm space-y-1">
                  <div><strong>Dimensões:</strong> {especificacoes[tipoSelecionado as keyof typeof especificacoes].dimensoes}</div>
                  <div><strong>Formatos:</strong> {especificacoes[tipoSelecionado as keyof typeof especificacoes].formatos.join(', ')}</div>
                  <div><strong>Tamanho máximo:</strong> {especificacoes[tipoSelecionado as keyof typeof especificacoes].tamanho_max}</div>
                  <div className="text-slate-400 text-xs mt-2">
                    💡 {especificacoes[tipoSelecionado as keyof typeof especificacoes].recomendacoes}
                  </div>
                </div>
              </div>

              {/* Nome do logotipo */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Nome do Logotipo
                </label>
                <input
                  type="text"
                  value={nomeLogotipo}
                  onChange={(e) => setNomeLogotipo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="Ex: Logo Principal 2024"
                />
              </div>

              {/* Upload do arquivo */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Arquivo
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={especificacoes[tipoSelecionado as keyof typeof especificacoes].formatos.map(f => `.${f.toLowerCase()}`).join(',')}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-slate-400 mb-2">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="12" y1="17" x2="12" y2="9"/>
                      </svg>
                    </div>
                    <div className="text-white font-medium">Clique para selecionar arquivo</div>
                    <div className="text-slate-400 text-sm">
                      ou arraste e solte aqui
                    </div>
                  </label>
                </div>
                
                {arquivo && (
                  <div className="mt-3 text-slate-300 text-sm">
                    Arquivo selecionado: {arquivo.name} ({formatarTamanho(arquivo.size)})
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Preview
                  </label>
                  <div className="border border-slate-600 rounded-lg p-4 bg-slate-900/40">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={handleUpload}
                  disabled={!arquivo || !nomeLogotipo.trim() || uploading}
                  className="px-5 py-2 bg-green-400 text-slate-900 font-bold rounded-lg shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Enviando...' : 'Enviar Logotipo'}
                </button>
                
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-5 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GerenciamentoLogotiposView;

