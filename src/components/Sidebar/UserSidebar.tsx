import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  Search,
  Send,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { configService } from '../../services/configService';

interface UserSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function UserSidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}: UserSidebarProps) {
  const { theme, toggleTheme, setPrimaryColor } = useTheme();
  const [logoPadrao, setLogoPadrao] = useState<string | null>(null);

  useEffect(() => {
    configService
      .getConfig()
      .then((data) => {
        const responseData = data.config || data;
        if (responseData) {
          const logoUrl =
            responseData.logo_horizontal ||
            responseData.logo_padrao ||
            responseData.logo;

          if (logoUrl) {
            setLogoPadrao(logoUrl);
          }
        }
      })
      .catch((error) => console.error('Erro ao buscar configurações:', error));
  }, []);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r ${
        sidebarOpen ? 'w-64' : 'w-16'
      } ${
        theme === 'dark'
          ? 'bg-[#1a1a1e] border-[#29292e]'
          : 'bg-white border-zinc-200'
      } lg:static ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Topo da Sidebar */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-500/15">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center shrink-0 h-10 text-white">
            {logoPadrao ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3333'}${logoPadrao.startsWith('/') ? '' : '/'}${logoPadrao}`}
                alt="Logo"
                className={`h-full object-contain transition-all ${
                  sidebarOpen ? 'block w-40' : 'hidden'
                }`}
              />
            ) : null}
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-zinc-500/10 text-zinc-400 cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-500/10 text-zinc-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* Links de navegação do Entrevistador com NavLink */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        <div>
          {sidebarOpen && (
            <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Menu de Campo
            </p>
          )}
          <nav className="space-y-1">
            <NavLink
              to="/user/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--primary-color)' } : {}
              }
            >
              <LayoutDashboard size={20} className="shrink-0" />
              {sidebarOpen && <span>Início</span>}
            </NavLink>

            <NavLink
              to="/user/pesquisas"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--primary-color)' } : {}
              }
            >
              <Search size={20} className="shrink-0" />
              {sidebarOpen && <span className="flex-1">Pesquisas</span>}
              {sidebarOpen && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                  4
                </span>
              )}
            </NavLink>

            <NavLink
              to="/user/envios"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--primary-color)' } : {}
              }
            >
              <Send size={20} className="shrink-0" />
              {sidebarOpen && <span className="flex-1">Envios</span>}
              {sidebarOpen && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold"
                  title="Pendentes offline"
                >
                  0
                </span>
              )}
            </NavLink>
          </nav>
        </div>

        <div>
          {sidebarOpen && (
            <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Sistema
            </p>
          )}
          <nav className="space-y-1">
            <NavLink
              to="/user/configuracoes"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--primary-color)' } : {}
              }
            >
              <Settings size={20} className="shrink-0" />
              {sidebarOpen && <span>Configurações</span>}
            </NavLink>

            <NavLink
              to="/user/suporte"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--primary-color)' } : {}
              }
            >
              <HelpCircle size={20} className="shrink-0" />
              {sidebarOpen && <span>Suporte</span>}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-3 border-t border-zinc-500/15 space-y-3">
        {sidebarOpen ? (
          <div className="p-3 rounded-xl bg-zinc-500/5 border border-zinc-500/10 space-y-2.5 lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Palette size={14} /> Aparência
              </span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/25 transition-all text-zinc-300 cursor-pointer"
                title="Alternar Tema"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => setPrimaryColor('orange')}
                className="h-6 rounded-lg bg-orange-500 hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
                title="Laranja"
              />
              <button
                onClick={() => setPrimaryColor('blue')}
                className="h-6 rounded-lg bg-blue-600 hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
                title="Azul"
              />
              <button
                onClick={() => setPrimaryColor('purple')}
                className="h-6 rounded-lg bg-purple-600 hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
                title="Roxo"
              />
              <button
                onClick={() => setPrimaryColor('emerald')}
                className="h-6 rounded-lg bg-emerald-600 hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
                title="Esmeralda"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-300 cursor-pointer"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}

        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span>Sair</span>}
        </NavLink>
      </div>
    </aside>
  );
}
