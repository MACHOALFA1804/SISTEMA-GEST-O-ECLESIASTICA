import React, { useState, useEffect, useCallback } from 'react';
import { avisosService, Aviso } from '../../services/avisosService';

const AvisosDisplay: React.FC = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAvisoAlert, setNewAvisoAlert] = useState(false);

  // Carregar avisos ativos
  const loadAvisosAtivos = useCallback(async () => {
    try {
      const data = await avisosService.listarAvisosAtivos();
      
      // Verificar se há novos avisos (comparar com estado anterior)
      if (avisos.length > 0 && data.length > avisos.length) {
        setNewAvisoAlert(true);
        setTimeout(() => setNewAvisoAlert(false), 3000); // Remove alerta após 3 segundos
      }
      
      setAvisos(data);
    } catch (error) {
      console.error('Erro ao carregar avisos ativos:', error);
    } finally {
      setLoading(false);
    }
  }, [avisos.length]);

  useEffect(() => {
    loadAvisosAtivos();

    // Configurar subscription para atualizações em tempo real
    const subscription = avisosService.subscribeToAvisos((avisosAtualizados) => {
      // Verificar se há novos avisos
      if (avisos.length > 0 && avisosAtualizados.length > avisos.length) {
        setNewAvisoAlert(true);
        setTimeout(() => setNewAvisoAlert(false), 3000);
      }
      setAvisos(avisosAtualizados);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadAvisosAtivos, avisos.length]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 grid place-items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 5.882V19.24a1 1 0 01-1.447.894L5.618 18H2a1 1 0 01-1-1V7a1 1 0 011-1h3.618l3.935-2.134A1 1 0 0111 4.76v1.122z"/>
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold">Avisos</h3>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        </div>
        <div className="text-slate-400 text-sm">Carregando avisos...</div>
      </div>
    );
  }

  if (avisos.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 grid place-items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 5.882V19.24a1 1 0 01-1.447.894L5.618 18H2a1 1 0 01-1-1V7a1 1 0 011-1h3.618l3.935-2.134A1 1 0 0111 4.76v1.122z"/>
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold">Avisos</h3>
        </div>
        <div className="text-slate-400 text-sm">Nenhum aviso ativo no momento</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com indicador de novos avisos */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 5.882V19.24a1 1 0 01-1.447.894L5.618 18H2a1 1 0 01-1-1V7a1 1 0 011-1h3.618l3.935-2.134A1 1 0 0111 4.76v1.122z"/>
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold">Avisos da Recepção</h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Atualização em tempo real"></div>
        {newAvisoAlert && (
          <div className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded animate-pulse">
            NOVO!
          </div>
        )}
        <div className="text-slate-400 text-sm">
          ({avisos.length} {avisos.length === 1 ? 'aviso' : 'avisos'})
        </div>
      </div>

      {/* Lista de avisos */}
      <div className="space-y-3">
        {avisos.map((aviso, index) => (
          <div
            key={aviso.id}
            className={`rounded-xl border border-purple-500/30 bg-slate-800/60 p-6 ${
              newAvisoAlert && index === 0 ? 'animate-pulse border-green-500/50' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Conteúdo do aviso */}
              <div className="flex-1">
                <h4 className="text-white text-lg font-semibold mb-2">
                  {aviso.titulo}
                </h4>
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  {aviso.texto}
                </p>
                <div className="text-slate-400 text-xs">
                  Publicado em: {new Date(aviso.created_at!).toLocaleString('pt-BR')}
                </div>
              </div>

              {/* Banner se disponível - OTIMIZADO PARA IMAGENS VERTICAIS */}
              {aviso.banner_url && (
                <div className="flex-shrink-0 w-full sm:w-40">
                  <img
                    src={aviso.banner_url}
                    alt={`Banner: ${aviso.titulo}`}
                    className="w-full h-48 sm:w-40 sm:h-60 object-contain bg-slate-900/50 rounded-lg border border-slate-600 shadow-lg"
                    onError={(e) => {
                      // Esconder imagem se houver erro no carregamento
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé com informações */}
      <div className="text-center">
        <div className="text-slate-500 text-xs">
          Avisos atualizados automaticamente • Última atualização: {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  );
};

export default AvisosDisplay;