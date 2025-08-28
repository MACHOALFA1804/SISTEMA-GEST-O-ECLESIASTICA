import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface BackupViewProps {
  onBack: () => void;
}

interface BackupInfo {
  id: string;
  nome: string;
  tipo: 'manual' | 'automatico';
  status: 'sucesso' | 'erro' | 'processando';
  tamanho: string;
  data: string;
  observacoes?: string;
}

interface ConfigBackup {
  backupAutomatico: boolean;
  frequencia: 'diario' | 'semanal' | 'mensal';
  horario: string;
  manterBackups: number;
  incluirArquivos: boolean;
  compactarBackup: boolean;
  emailNotificacao: string;
  notificarErros: boolean;
}

const BackupView: React.FC<BackupViewProps> = ({ onBack }) => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [executandoBackup, setExecutandoBackup] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const [configBackup, setConfigBackup] = useState<ConfigBackup>({
    backupAutomatico: true,
    frequencia: 'diario',
    horario: '02:00',
    manterBackups: 30,
    incluirArquivos: true,
    compactarBackup: true,
    emailNotificacao: '',
    notificarErros: true
  });

  // Simular dados de backup para demonstração
  const backupsSimulados: BackupInfo[] = [
    {
      id: '1',
      nome: 'backup_2025_01_20_02_00.sql',
      tipo: 'automatico',
      status: 'sucesso',
      tamanho: '2.3 MB',
      data: '2025-01-20T02:00:00Z',
      observacoes: 'Backup automático diário'
    },
    {
      id: '2',
      nome: 'backup_manual_2025_01_19_15_30.sql',
      tipo: 'manual',
      status: 'sucesso',
      tamanho: '2.1 MB',
      data: '2025-01-19T15:30:00Z',
      observacoes: 'Backup antes da atualização do sistema'
    },
    {
      id: '3',
      nome: 'backup_2025_01_19_02_00.sql',
      tipo: 'automatico',
      status: 'sucesso',
      tamanho: '2.0 MB',
      data: '2025-01-19T02:00:00Z'
    }
  ];

  const loadBackups = async () => {
    setLoading(true);
    
    try {
      // Simular carregamento de backups
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups(backupsSimulados);

    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar lista de backups' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const executarBackupManual = async () => {
    setExecutandoBackup(true);
    setMessage({ type: 'info', text: 'Iniciando backup manual...' });

    try {
      // Simular processo de backup
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simular backup bem-sucedido
      const novoBackup: BackupInfo = {
        id: Date.now().toString(),
        nome: `backup_manual_${new Date().toISOString().replace(/[:.]/g, '_').split('T')[0]}_${new Date().toTimeString().slice(0, 5).replace(':', '_')}.sql`,
        tipo: 'manual',
        status: 'sucesso',
        tamanho: '2.4 MB',
        data: new Date().toISOString(),
        observacoes: 'Backup manual executado pelo administrador'
      };

      setBackups(prev => [novoBackup, ...prev]);
      setMessage({ type: 'success', text: 'Backup manual executado com sucesso!' });

    } catch (error: any) {
      console.error('Erro ao executar backup:', error);
      setMessage({ type: 'error', text: `Erro ao executar backup: ${error.message}` });
    } finally {
      setExecutandoBackup(false);
    }
  };

  const downloadBackup = async (backup: BackupInfo) => {
    try {
      setMessage({ type: 'info', text: 'Preparando download...' });
      
      // Simular geração do arquivo de backup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar conteúdo simulado do backup
      const backupContent = `-- Backup do Sistema TEFILIN v1
-- Data: ${new Date(backup.data).toLocaleString('pt-BR')}
-- Tipo: ${backup.tipo}
-- Observações: ${backup.observacoes || 'Sem observações'}

-- =============================================
-- DADOS DOS VISITANTES
-- =============================================
CREATE TABLE visitantes (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  tipo VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- DADOS DOS USUÁRIOS
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- CONFIGURAÇÕES DO SISTEMA
-- =============================================
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY,
  chave VARCHAR(255) UNIQUE,
  valor TEXT,
  categoria VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fim do backup
`;

      // Criar e baixar arquivo
      const blob = new Blob([backupContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.nome;
      link.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Download iniciado com sucesso!' });

    } catch (error: any) {
      console.error('Erro no download:', error);
      setMessage({ type: 'error', text: `Erro no download: ${error.message}` });
    }
  };

  const excluirBackup = async (backup: BackupInfo) => {
    if (!window.confirm(`Tem certeza que deseja excluir o backup "${backup.nome}"?`)) {
      return;
    }

    try {
      setBackups(prev => prev.filter(b => b.id !== backup.id));
      setMessage({ type: 'success', text: 'Backup excluído com sucesso!' });

    } catch (error: any) {
      console.error('Erro ao excluir backup:', error);
      setMessage({ type: 'error', text: `Erro ao excluir backup: ${error.message}` });
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Configurações de backup salvas com sucesso!' });

    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: `Erro ao salvar configurações: ${error.message}` });
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setConfigBackup(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseInt(value) : value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'erro':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'processando':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'manual':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'automatico':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Backup do Sistema</h2>
              <p className="text-slate-400 text-sm">Gerenciamento e configuração de backups</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
            >
              ← Voltar
            </button>
            <button
              onClick={executarBackupManual}
              disabled={executandoBackup}
              className="px-4 py-2 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 disabled:opacity-50"
            >
              {executandoBackup ? 'Executando...' : '💾 Backup Manual'}
            </button>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Backups */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Histórico de Backups</h3>
            
            {loading ? (
              <div className="text-center text-slate-400 py-8">
                Carregando backups...
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                Nenhum backup encontrado
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{backup.nome}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getTipoColor(backup.tipo)}`}>
                          {backup.tipo === 'manual' ? 'Manual' : 'Automático'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusColor(backup.status)}`}>
                          {backup.status === 'sucesso' ? 'Sucesso' : 
                           backup.status === 'erro' ? 'Erro' : 'Processando'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {backup.tamanho}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-slate-300 text-sm">
                        <div>{new Date(backup.data).toLocaleString('pt-BR')}</div>
                        {backup.observacoes && (
                          <div className="text-slate-400 text-xs mt-1">{backup.observacoes}</div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadBackup(backup)}
                          title="Download"
                          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => excluirBackup(backup)}
                          title="Excluir"
                          className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configurações de Backup */}
        <div className="space-y-6">
          {/* Status Atual */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Status do Sistema</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Backup Automático</span>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  configBackup.backupAutomatico 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {configBackup.backupAutomatico ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Último Backup</span>
                <span className="text-slate-400 text-sm">
                  {backups[0] ? new Date(backups[0].data).toLocaleDateString('pt-BR') : 'Nunca'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Próximo Backup</span>
                <span className="text-slate-400 text-sm">
                  {configBackup.backupAutomatico ? 'Amanhã 02:00' : 'Desabilitado'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Espaço Usado</span>
                <span className="text-slate-400 text-sm">
                  {backups.reduce((total, backup) => {
                    const size = parseFloat(backup.tamanho.replace(' MB', ''));
                    return total + size;
                  }, 0).toFixed(1)} MB
                </span>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Configurações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="backupAutomatico"
                  checked={configBackup.backupAutomatico}
                  onChange={handleConfigChange}
                  className="rounded"
                />
                <label className="text-slate-300">Backup automático</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Frequência
                </label>
                <select
                  name="frequencia"
                  value={configBackup.frequencia}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  name="horario"
                  value={configBackup.horario}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Manter backups (dias)
                </label>
                <input
                  type="number"
                  name="manterBackups"
                  value={configBackup.manterBackups}
                  onChange={handleConfigChange}
                  min="7"
                  max="365"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="incluirArquivos"
                  checked={configBackup.incluirArquivos}
                  onChange={handleConfigChange}
                  className="rounded"
                />
                <label className="text-slate-300">Incluir arquivos</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="compactarBackup"
                  checked={configBackup.compactarBackup}
                  onChange={handleConfigChange}
                  className="rounded"
                />
                <label className="text-slate-300">Compactar backup</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-mail para notificações
                </label>
                <input
                  type="email"
                  name="emailNotificacao"
                  value={configBackup.emailNotificacao}
                  onChange={handleConfigChange}
                  placeholder="admin@igreja.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="notificarErros"
                  checked={configBackup.notificarErros}
                  onChange={handleConfigChange}
                  className="rounded"
                />
                <label className="text-slate-300">Notificar erros</label>
              </div>

              <button
                onClick={salvarConfiguracoes}
                className="w-full px-4 py-2 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <h4 className="text-white font-semibold mb-2">Instruções Importantes:</h4>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• Backups automáticos são executados no horário configurado</li>
          <li>• Mantenha sempre backups recentes para segurança dos dados</li>
          <li>• Teste periodicamente a restauração dos backups</li>
          <li>• Armazene backups importantes em local externo seguro</li>
          <li>• Backups antigos são removidos automaticamente conforme configuração</li>
        </ul>
      </div>
    </main>
  );
};

export default BackupView;
