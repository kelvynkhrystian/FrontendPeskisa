import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Sun,
  Moon,
  CheckCircle2,
  Menu,
  Bell,
  ClipboardList,
  Send,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { UserSidebar } from '../../../components/Sidebar/UserSidebar';

export function DashboardUser() {
  const { theme, toggleTheme, setPrimaryColor } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = {
    pesquisasDisponiveis: 4,
    respostasHoje: 12,
    totalEnviadas: 48,
    pendentesSync: 0,
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      {/* MENU LATERAL DO USUÁRIO */}
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header superior idêntico ao Admin */}
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
            <h1 className="text-xl font-bold tracking-tight">
              Painel do Entrevistador
            </h1>
          </div>

          <div className="flex items-center gap-3">
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

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="p-2.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/25 transition-all relative cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
            </button>
          </div>
        </header>

        {/* Corpo do Dashboard */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm ${
              theme === 'dark'
                ? 'bg-[#1a1a1e] border-[#29292e]'
                : 'bg-white border-zinc-200'
            }`}
          >
            <div>
              <h2 className="text-lg font-bold">👋 Olá, Entrevistador(a)!</h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Pronto para iniciar as coletas de campo de hoje? Bom trabalho!
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Sincronizado
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">
                  Pesquisas Disponíveis
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats.pesquisasDisponiveis}
                </h3>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500">
                <ClipboardList size={24} />
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">
                  Respostas Hoje
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats.respostasHoje}
                </h3>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Send size={24} />
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">
                  Total Coletadas
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats.totalEnviadas}
                </h3>
              </div>
              <div
                className="p-4 rounded-xl text-white"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">
                  Pendentes de Envio
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats.pendentesSync}
                </h3>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500">
                <RefreshCw size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className={`lg:col-span-2 p-6 rounded-2xl border ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <h3 className="font-bold text-base mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/user/pesquisas"
                  className="p-4 rounded-xl border border-zinc-500/15 hover:border-emerald-500/50 transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Iniciar Pesquisa</h4>
                    <p className="text-xs text-zinc-400">
                      Ver formulários disponíveis
                    </p>
                  </div>
                </a>

                <a
                  href="/user/sincronizar"
                  className="p-4 rounded-xl border border-zinc-500/15 hover:border-blue-500/50 transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <RefreshCw size={22} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Sincronizar Dados</h4>
                    <p className="text-xs text-zinc-400">
                      Enviar coletas pendentes
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  <Clock size={18} style={{ color: 'var(--primary-color)' }} />
                  Lembrete de Campo
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Certifique-se de verificar sua conexão antes de iniciar
                  grandes lotes de entrevistas ou utilize o modo offline caso
                  esteja em áreas sem cobertura de rede.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-500/10 text-center mt-6">
                <span className="text-xs text-zinc-500">
                  Desenvolvido por{' '}
                  <a
                    href="https://kelvynk.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-semibold"
                  >
                    kelvynk
                  </a>
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
