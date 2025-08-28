import React, { useState, useEffect } from 'react';
import { AdminService, UsuarioSistema } from '../../services/adminService';
import { supabase } from '../../lib/supabase';

interface GerenciamentoUsuariosViewProps {
  onBack: () => void;
}

interface ProfileRow {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  role: 'admin' | 'pastor' | 'recepcionista';
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'pastor' | 'recepcionista';
  ativo: boolean;
}

const GerenciamentoUsuariosView: React.FC<GerenciamentoUsuariosViewProps> = ({ onBack }) => {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioSistema | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nome_completo: '',
    tipo_usuario: 'usuario' as 'admin' | 'pastor' | 'dizimista' | 'recepcao' | 'usuario',
    telefone: '',
    cargo: '',
    observacoes: '',
    permissoes: {
      gerenciar_usuarios: false,
      editar_configuracoes: false,
      personalizar_tema: false,
      gerenciar_nichos: false,
      acessar_logs: false,
      editar_relatorios: false,
      acessar_admin: false,
      acessar_pastor: false,
      acessar_recepcao: false,
      acessar_dizimista: false
    }
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const lista = await AdminService.obterUsuarios();
      setUsuarios(lista);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('permissoes.')) {
        const permissao = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          permissoes: {
            ...prev.permissoes,
            [permissao]: checked
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTipoUsuarioChange = (tipo: string) => {
    let permissoesDefault = {
      gerenciar_usuarios: false,
      editar_configuracoes: false,
      personalizar_tema: false,
      gerenciar_nichos: false,
      acessar_logs: false,
      editar_relatorios: false,
      acessar_admin: false,
      acessar_pastor: false,
      acessar_recepcao: false,
      acessar_dizimista: false
    };

    switch (tipo) {
      case 'admin':
        permissoesDefault = {
          ...permissoesDefault,
          gerenciar_usuarios: true,
          editar_configuracoes: true,
          personalizar_tema: true,
          gerenciar_nichos: true,
          acessar_logs: true,
          editar_relatorios: true,
          acessar_admin: true
        };
        break;
      case 'pastor':
        permissoesDefault = {
          ...permissoesDefault,
          acessar_pastor: true,
          editar_relatorios: true
        };
        break;
      case 'recepcao':
        permissoesDefault = {
          ...permissoesDefault,
          acessar_recepcao: true
        };
        break;
      case 'dizimista':
        permissoesDefault = {
          ...permissoesDefault,
          acessar_dizimista: true
        };
        break;
    }

    setFormData(prev => ({
      ...prev,
      tipo_usuario: tipo as any,
      permissoes: permissoesDefault
    }));
  };

  const abrirModal = (usuario?: UsuarioSistema) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        email: usuario.email,
        nome_completo: usuario.nome_completo,
        tipo_usuario: usuario.tipo_usuario,
        telefone: usuario.telefone || '',
        cargo: usuario.cargo || '',
        observacoes: usuario.observacoes || '',
        permissoes: (usuario.permissoes as any) || {
          gerenciar_usuarios: false,
          editar_configuracoes: false,
          personalizar_tema: false,
          gerenciar_nichos: false,
          acessar_logs: false,
          editar_relatorios: false,
          acessar_admin: false,
          acessar_pastor: false,
          acessar_recepcao: false,
          acessar_dizimista: false
        }
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        nome_completo: '',
        tipo_usuario: 'usuario',
        telefone: '',
        cargo: '',
        observacoes: '',
        permissoes: {
          gerenciar_usuarios: false,
          editar_configuracoes: false,
          personalizar_tema: false,
          gerenciar_nichos: false,
          acessar_logs: false,
          editar_relatorios: false,
          acessar_admin: false,
          acessar_pastor: false,
          acessar_recepcao: false,
          acessar_dizimista: false
        }
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.nome_completo) {
      setMessage({ type: 'error', text: 'Email e nome são obrigatórios' });
      return;
    }

    try {
      if (editingUser) {
        await AdminService.atualizarUsuario(editingUser.id!, formData);
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
      } else {
        // Para novos usuários, gerar senha temporária
        const novoUsuario = {
          ...formData,
          senha_hash: 'temp_password_hash', // Implementar hash real
          ativo: true
        };
        await AdminService.criarUsuario(novoUsuario);
        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      }
      
      await carregarUsuarios();
      setTimeout(() => {
        fecharModal();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setMessage({ type: 'error', text: `Erro ao salvar usuário: ${error.message}` });
    }
  };

  const showConfirmDialog = (message: string): boolean => {
    return window.confirm(message);
  };

  const handleDesativar = async (usuarioId: string) => {
    if (!showConfirmDialog('Tem certeza que deseja desativar este usuário?')) return;

    try {
      await AdminService.desativarUsuario(usuarioId);
      setMessage({ type: 'success', text: 'Usuário desativado com sucesso!' });
      await carregarUsuarios();
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      setMessage({ type: 'error', text: 'Erro ao desativar usuário' });
    }
  };

  const getTipoUsuarioColor = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'text-red-400 bg-red-500/20';
      case 'pastor':
        return 'text-purple-400 bg-purple-500/20';
      case 'recepcao':
        return 'text-blue-400 bg-blue-500/20';
      case 'dizimista':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
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
            <h1 className="text-white text-2xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-slate-400 text-sm">Criar e gerenciar usuários do sistema</p>
          </div>
        </div>
        <button
          onClick={() => abrirModal()}
          className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md shadow-green-500/30 hover:bg-green-400 transition-colors"
        >
          Novo Usuário
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

      {/* Lista de Usuários */}
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
            <h2 className="text-white text-lg font-semibold">Usuários do Sistema</h2>
            <p className="text-slate-400 text-sm">
              {loading ? 'Carregando...' : `${usuarios.length} usuários cadastrados`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Carregando usuários...</div>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Nenhum usuário encontrado</div>
          </div>
        ) : (
          <>
            {/* Tabela para desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Nome</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Email</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Tipo</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Status</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Último Login</th>
                    <th className="text-left text-slate-300 font-medium py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-2">
                        <div className="text-white font-medium">{usuario.nome_completo}</div>
                        {usuario.cargo && (
                          <div className="text-slate-400 text-sm">{usuario.cargo}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {usuario.email}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoUsuarioColor(usuario.tipo_usuario)}`}>
                          {usuario.tipo_usuario}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.ativo 
                            ? 'text-green-400 bg-green-500/20' 
                            : 'text-red-400 bg-red-500/20'
                        }`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-sm">
                        {formatarData(usuario.ultimo_login)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModal(usuario)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                          >
                            Editar
                          </button>
                          {usuario.ativo && (
                            <button
                              onClick={() => handleDesativar(usuario.id!)}
                              className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm hover:bg-red-500/30 transition-colors"
                            >
                              Desativar
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
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium">{usuario.nome_completo}</h3>
                      <p className="text-slate-400 text-sm">{usuario.email}</p>
                      {usuario.cargo && (
                        <p className="text-slate-400 text-xs">{usuario.cargo}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoUsuarioColor(usuario.tipo_usuario)}`}>
                        {usuario.tipo_usuario}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.ativo 
                          ? 'text-green-400 bg-green-500/20' 
                          : 'text-red-400 bg-red-500/20'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-slate-400 text-sm mb-3">
                    Último login: {formatarData(usuario.ultimo_login)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(usuario)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      Editar
                    </button>
                    {usuario.ativo && (
                      <button
                        onClick={() => handleDesativar(usuario.id!)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm hover:bg-red-500/30 transition-colors"
                      >
                        Desativar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Tipo de Usuário *
                  </label>
                  <select
                    name="tipo_usuario"
                    value={formData.tipo_usuario}
                    onChange={(e) => handleTipoUsuarioChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    required
                  >
                    <option value="usuario">Usuário</option>
                    <option value="dizimista">Dizimista</option>
                    <option value="recepcao">Recepção</option>
                    <option value="pastor">Pastor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              {/* Permissões */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                  Permissões
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(formData.permissoes).map(([permissao, valor]) => (
                    <label key={permissao} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={`permissoes.${permissao}`}
                        checked={valor}
                        onChange={handleInputChange}
                        className="rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-slate-300 text-sm">
                        {permissao.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              {/* Botões */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-400 text-slate-900 font-bold rounded-lg shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </button>
                
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-5 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default GerenciamentoUsuariosView;