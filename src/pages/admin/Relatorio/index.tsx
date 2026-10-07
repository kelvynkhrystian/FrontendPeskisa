import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../components/Header/Header';
import { pesquisaService } from '../../../services/pesquisaService';
import toast, { Toaster } from 'react-hot-toast';
import {
  BarChart3,
  Search,
  ChevronRight,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function RelatoriosList() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pesquisas, setPesquisas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    document.title = 'Relatórios - Vibe Opinião';
    loadPesquisas();
  }, []);

  async function loadPesquisas() {
    try {
      setLoading(true);
      const res = await pesquisaService.getAll();
      const lista = res.pesquisas || res || [];
      setPesquisas(lista);
    } catch (error) {
      toast.error('Erro ao carregar pesquisas.');
    } finally {
      setLoading(false);
    }
  }

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '-';
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataStr;
    }
  };

  const pesquisasFiltradas = pesquisas.filter(
    (p) =>
      p.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${theme === 'dark' ? 'bg-[#121214] text-[#e1e1e6]' : 'bg-[#f4f4f5] text-[#18181b]'}`}
    >
      <Toaster position="top-right" />
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Relatórios Analíticos"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <div
            className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3.5 rounded-xl text-white shadow-md flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <BarChart3 size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Relatórios de Pesquisas
                </h1>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  Selecione uma pesquisa para visualizar os gráficos e exportar
                  dados.
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar pesquisa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all border ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] focus:border-zinc-500' : 'bg-zinc-50 border-zinc-300 focus:border-zinc-400'}`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: 'var(--primary-color)' }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pesquisasFiltradas.map((pesquisa) => {
                const statusBruto =
                  pesquisa.status || pesquisa.ativo || 'Ativa';
                const statusFormatado =
                  typeof statusBruto === 'boolean'
                    ? statusBruto
                      ? 'Ativa'
                      : 'Inativa'
                    : String(statusBruto).charAt(0).toUpperCase() +
                      String(statusBruto).slice(1).toLowerCase();

                const isAtiva =
                  statusFormatado.includes('Ativ') ||
                  statusFormatado === '1' ||
                  statusFormatado === 'True';

                return (
                  <div
                    key={pesquisa.id}
                    className={`p-6 rounded-2xl border flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] hover:border-zinc-600' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                  >
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2">
                          {pesquisa.titulo}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${isAtiva ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                        >
                          {isAtiva ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {statusFormatado}
                        </span>
                      </div>

                      {pesquisa.descricao && (
                        <p
                          className={`text-xs line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                        >
                          {pesquisa.descricao}
                        </p>
                      )}

                      <div
                        className={`space-y-2 pt-3 border-t text-xs ${theme === 'dark' ? 'border-[#29292e] text-zinc-300' : 'border-zinc-100 text-zinc-600'}`}
                      >
                        {pesquisa.empresa && (
                          <div className="flex items-center gap-2">
                            <Building
                              size={14}
                              className="opacity-70 shrink-0"
                            />
                            <span className="truncate">
                              Empresa:{' '}
                              <strong className="font-medium">
                                {pesquisa.empresa}
                              </strong>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="opacity-70 shrink-0" />
                          <span>
                            Início:{' '}
                            <strong className="font-medium">
                              {formatarData(
                                pesquisa.data_inicio || pesquisa.createdAt
                              )}
                            </strong>
                          </span>
                        </div>

                        {pesquisa.data_fim && (
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={14}
                              className="opacity-70 shrink-0"
                            />
                            <span>
                              Fim:{' '}
                              <strong className="font-medium">
                                {formatarData(pesquisa.data_fim)}
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/admin/relatorios/${pesquisa.id}`)
                      }
                      className="w-full py-3 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <span>Ver Relatório</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                );
              })}

              {pesquisasFiltradas.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center opacity-60">
                  Nenhuma pesquisa encontrada.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
