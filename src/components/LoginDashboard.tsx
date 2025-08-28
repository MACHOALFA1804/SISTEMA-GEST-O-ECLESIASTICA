import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

interface SystemConfig {
  tituloSistema: string;
  subtituloSistema: string;
  corPrimaria: string;
  corSecundaria: string;
  versiculoBiblico: string;
  referenciaVersiculo: string;
  nomeIgreja: string;
  logoIgreja: string;
  mensagemBemVindo: string;
  textoRodape: string;
}

const LoginDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('recepcionista@igreja.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [config, setConfig] = useState<SystemConfig>({
    tituloSistema: 'TEFILIN v1',
    subtituloSistema: 'Sistema de Gestão de Visitantes',
    corPrimaria: '#22d3ee',
    corSecundaria: '#0f172a',
    versiculoBiblico: 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor',
    referenciaVersiculo: 'Colossenses 3:23',
    nomeIgreja: 'Assembleia de Deus Vila Evangélica',
    logoIgreja: '',
    mensagemBemVindo: 'Bem-vindo ao sistema de gestão de visitantes',
    textoRodape: 'DEV EMERSON 2025'
  });

  // Carregar configurações do sistema
  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    setConfigLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('chave, valor');

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data) {
        const newConfig = { ...config };
        
        data.forEach(item => {
          switch (item.chave) {
            case 'titulo_sistema':
              newConfig.tituloSistema = item.valor || newConfig.tituloSistema;
              break;
            case 'subtitulo_sistema':
              newConfig.subtituloSistema = item.valor || newConfig.subtituloSistema;
              break;
            case 'cor_primaria':
              newConfig.corPrimaria = item.valor || newConfig.corPrimaria;
              break;
            case 'cor_secundaria':
              newConfig.corSecundaria = item.valor || newConfig.corSecundaria;
              break;
            case 'versiculo_biblico':
              newConfig.versiculoBiblico = item.valor || newConfig.versiculoBiblico;
              break;
            case 'referencia_versiculo':
              newConfig.referenciaVersiculo = item.valor || newConfig.referenciaVersiculo;
              break;
            case 'nome_igreja':
              newConfig.nomeIgreja = item.valor || newConfig.nomeIgreja;
              break;
            case 'mensagem_bem_vindo':
              newConfig.mensagemBemVindo = item.valor || newConfig.mensagemBemVindo;
              break;
            case 'texto_rodape':
              newConfig.textoRodape = item.valor || newConfig.textoRodape;
              break;
          }
        });
        
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authService = AuthService.getInstance();
      const result = await authService.login(email, password);

      if (!result.success) {
        setError(result.error || 'Erro no login');
        return;
      }

      if (result.user) {
        // Redirecionar baseado no papel do usuário
        switch (result.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'pastor':
            navigate('/pastor');
            break;
          case 'recepcionista':
            navigate('/recepcao');
            break;
          case 'dizimista':
            navigate('/dizimista');
            break;
          default:
            setError('Papel de usuário não reconhecido');
        }
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Erro inesperado durante o login');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config.corSecundaria }}>
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        backgroundColor: config.corSecundaria,
        backgroundImage: `linear-gradient(135deg, ${config.corSecundaria} 0%, ${config.corSecundaria}dd 100%)`
      }}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: config.corPrimaria }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: config.corPrimaria }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          {/* Logo dinâmica */}
          {config.logoIgreja && (
            <div className="mb-6">
              <img
                src={config.logoIgreja}
                alt="Logo da Igreja"
                className="w-20 h-20 mx-auto object-contain rounded-full border-2"
                style={{ borderColor: config.corPrimaria }}
              />
            </div>
          )}
          
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: config.corPrimaria }}
          >
            {config.tituloSistema}
          </h1>
          <p className="text-slate-400 mb-2 text-lg">
            {config.subtituloSistema}
          </p>
          <p className="text-slate-500 text-sm">
            {config.nomeIgreja}
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8">
          {/* Ícone de usuário dinâmico */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-slate-900 text-2xl font-black"
              style={{ backgroundColor: config.corPrimaria }}
            >
              iA
            </div>
          </div>

          <h2 className="text-white text-xl font-semibold text-center mb-2">
            Acesso ao Sistema
          </h2>
          <p className="text-slate-400 text-center text-sm mb-6">
            {config.mensagemBemVindo}
          </p>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label htmlFor="email" className="block text-slate-300 text-sm font-medium mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-white"
                style={{ 
                  '--focus-ring-color': config.corPrimaria 
                } as React.CSSProperties}
                placeholder="seu@email.com"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-white"
                style={{ 
                  '--focus-ring-color': config.corPrimaria 
                } as React.CSSProperties}
                placeholder="••••••••"
                autoComplete="off"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg font-bold text-slate-900 shadow-md hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: config.corPrimaria,
                boxShadow: `0 4px 14px ${config.corPrimaria}30`
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Versículo Bíblico */}
        <div className="text-center mt-8">
          <blockquote className="text-slate-300 text-sm italic">
            "{config.versiculoBiblico}"
          </blockquote>
          <cite className="text-slate-500 text-xs mt-1 block">
            {config.referenciaVersiculo}
          </cite>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            {config.textoRodape}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginDashboard;