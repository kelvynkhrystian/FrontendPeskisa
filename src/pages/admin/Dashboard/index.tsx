import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  CheckCircle2,
  TrendingUp,
  MapPin,
  FileText,
  Users,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../components/Header/Header';

export function Dashboard() {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      {/* COMPONENTE DO MENU LATERAL ADMIN */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER CENTRALIZADO */}
        <Header
          title="Painel de Monitoramento"
          setMobileMenuOpen={setMobileMenuOpen}
          notificationCount={3}
        />

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
              <h2 className="text-lg font-bold">👋 Olá, Administrador</h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Servidor online • Monitoramento em tempo real
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Operacional
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
                  Pesquisas Ativas
                </p>
                <h3 className="text-3xl font-bold mt-2">5</h3>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
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
                  Equipes em Campo
                </p>
                <h3 className="text-3xl font-bold mt-2">12</h3>
              </div>
              <div
                className="p-4 rounded-xl text-white"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Users size={24} />
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
                <h3 className="text-3xl font-bold mt-2">235</h3>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                <TrendingUp size={24} />
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
                  Taxa de Conclusão
                </p>
                <h3 className="text-3xl font-bold mt-2">76%</h3>
              </div>
              <div
                className="p-4 rounded-xl text-white"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <FileText size={24} />
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
              <h3 className="font-bold text-base mb-4">
                Respostas coletadas nos últimos 7 dias
              </h3>
              <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-zinc-500/10">
                {[40, 120, 160, 200, 250, 210, 235].map((val, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                      style={{
                        height: `${(val / 250) * 100}%`,
                        backgroundColor: 'var(--primary-color)',
                      }}
                    />
                    <span className="text-xs text-zinc-400 font-medium">
                      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'][index]}
                    </span>
                  </div>
                ))}
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
                <h3 className="font-bold text-base mb-2">Regiões Ativas</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Principais localidades em andamento
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-500/5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin
                        size={16}
                        style={{ color: 'var(--primary-color)' }}
                      />
                      <span>São Luís - MA</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      Ativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-500/5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin
                        size={16}
                        style={{ color: 'var(--primary-color)' }}
                      />
                      <span>Bacabal - MA</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-500/10 text-center">
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
