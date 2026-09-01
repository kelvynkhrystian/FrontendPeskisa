import { useTheme } from '../../../contexts/ThemeContext';

export function Pesquisas() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciamento de Pesquisas</h1>
      <div
        className={`p-6 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-[#1a1a1e] border-[#29292e]'
            : 'bg-white border-zinc-200'
        }`}
      >
        <p className="text-sm text-zinc-400">
          Conteúdo da página de Pesquisas em construção...
        </p>
      </div>
    </div>
  );
}
