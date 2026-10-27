import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  CheckCircle2,
  ClipboardList,
  Send,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { UserSidebar } from '../../../components/Sidebar/UserSidebar';
import { Header } from '../../../components/Header/Header';
import { syncService } from '../../../services/syncService';
import { api } from '../../../services/api';

export function DashboardUser() {
  const { theme, nomeApp } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pesquisasDisponiveis: 0,
    respostasHoje: 0,
    totalEnviadas: 0,
    pendentesSync: 0,
  });

  useEffect(() => {
    document.title = `Painel - ${nomeApp}`;
    carregarDadosUsuario();
  }, [nomeApp]);

  async function carregarDadosUsuario() {
    try {
      setLoading(true);

      // 1. Baixar dados offline (se aplicável)
      try {
        await syncService.baixarDadosParaOffline();
      } catch (e) {}

      // 2. Identificar o ID do usuário logado
      let currentUserId: number | null = null;
      try {
        const resMe = await api.get('/api/users/me');
        currentUserId = resMe.data?.id || resMe.data?.usuario?.id || null;
      } catch (e) {}

      // 3. Buscar Pesquisas Disponíveis
      let totalPesquisas = 0;
      try {
        const resPesq = await api.get('/api/pesquisas');
        const lista = resPesq.data.pesquisas || resPesq.data || [];
        const ativas = lista.filter(
          (p: any) => p.status === 'ativa' || p.ativa === true || !p.status
        );
        totalPesquisas = ativas.length;
      } catch (e) {}

      // 4. Buscar Respostas e filtrar estritamente pelo usuário atual
      let listaRespostas = [];
      try {
        const resResp = await api.get('/api/resposta-sessoes');
        const dados =
          resResp.data.resposta_sessoes ||
          resResp.data.sessoes ||
          resResp.data ||
          [];
        if (currentUserId) {
          listaRespostas = dados.filter(
            (r: any) => Number(r.usuario_id) === Number(currentUserId)
          );
        } else {
          listaRespostas = dados;
        }
      } catch (e) {
        try {
          const resResp2 = await api.get('/api/respostas');
          const dados2 = resResp2.data.respostas || resResp2.data || [];
          if (currentUserId) {
            listaRespostas = dados2.filter(
              (r: any) => Number(r.usuario_id) === Number(currentUserId)
            );
          } else {
            listaRespostas = dados2;
          }
        } catch (err) {}
      }

      // Filtrar coletas de hoje do usuário
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let hojeCount = 0;
      listaRespostas.forEach((r: any) => {
        const dataStr = r.criada_em || r.created_at || r.data_criacao;
        if (!dataStr) return;
        const d = new Date(dataStr);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === hoje.getTime()) {
          hojeCount++;
        }
      });

      // 5. Verificar itens Pendentes de Envio (Offline Queue)
      let pendentesCount = 0;
      try {
        const filaOffline = JSON.parse(
          localStorage.getItem('respostas_offline') ||
            localStorage.getItem('offline_queue') ||
            '[]'
        );
        if (Array.isArray(filaOffline)) {
          pendentesCount = filaOffline.length;
        }
      } catch (e) {}

      setStats({
        pesquisasDisponiveis: totalPesquisas,
        respostasHoje: hojeCount,
        totalEnviadas: listaRespostas.length,
        pendentesSync: pendentesCount,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  }

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
        {/* HEADER CENTRALIZADO */}
        <Header
          title="Painel"
          setMobileMenuOpen={setMobileMenuOpen}
          notificationCount={1}
        />

        {/* Corpo do Dashboard */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
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
              {loading ? 'Sincronizando...' : 'Sistema Sincronizado'}
            </div>
          </div>

          {/* 4 QUADRADOS (GRID 2x2 NO MOBILE, 4 COLUNAS NO DESKTOP) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div
              className={`p-4 md:p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-[11px] md:text-xs text-zinc-400 font-semibold uppercase">
                  Pesquisas Disponíveis
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {loading ? '...' : stats.pesquisasDisponiveis}
                </h3>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-blue-500/10 text-blue-500">
                <ClipboardList size={20} />
              </div>
            </div>

            <div
              className={`p-4 md:p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-[11px] md:text-xs text-zinc-400 font-semibold uppercase">
                  Respostas Hoje
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 text-emerald-500">
                  {loading ? '...' : stats.respostasHoje}
                </h3>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Send size={20} />
              </div>
            </div>

            <div
              className={`p-4 md:p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-[11px] md:text-xs text-zinc-400 font-semibold uppercase">
                  Total Coletadas
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {loading ? '...' : stats.totalEnviadas}
                </h3>
              </div>
              <div
                className="p-3 md:p-4 rounded-xl text-white"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div
              className={`p-4 md:p-5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div>
                <p className="text-[11px] md:text-xs text-zinc-400 font-semibold uppercase">
                  Pendentes de Envio
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 text-amber-500">
                  {loading ? '...' : stats.pendentesSync}
                </h3>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-amber-500/10 text-amber-500">
                <RefreshCw size={20} />
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

                {/* Rota corrigida para /user/envios */}
                <a
                  href="/user/envios"
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
