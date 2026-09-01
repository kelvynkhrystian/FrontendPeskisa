import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, ArrowRight, Loader2 } from 'lucide-react';
import { configService } from '../../services/configService';
import { authService } from '../../services/authService';
import toast, { Toaster } from 'react-hot-toast';

export function Login() {
  const { theme, toggleTheme, setPrimaryColor, nomeApp } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [sloganApp, setSloganApp] = useState('Entre com suas credenciais!');
  const [logoPadrao, setLogoPadrao] = useState<string | null>(null);

  // Define o título da página
  useEffect(() => {
    document.title = `Login - ${nomeApp || 'Peskisa'}`;
  }, [nomeApp]);

  // Busca as configurações usando o configService estruturado
  useEffect(() => {
    configService
      .getConfig()
      .then((data) => {
        const responseData = data.config || data;
        if (responseData) {
          if (responseData.slogan_app) {
            setSloganApp(responseData.slogan_app);
          }
          if (responseData.logo_padrao) {
            setLogoPadrao(responseData.logo_padrao);
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar configurações na API:', error);
      });
  }, []);

  // Função de login integrada com authService e toast
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha o e-mail e a senha!');
      return;
    }

    try {
      setLoading(true);

      // Usa o serviço de autenticação
      await authService.login({ email, senha: password });

      toast.success('Login efetuado com sucesso!');

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        err.response?.data?.error || 'E-mail ou senha inválidos.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      <Toaster position="top-right" reverseOrder={false} />

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

      <main className="flex-1 flex items-center justify-center px-8 pb-12">
        <div
          className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all border ${
            theme === 'dark'
              ? 'bg-[#1a1a1e] border-[#29292e]'
              : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mt-4 mb-4 flex items-center justify-center min-h-[4rem]">
              {logoPadrao ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:3333'}${logoPadrao.startsWith('/') ? '' : '/'}${logoPadrao}`}
                  alt="Logo"
                  className="w-50 object-contain"
                />
              ) : (
                <svg
                  viewBox="0 0 8411.01 8411.01"
                  className="w-32 h-auto object-contain transition-colors duration-300"
                >
                  <g id="Layer_x0020_1">
                    <path
                      fill="var(--primary-color)"
                      d="M6045.41 5946.84c154.44,0 165.22,58.45 283.38,176.61l1051.37 1051.37c158.8,158.8 406.59,343.91 406.59,496.94 0,21.58 -92.01,217.77 -275.39,28.98l-1486.78 -1470.22c-45.05,-44.11 -86.38,-83.74 -85.17,-150.13 1.08,-59.82 51.49,-133.55 106,-133.55zm-3120.42 -5946.84l196.28 0c507.67,0 1152.39,246.78 1570.16,549.02l290.16 235.53c263.28,231.84 499.97,567.93 664.27,896.35 72.16,144.23 147.49,346.82 189.34,517.05 104.59,425.43 95.22,472.63 95.22,890.46 0,497.96 -225.72,1179.32 -511.41,1558.5 -45.91,60.93 -76.34,97.4 -108.81,162.37l538.06 546.16c311.73,-149.58 660.43,59.53 874.8,275.15l1232.06 1232.1c187.29,187.29 455.87,414.68 455.87,776.21 0,428.62 -335.63,738.87 -707.36,772.1l-131.73 0c-136.6,-12.31 -273.31,-63.52 -395.83,-161.44l-1684.65 -1683.03c-202.77,-239.09 -186.27,-456.59 -140.04,-714.21l-538.08 -546.16c-51.41,34.43 -109.34,78.42 -161.71,117.56 -376.89,281.6 -873.47,429.48 -1342.32,497.58 -604.12,87.76 -1215.74,-73.45 -1721.52,-330.15 -203.29,-103.18 -469.19,-289.81 -622.51,-445.29 -28.28,-28.67 -36.78,-35.74 -68.87,-62.55 -83.81,-70.02 -237.13,-256.14 -307.36,-349.75 -386.23,-514.85 -589.03,-1105.85 -589.03,-1776.57 0,-206.98 31.05,-474.29 75.45,-647.37 27.63,-107.71 45.08,-182.54 78.54,-282.87 34.53,-103.53 62.17,-164.44 101.79,-259.61 120.74,-289.93 237.15,-441.13 410.49,-673.75 56.62,-76.01 108.84,-116.36 169.08,-192.32 56.78,-71.6 120.87,-106.31 187.21,-174.21 259.43,-265.55 802.83,-535.28 1178.74,-628.32 350.18,-86.68 465.09,-97.47 723.7,-98.54zm-2300.74 3006.28c0,-286.85 37.39,-553.55 129.33,-807.05 184.62,-509.1 454.66,-843.57 877.27,-1159.76 673.26,-503.74 1743.04,-575.6 2466.68,-142.96 320.51,191.62 254.54,158.45 513.85,373.25 62.73,51.95 78.57,92.52 131.94,147.33 58.62,60.19 83.77,96.55 133.41,162.29 590.65,782.32 596.02,1980.71 4.63,2759.88 -42.17,55.56 -71.21,108.33 -121.1,158.17 -27.37,27.35 -48.41,44.3 -73.37,74.48 -483.11,584.45 -1434.07,871.05 -2212.89,691.56 -272.9,-62.89 -319.92,-99.07 -533.44,-189.37 -46.94,-19.85 -49.43,-26.1 -95.66,-52.2 -271.94,-153.5 -235.57,-154.2 -429.68,-309.56 -36.34,-29.09 -44.86,-31.62 -80.8,-67.06 -170.97,-168.6 -388.83,-456.26 -484.94,-681.43 -113.33,-265.5 -225.23,-586.95 -225.23,-957.56z"
                    />
                    <path
                      fill={theme === 'dark' ? '#1a1a1e' : '#ffffff'}
                      d="M2382.01 1823.48c106.32,0 162.91,-39.21 249.38,-62.74 394.16,-107.23 875.81,2.16 1175.93,280.2 196.78,182.3 344.56,421.53 393.89,690.34 23.1,125.88 12.51,197.06 72.14,289.28 99.44,153.75 310.23,179.28 461.2,54.8 208.4,-171.84 35.72,-702.76 -41.61,-868.66 -83.29,-178.69 -149.64,-278.98 -264.32,-425.65 -434.14,-555.22 -1252.47,-824.53 -1955.33,-621.97 -199.04,57.36 -344.81,88.9 -392.08,299.23 -41.14,183.06 110.31,365.17 300.8,365.17z"
                    />
                    <polygon
                      fill={theme === 'dark' ? '#1a1a1e' : '#ffffff'}
                      points="3613.24,4387.65 2840.83,3229.06 3595.93,2473.95 3077.16,2473.95 2345.14,3252.13 2345.14,2473.95 1950.29,2473.95 1950.29,4387.65 2345.14,4387.65 2345.14,3736.3 2558.4,3525.91 3126.17,4387.65"
                    />
                  </g>
                </svg>
              )}
            </div>

            {!logoPadrao && (
              <h1 className="text-4xl font-bold tracking-tight">
                {nomeApp || 'Peskisa'}
                <span style={{ color: 'var(--primary-color)' }}>.</span>
              </h1>
            )}

            <p
              className={`text-lg mt-2 px-2 select-none font-bold ${
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {sloganApp}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
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
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 text-center text-xs space-y-1 select-none border-t border-zinc-500/10">
            <p className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}>
              Versão 1.0 • {nomeApp || 'Peskisa'}
            </p>
            <p className={theme === 'dark' ? 'text-zinc-600' : 'text-zinc-500'}>
              Desenvolvido por{' '}
              <a
                href="https://kelvynk.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
                style={{ color: 'var(--primary-color)' }}
              >
                kelvynk
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
