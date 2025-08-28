import React, { useState, useEffect, useRef } from 'react';
import { avisosService, Aviso, CreateAvisoData, UpdateAvisoData } from '../../services/avisosService';

interface AvisosViewProps {
  onBack: () => void;
}

const AvisosView: React.FC<AvisosViewProps> = ({ onBack }) => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    texto: '',
    ativo: true
  });
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar avisos
  const loadAvisos = async () => {
    try {
      setLoading(true);
      const data = await avisosService.listarAvisos();
      setAvisos(data);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
      alert('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvisos();
  }, []);

  // Resetar formulário
  const resetForm = () => {
    setFormData({ titulo: '', texto: '', ativo: true });
    setSelectedBanner(null);
    setBannerPreview(null);
    setRemoveBanner(false);
    setEditingAviso(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Abrir formulário para novo aviso
  const handleNovoAviso = () => {
    resetForm();
    setShowForm(true);
  };

  // Abrir formulário para editar aviso
  const handleEditarAviso = (aviso: Aviso) => {
    setEditingAviso(aviso);
    setFormData({
      titulo: aviso.titulo,
      texto: aviso.texto,
      ativo: aviso.ativo
    });
    setBannerPreview(aviso.banner_url || null);
    setSelectedBanner(null);
    setRemoveBanner(false);
    setShowForm(true);
  };

  // Manipular seleção de banner
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = avisosService.validarBanner(file);
    if (!validation.valido) {
      alert(validation.erro);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedBanner(file);
    setRemoveBanner(false);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remover banner
  const handleRemoverBanner = () => {
    setSelectedBanner(null);
    setBannerPreview(null);
    setRemoveBanner(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.texto.trim()) {
      alert('Título e texto são obrigatórios');
      return;
    }

    setSubmitting(true);

    try {
      if (editingAviso) {
        // Atualizar aviso existente
        const updateData: UpdateAvisoData = {
          titulo: formData.titulo,
          texto: formData.texto,
          ativo: formData.ativo,
          removeBanner: removeBanner
        };

        if (selectedBanner) {
          updateData.banner = selectedBanner;
        }

        await avisosService.atualizarAviso(editingAviso.id!, updateData);
        alert('Aviso atualizado com sucesso!');
      } else {
        // Criar novo aviso
        const createData: CreateAvisoData = {
          titulo: formData.titulo,
          texto: formData.texto,
          ativo: formData.ativo
        };

        if (selectedBanner) {
          createData.banner = selectedBanner;
        }

        await avisosService.criarAviso(createData);
        alert('Aviso criado com sucesso!');
      }

      resetForm();
      loadAvisos();
    } catch (error) {
      console.error('Erro ao salvar aviso:', error);
      alert('Erro ao salvar aviso');
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar status do aviso
  const handleAlternarStatus = async (id: number) => {
    try {
      await avisosService.alternarStatus(id);
      loadAvisos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do aviso');
    }
  };

  // Excluir aviso
  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este aviso?')) {
      return;
    }

    try {
      await avisosService.excluirAviso(id);
      alert('Aviso excluído com sucesso!');
      loadAvisos();
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
      alert('Erro ao excluir aviso');
    }
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">
              {editingAviso ? 'Editar Aviso' : 'Novo Aviso'}
            </h1>
            <p className="text-slate-400 text-lg mt-1">
              {editingAviso ? 'Atualize as informações do aviso' : 'Crie um novo aviso para a dashboard'}
            </p>
          </div>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 p-6">
            {/* Título */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                placeholder="Digite o título do aviso"
                required
              />
            </div>

            {/* Texto */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Texto *
              </label>
              <textarea
                value={formData.texto}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                placeholder="Digite o conteúdo do aviso"
                required
              />
            </div>

            {/* Banner */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Banner (JPG - máximo 2MB)
              </label>
              
              {bannerPreview && (
                <div className="mb-4">
                  <img
                    src={bannerPreview}
                    alt="Preview do banner"
                    className="max-w-full h-48 object-cover rounded-lg border border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleRemoverBanner}
                    className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Remover Banner
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg"
                onChange={handleBannerChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-slate-900 hover:file:bg-cyan-400"
              />
              <p className="text-slate-400 text-xs mt-1">
                Apenas arquivos JPG são aceitos. Tamanho máximo: 2MB
              </p>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="mr-2 w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                />
                <span className="text-white text-sm">Aviso ativo</span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Salvando...' : (editingAviso ? 'Atualizar' : 'Criar Aviso')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-3xl font-bold">Gerenciar Avisos</h1>
          <p className="text-slate-400 text-lg mt-1">
            Crie e gerencie avisos para a dashboard pastoral
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleNovoAviso}
            className="px-4 py-2 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Novo Aviso
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-white">Carregando avisos...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {avisos.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-8 text-center">
              <div className="text-slate-400 mb-4">Nenhum aviso cadastrado</div>
              <button
                onClick={handleNovoAviso}
                className="px-6 py-3 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Criar Primeiro Aviso
              </button>
            </div>
          ) : (
            avisos.map((aviso) => (
              <div
                key={aviso.id}
                className="rounded-xl border border-slate-700 bg-slate-800/60 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white text-xl font-semibold">
                        {aviso.titulo}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          aviso.ativo
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {aviso.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-3">{aviso.texto}</p>
                    {aviso.banner_url && (
                      <div className="mb-3">
                        <img
                          src={aviso.banner_url}
                          alt="Banner do aviso"
                          className="max-w-xs h-24 object-cover rounded border border-slate-600"
                        />
                      </div>
                    )}
                    <div className="text-slate-400 text-sm">
                      Criado em: {new Date(aviso.created_at!).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleEditarAviso(aviso)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleAlternarStatus(aviso.id!)}
                      className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                        aviso.ativo
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {aviso.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleExcluir(aviso.id!)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AvisosView;

