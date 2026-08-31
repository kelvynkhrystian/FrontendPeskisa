import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  title: string;
  setMobileMenuOpen: (open: boolean) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function Header({
  title,
  setMobileMenuOpen,
  notificationCount = 0,
  onNotificationClick,
}: HeaderProps) {
  const { theme, toggleTheme, setPrimaryColor } = useTheme();

  return (
    <header
      className={`h-20 flex items-center justify-between px-6 border-b ${
        theme === 'dark'
          ? 'bg-[#1a1a1e] border-[#29292e]'
          : 'bg-white border-zinc-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-zinc-500/10 cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Seletor de Cores */}
        <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-xl border border-zinc-500/20">
          <button
            onClick={() => setPrimaryColor('orange')}
            className="w-4 h-4 rounded-full bg-orange-500 hover:scale-110 transition-transform cursor-pointer"
          />
          <button
            onClick={() => setPrimaryColor('blue')}
            className="w-4 h-4 rounded-full bg-blue-600 hover:scale-110 transition-transform cursor-pointer"
          />
          <button
            onClick={() => setPrimaryColor('purple')}
            className="w-4 h-4 rounded-full bg-purple-600 hover:scale-110 transition-transform cursor-pointer"
          />
          <button
            onClick={() => setPrimaryColor('emerald')}
            className="w-4 h-4 rounded-full bg-emerald-600 hover:scale-110 transition-transform cursor-pointer"
          />
        </div>

        {/* Tema */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notificações Dinâmicas */}
        <button
          onClick={onNotificationClick}
          className="p-2.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/25 transition-all relative cursor-pointer"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>
      </div>
    </header>
  );
}
