import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, ArrowRight, Loader2 } from 'lucide-react';
import fallbackLogo from '../../assets/react.svg';
import { api } from '../../services/api';

export function Login() {
  const { theme, toggleTheme, setPrimaryColor } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados vindos da API com valores iniciais seguros
  const [nomeApp, setNomeApp] = useState('Peskisa');
  const [sloganApp, setSloganApp] = useState(
    'Entre com suas credenciais para acessar o painel'
  );
  const [logoPadrao, setLogoPadrao] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    api
      .get('/api/config')
      .then((response) => {
        console.log('--- DADOS DA API /config ---', response.data);

        if (response.data) {
          if (response.data.nome_app) {
            setNomeApp(response.data.nome_app);
            document.title = response.data.nome_app;
          }
          if (response.data.slogan_app) {
            setSloganApp(response.data.slogan_app);
          }
          if (response.data.logo_padrao) {
            console.log('Logo encontrada:', response.data.logo_padrao);
            setLogoPadrao(response.data.logo_padrao);
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar configurações na API:', error);
      })
      .finally(() => {
        setLoadingConfig(false);
      });
  }, []); // <-- Removido o setPrimaryColor daqui de dentro

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Login efetuado com sucesso!');
  };

  // Monta a URL da logo de forma limpa usando a variável de ambiente e tratando a barra inicial
  const logoUrl = logoPadrao
    ? `${import.meta.env.VITE_API_URL}${logoPadrao.startsWith('/') ? '' : '/'}${logoPadrao}`
    : fallbackLogo;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      {/* Topo com os seletores de cor e botão de tema */}
      <header className="flex justify-between items-center p-6">
        <div
          className={`flex items-center gap-2 p-2 rounded-xl border ${
            theme === 'dark'
              ? 'bg-zinc-800/40 border-zinc-700/50'
              : 'bg-transparent border-zinc-900'
          }`}
        >
          <span
            className={`text-xs mr-1 font-semibold ${
              theme === 'dark' ? 'text-zinc-400' : 'text-black'
            }`}
          >
            Cor:
          </span>
          <button
            onClick={() => setPrimaryColor('orange')}
            className="w-5 h-5 rounded-full bg-orange-500 cursor-pointer hover:scale-110 transition-transform"
            title="Laranja"
          />
          <button
            onClick={() => setPrimaryColor('blue')}
            className="w-5 h-5 rounded-full bg-blue-600 cursor-pointer hover:scale-110 transition-transform"
            title="Azul"
          />
          <button
            onClick={() => setPrimaryColor('purple')}
            className="w-5 h-5 rounded-full bg-purple-600 cursor-pointer hover:scale-110 transition-transform"
            title="Roxo"
          />
          <button
            onClick={() => setPrimaryColor('emerald')}
            className="w-5 h-5 rounded-full bg-emerald-600 cursor-pointer hover:scale-110 transition-transform"
            title="Verde"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer bg-[#202024] text-white hover:bg-[#29292e]"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Conteúdo Central: Login */}
      <main className="flex-1 flex items-center justify-center px-8 pb-12">
        <div
          className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all border ${
            theme === 'dark'
              ? 'bg-[#1a1a1e] border-[#29292e]'
              : 'bg-white border-zinc-200'
          }`}
        >
          {/* Logo e Títulos */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-4 flex items-center justify-center min-h-[4rem]">
              {loadingConfig ? (
                <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
              ) : (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-24 h-24 object-contain"
                />
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              {loadingConfig ? 'Carregando...' : nomeApp}
              <span style={{ color: 'var(--primary-color)' }}>.</span>
            </h1>

            <p
              className={`text-lg mt-2 px-2 select-none ${
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {loadingConfig ? 'Buscando informações...' : sloganApp}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                  theme === 'dark'
                    ? 'bg-[#121214] border-[#29292e] text-white'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                  theme === 'dark'
                    ? 'bg-[#121214] border-[#29292e] text-white'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 px-4 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <span>Entrar</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
