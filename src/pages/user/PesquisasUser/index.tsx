import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserSidebar } from '../../../components/Sidebar/UserSidebar';
import { Header } from '../../../components/Header/Header';
import { pesquisaService } from '../../../services/pesquisaService';
import { pesquisaEquipeService } from '../../../services/pesquisaEquipeService';
import { api } from '../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  FileText,
  Search,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface Pesquisa {
  id: number;
  titulo: string;
  empresa?: string;
  descricao?: string;
  status: string;
  data_inicio?: string;
  data_fim?: string;
}

export function PesquisasUser() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPesquisasDoUsuario();
  }, []);

  async function loadPesquisasDoUsuario() {
    try {
      setLoading(true);

      const usuarioStorage = localStorage.getItem('user');
      let usuarioEquipeId = null;

      if (usuarioStorage) {
        const userObj = JSON.parse(usuarioStorage);
        usuarioEquipeId = userObj.equipe_id || userObj.equipeId;
      } else {
        const resMe = await api.get('/api/auth/me').catch(() => null);
        if (resMe && resMe.data) {
          usuarioEquipeId = resMe.data.equipe_id || resMe.data.equipeId;
        }
      }

      const [resPesquisas, resRelacoes] = await Promise.all([
        pesquisaService.getAll(),
        pesquisaEquipeService.getAll
          ? pesquisaEquipeService.getAll()
          : api.get('/api/pesquisa-equipes').catch(() => ({ data: [] })),
      ]);

      const listaPesquisas: Pesquisa[] =
        resPesquisas.pesquisas || resPesquisas || [];
      const relacoes = resRelacoes.data || resRelacoes || [];

      // Filtra rascunhos e valida a equipe do utilizador
      const pesquisasFiltradas = listaPesquisas.filter((p) => {
        if (!p.status || p.status.toLowerCase() === 'rascunho') return false;

        if (usuarioEquipeId) {
          const estaNaEquipe = relacoes.some(
            (r: any) =>
              Number(r.pesquisa_id) === Number(p.id) &&
              Number(r.equipe_id) === Number(usuarioEquipeId)
          );
          return estaNaEquipe;
        }

        return true;
      });

      setPesquisas(pesquisasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar pesquisas:', error);
      toast.error('Erro ao carregar pesquisas disponíveis.');
    } finally {
      setLoading(false);
    }
  }

  const pesquisasFiltradas = pesquisas.filter(
    (p) =>
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (p.empresa && p.empresa.toLowerCase().includes(busca.toLowerCase()))
  );

  const getStatusBadge = (statusReal: string) => {
    switch (statusReal?.toLowerCase()) {
      case 'ativa':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={12} /> Ativa
          </span>
        );
      case 'pausada':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-amber-500/10 text-amber-500">
            <Clock size={12} /> Pausada
          </span>
        );
      case 'encerrada':
      case 'finalizada':
      case 'cancelada':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-red-500/10 text-red-500">
            <AlertCircle size={12} /> {statusReal}
          </span>
        );
      default:
        return (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-zinc-500/10 text-zinc-400">
            {statusReal || 'Indefinido'}
          </span>
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${theme === 'dark' ? 'bg-[#121214] text-[#e1e1e6]' : 'bg-[#f4f4f5] text-[#18181b]'}`}
    >
      <Toaster position="top-right" />
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Painel do Entrevistador"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          {/* Título, Subtítulo e Input de Pesquisa abaixo */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Pesquisas Disponíveis
              </h1>
              <p
                className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                Visualize as pesquisas ativas atribuídas à sua equipa para
                iniciar as coletas.
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Pesquisar por título ou empresa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1a1a1e] border-[#29292e] text-white focus:border-orange-500'
                    : 'bg-white border-zinc-200 text-zinc-800 focus:border-orange-500'
                }`}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              A carregar pesquisas...
            </div>
          ) : pesquisasFiltradas.length === 0 ? (
            <div
              className={`p-12 rounded-2xl border text-center space-y-3 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <FileText
                size={40}
                className="mx-auto text-zinc-500 opacity-40"
              />
              <h3 className="font-bold text-base">
                Nenhuma pesquisa encontrada
              </h3>
              <p className="text-xs text-zinc-400">
                Não existem pesquisas ativas associadas à sua equipa neste
                momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pesquisasFiltradas.map((pesquisa) => {
                // Validação de Vencimento por Data Fim
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const dataFim = pesquisa.data_fim
                  ? new Date(pesquisa.data_fim)
                  : null;
                if (dataFim) dataFim.setHours(0, 0, 0, 0);

                const passouDaData = dataFim ? dataFim < hoje : false;

                // Se passou da data fim, força o status para 'encerrada' independentemente do banco
                const statusReal = passouDaData ? 'encerrada' : pesquisa.status;
                const isAtiva = statusReal?.toLowerCase() === 'ativa';

                return (
                  <div
                    key={pesquisa.id}
                    className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between transition-all relative overflow-hidden ${
                      theme === 'dark'
                        ? 'bg-[#1a1a1e] border-[#29292e]'
                        : 'bg-white border-zinc-200'
                    } ${!isAtiva ? 'opacity-75' : 'hover:border-orange-500/50'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="p-2.5 rounded-xl text-white shadow-sm"
                          style={{ backgroundColor: 'var(--primary-color)' }}
                        >
                          <FileText size={20} />
                        </div>
                        {getStatusBadge(statusReal)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg leading-snug line-clamp-1">
                          {pesquisa.titulo}
                        </h3>
                        {pesquisa.empresa && (
                          <p
                            className="text-xs font-semibold mt-1 flex items-center gap-1.5"
                            style={{ color: 'var(--primary-color)' }}
                          >
                            <Building size={14} />
                            <span>{pesquisa.empresa}</span>
                          </p>
                        )}
                      </div>

                      <p
                        className={`text-xs line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
                      >
                        {pesquisa.descricao || 'Sem descrição informada.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-700/20 space-y-4">
                      {pesquisa.data_inicio && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Calendar
                            size={14}
                            style={{ color: 'var(--primary-color)' }}
                          />
                          <span>
                            {new Date(pesquisa.data_inicio).toLocaleDateString(
                              'pt-BR'
                            )}{' '}
                            até{' '}
                            {pesquisa.data_fim
                              ? new Date(pesquisa.data_fim).toLocaleDateString(
                                  'pt-BR'
                                )
                              : 'Indeterminado'}
                          </span>
                        </div>
                      )}

                      {isAtiva ? (
                        <button
                          onClick={() =>
                            navigate(`/user/pesquisas/${pesquisa.id}`)
                          }
                          className="w-full py-2.5 px-4 rounded-xl text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
                          style={{ backgroundColor: 'var(--primary-color)' }}
                        >
                          <span>Iniciar Coleta</span>
                          <ArrowRight size={16} />
                        </button>
                      ) : (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-zinc-500/10 text-zinc-400 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none">
                          <Lock size={15} />
                          <span>Indisponível ({statusReal})</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PesquisasUser;
