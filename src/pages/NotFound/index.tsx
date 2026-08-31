import { useTheme } from '../../contexts/ThemeContext';
import { Ghost, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function NotFound() {
  const { theme, nomeApp } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Página não encontrada - ${nomeApp || 'Peskisa'}`;
  }, [nomeApp]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl text-center border transition-all ${
          theme === 'dark'
            ? 'bg-[#1a1a1e] border-[#29292e]'
            : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}
          >
            <Ghost size={48} />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight mb-2">404</h1>

        <h2 className="text-xl font-bold mb-3">Página não encontrada</h2>

        <p
          className={`text-sm mb-8 ${
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          Oops! A página que você está tentando acessar não existe ou foi
          movida.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3.5 px-4 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar para a página anterior</span>
        </button>
      </div>

      <div className="mt-8 text-center text-xs">
        <p className={theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}>
          {nomeApp || 'Peskisa'} • Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
