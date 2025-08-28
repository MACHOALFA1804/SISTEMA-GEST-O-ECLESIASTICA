import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface WhatsAppConfigProps {
  onBack: () => void;
}

interface WhatsAppConfig {
  api_key: string;
  phone_number: string;
  webhook_url: string;
  auto_reply: boolean;
  business_hours: {
    start: string;
    end: string;
  };
}

const WhatsAppConfigView: React.FC<WhatsAppConfigProps> = ({ onBack }) => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    api_key: '',
    phone_number: '',
    webhook_url: '',
    auto_reply: false,
    business_hours: {
      start: '09:00',
      end: '18:00'
    }
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    mensagensEnviadas: 0,
    mensagensEntregues: 0,
    mensagensLidas: 0,
    falhasEnvio: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Carregar estatísticas de mensagens
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      
      // Buscar estatísticas de mensagens
      const { data: mensagens, error } = await supabase
        .from('mensagens')
        .select('*');

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      if (mensagens) {
        const statsData = {
          mensagensEnviadas: mensagens.filter(m => m.status_envio === 'Enviada').length,
          mensagensEntregues: mensagens.filter(m => m.status_envio === 'Enviada').length, // Placeholder
          mensagensLidas: mensagens.filter(m => m.status_envio === 'Enviada').length, // Placeholder
          falhasEnvio: mensagens.filter(m => m.status_envio === 'Falhada').length
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Aqui você implementaria a lógica para salvar as configurações
      console.log('Configurações salvas:', config);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-3xl font-bold">Configurações do WhatsApp</h1>
          <p className="text-slate-400 text-lg mt-1">Integração com WhatsApp Business</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Configuração */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            ⚙️ Configurações da API
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave da API
              </label>
              <input
                type="password"
                value={config.api_key}
                onChange={(e) => setConfig({...config, api_key: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua chave da API"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp
              </label>
              <input
                type="tel"
                value={config.phone_number}
                onChange={(e) => setConfig({...config, phone_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+55 11 99999-9999"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Webhook
              </label>
              <input
                type="url"
                value={config.webhook_url}
                onChange={(e) => setConfig({...config, webhook_url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://seu-dominio.com/webhook"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_reply"
                checked={config.auto_reply}
                onChange={(e) => setConfig({...config, auto_reply: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto_reply" className="ml-2 block text-sm text-gray-700">
                Ativar resposta automática
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={config.business_hours.start}
                  onChange={(e) => setConfig({
                    ...config, 
                    business_hours: {...config.business_hours, start: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Fim
                </label>
                <input
                  type="time"
                  value={config.business_hours.end}
                  onChange={(e) => setConfig({
                    ...config, 
                    business_hours: {...config.business_hours, end: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </form>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            📊 Estatísticas de Uso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : stats.mensagensEnviadas}
              </div>
              <div className="text-sm text-gray-600">Mensagens Enviadas</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : stats.mensagensEntregues}
              </div>
              <div className="text-sm text-gray-600">Mensagens Entregues</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {statsLoading ? '...' : stats.mensagensLidas}
              </div>
              <div className="text-sm text-gray-600">Mensagens Lidas</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? '...' : stats.falhasEnvio}
              </div>
              <div className="text-sm text-gray-600">Falhas de Envio</div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">ℹ️ Informações</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Configure sua chave da API do WhatsApp Business</li>
              <li>• Adicione o número principal da igreja</li>
              <li>• Configure webhook para receber notificações</li>
              <li>• Defina horários de atendimento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfigView;
