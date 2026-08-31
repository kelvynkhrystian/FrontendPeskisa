import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  Search,
  Send,
  RefreshCw,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

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
  const { theme } = useTheme();
  const [nomeApp, setNomeApp] = useState('Peskisa');
  const [logoHorizontal, setLogoHorizontal] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/api/config')
      .then((response) => {
        if (response.data) {
          if (response.data.nome_app) setNomeApp(response.data.nome_app);
          // Buscando a logo horizontal específica solicitada
          if (response.data.logo_horizontal)
            setLogoHorizontal(response.data.logo_horizontal);
        }
      })
      .catch((error) => console.error('Erro ao buscar configurações:', error));
  }, []);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${
        theme === 'dark'
          ? 'bg-[#1a1a1e] border-[#29292e]'
          : 'bg-white border-zinc-200'
      } lg:static ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Topo da Sidebar */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-500/15">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center shrink-0 w-50 h-40 text-white">
            {logoHorizontal ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${logoHorizontal.startsWith('/') ? '' : '/'}${logoHorizontal}`}
                alt="Logo"
                className="w-40 h-10 object-contain"
              />
            ) : (
              sidebarOpen && (
                <span className="font-bold text-lg tracking-tight truncate">
                  {nomeApp}
                </span>
              )
            )}
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

      {/* Links de navegação do Entrevistador */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        <div>
          {sidebarOpen && (
            <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Menu de Campo
            </p>
          )}
          <nav className="space-y-1">
            <a
              href="/user/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <LayoutDashboard size={20} className="shrink-0" />
              {sidebarOpen && <span>Início</span>}
            </a>
            <a
              href="/user/pesquisas"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10 transition-colors"
            >
              <Search size={20} className="shrink-0" />
              {sidebarOpen && <span className="flex-1">Pesquisas</span>}
              {sidebarOpen && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                  4
                </span>
              )}
            </a>
            <a
              href="/user/envios"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10 transition-colors"
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
            </a>
            <a
              href="/user/sincronizar"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10 transition-colors"
            >
              <RefreshCw size={20} className="shrink-0" />
              {sidebarOpen && <span>Sincronizar</span>}
            </a>
          </nav>
        </div>

        <div>
          {sidebarOpen && (
            <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Sistema
            </p>
          )}
          <nav className="space-y-1">
            <a
              href="/user/configuracoes"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10 transition-colors"
            >
              <Settings size={20} className="shrink-0" />
              {sidebarOpen && <span>Configurações</span>}
            </a>
            <a
              href="/user/suporte"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-500/10 transition-colors"
            >
              <HelpCircle size={20} className="shrink-0" />
              {sidebarOpen && <span>Suporte</span>}
            </a>
          </nav>
        </div>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-3 border-t border-zinc-500/15">
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span>Sair</span>}
        </a>
      </div>
    </aside>
  );
}
