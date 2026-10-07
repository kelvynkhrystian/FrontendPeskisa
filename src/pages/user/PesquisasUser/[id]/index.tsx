import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { UserSidebar } from '../../../../components/Sidebar/UserSidebar';
import { Header } from '../../../../components/Header/Header';
import { pesquisaService } from '../../../../services/pesquisaService';
import { perguntaService } from '../../../../services/perguntaService';
import { perguntaOpcaoService } from '../../../../services/perguntaOpcaoService';
import { api } from '../../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { dbLocal } from '../../../../services/dbLocal';
import {
  FileText,
  ArrowLeft,
  Plus,
  Info,
  CheckCircle,
  Building,
  Calendar,
  Layers,
  Clock,
  Hash,
} from 'lucide-react';

interface Opcao {
  id?: number;
  opcao_texto: string;
  ordem?: number;
}

interface Pergunta {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
  obrigatoria?: number;
  escala_max?: number;
  opcoes?: Opcao[];
}

interface SessaoEnviada {
  id: number;
  criado_em?: string;
  createdAt?: string;
  created_at?: string;
  total_respostas?: number;
}

export function DetalhesPesquisaUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pesquisa, setPesquisa] = useState<any>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [sessoesEnviadas, setSessoesEnviadas] = useState<SessaoEnviada[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'info' | 'enviadas'>('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDadosPesquisa();
    }
  }, [id]);

  async function loadDadosPesquisa() {
    try {
      setLoading(true);

      let dadosPesquisa = null;
      let listaPerguntas: Pergunta[] = [];
      let todasOpcoes: any[] = [];

      // 1. TENTATIVA ONLINE
      if (navigator.onLine) {
        try {
          // Como o getById não existe no service, buscamos todas e filtramos pelo ID
          const resPesquisas = await pesquisaService.getAll();
          const lista = resPesquisas.pesquisas || resPesquisas || [];
          dadosPesquisa = lista.find((p: any) => Number(p.id) === Number(id));

          // Busca as perguntas da pesquisa
          const resPerguntas = await perguntaService.getAll({
            pesquisa_id: id,
          });
          listaPerguntas = (
            resPerguntas.perguntas ||
            resPerguntas ||
            []
          ).filter((p: any) => Number(p.pesquisa_id) === Number(id));

          // Busca as opções
          const opcoesRes = await perguntaOpcaoService.getAll();
          todasOpcoes = opcoesRes.opcoes || opcoesRes || [];
        } catch (err) {
          console.warn('Falha na rede, alternando para o cache local...', err);
        }
      }

      // 2. FALLBACK PARA O OFFLINE (ou se a API falhou)
      if (!dadosPesquisa) {
        dadosPesquisa = await dbLocal.pesquisas.get(Number(id));
      }

      if (listaPerguntas.length === 0) {
        listaPerguntas = await dbLocal.perguntas
          .where('pesquisa_id')
          .equals(Number(id))
          .toArray();
      }

      // Associa as opções às perguntas
      for (const p of listaPerguntas) {
        if (!p.opcoes || p.opcoes.length === 0) {
          const opcoesLocais = await dbLocal.opcoes
            .where('pergunta_id')
            .equals(Number(p.id))
            .toArray();
          const opcoesApi = todasOpcoes.filter(
            (o: any) => Number(o.pergunta_id) === Number(p.id)
          );

          p.opcoes = (opcoesApi.length > 0 ? opcoesApi : opcoesLocais).sort(
            (a: any, b: any) => (a.ordem || 0) - (b.ordem || 0)
          );
        }
      }

      setPesquisa(dadosPesquisa || { id, titulo: 'Pesquisa' });
      setPerguntas(
        listaPerguntas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
      );

      // Carrega as sessões enviadas
      try {
        const resSessoes = await api
          .get(`/api/resposta-sessoes?pesquisa_id=${id}`)
          .catch(() => ({ data: [] }));
        const listaSessoes = resSessoes.data.sessoes || resSessoes.data || [];
        setSessoesEnviadas(listaSessoes);
      } catch {
        setSessoesEnviadas([]);
      }
    } catch (error) {
      console.error('Erro crítico ao carregar detalhes da pesquisa:', error);
      toast.error('Erro ao carregar informações da pesquisa.');
    } finally {
      setLoading(false);
    }
  }

  const formatarTipoPergunta = (tipo: string) => {
    const tiposMap: Record<string, string> = {
      texto: 'Texto Livre',
      multipla_unica: 'Múltipla Escolha (Única)',
      multipla_multipla: 'Múltipla Escolha (Várias)',
      verdadeiro_falso: 'Verdadeiro ou Falso',
      escala: 'Escala Numérica',
      concordancia: 'Concordância',
      selecione: 'Seleção (Dropdown)',
    };
    return tiposMap[tipo] || tipo;
  };

  // Função auxiliar para retornar as opções corretas dependendo do tipo da pergunta
  const getOpcoesExibicao = (pergunta: Pergunta) => {
    if (pergunta.tipo === 'concordancia') {
      return [
        { id: 1, opcao_texto: 'Discordo totalmente' },
        { id: 2, opcao_texto: 'Discordo' },
        { id: 3, opcao_texto: 'Neutro' },
        { id: 4, opcao_texto: 'Concordo' },
        { id: 5, opcao_texto: 'Concordo totalmente' },
      ];
    }
    if (pergunta.tipo === 'escala') {
      const max = pergunta.escala_max || 5;
      return Array.from({ length: max }, (_, i) => ({
        id: i + 1,
        opcao_texto: String(i + 1),
      }));
    }
    return pergunta.opcoes || [];
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#121214] text-white' : 'bg-[#f4f4f5] text-zinc-800'}`}
      >
        <p className="text-sm">A carregar detalhes da pesquisa...</p>
      </div>
    );
  }

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
          title="Executar Pesquisa"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <button
            onClick={() => navigate('/user/pesquisas')}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer w-fit ${
              theme === 'dark'
                ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-300'
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Pesquisas</span>
          </button>

          <div
            className={`p-6 md:p-8 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-4 rounded-2xl text-white shadow-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <FileText size={32} />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight">
                  {pesquisa?.titulo || 'Pesquisa'}
                </h1>
                {pesquisa?.empresa && (
                  <p
                    className="text-xs font-semibold flex items-center gap-1.5"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    <Building size={14} />
                    <span>{pesquisa.empresa}</span>
                  </p>
                )}
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  {pesquisa?.descricao || 'Sem descrição informada.'}
                </p>
                {pesquisa?.data_inicio && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
                    <Calendar
                      size={14}
                      style={{ color: 'var(--primary-color)' }}
                    />
                    <span>
                      Vigência:{' '}
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
              </div>
            </div>

            <button
              onClick={() => navigate(`/user/pesquisas/${id}/responder`)}
              className="py-3 px-6 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Plus size={18} />
              <span>Adicionar Nova Resposta</span>
            </button>
          </div>

          <div className="flex items-center gap-3 border-b pb-4 border-zinc-700/20">
            <button
              onClick={() => setAbaAtiva('info')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                abaAtiva === 'info'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'bg-[#1a1a1e] text-zinc-400 hover:bg-[#29292e]'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100'
              }`}
              style={
                abaAtiva === 'info'
                  ? { backgroundColor: 'var(--primary-color)' }
                  : {}
              }
            >
              <Info size={16} />
              <span>Info</span>
            </button>

            <button
              onClick={() => setAbaAtiva('enviadas')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                abaAtiva === 'enviadas'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'bg-[#1a1a1e] text-zinc-400 hover:bg-[#29292e]'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100'
              }`}
              style={
                abaAtiva === 'enviadas'
                  ? { backgroundColor: 'var(--primary-color)' }
                  : {}
              }
            >
              <CheckCircle size={16} />
              <span>Enviadas ({sessoesEnviadas.length})</span>
            </button>
          </div>

          {abaAtiva === 'info' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={18} style={{ color: 'var(--primary-color)' }} />
                <h2 className="text-lg font-bold">
                  Estrutura de Perguntas ({perguntas.length})
                </h2>
              </div>

              {perguntas.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                >
                  <p className="text-sm opacity-60">
                    Nenhuma pergunta configurada nesta pesquisa.
                  </p>
                </div>
              ) : (
                perguntas.map((pergunta, index) => {
                  const opcoesExibicao = getOpcoesExibicao(pergunta);

                  return (
                    <div
                      key={pergunta.id}
                      className={`p-5 rounded-2xl border shadow-md space-y-3 ${
                        theme === 'dark'
                          ? 'bg-[#1a1a1e] border-[#29292e]'
                          : 'bg-white border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400">
                            #{index + 1}
                          </span>
                          <h4 className="font-bold text-base">
                            {pergunta.titulo}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase bg-blue-500/10 text-blue-400">
                            {formatarTipoPergunta(pergunta.tipo)}
                          </span>
                          {pergunta.obrigatoria === 1 && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase bg-emerald-500/10 text-emerald-400">
                              Obrigatória
                            </span>
                          )}
                        </div>
                      </div>

                      {opcoesExibicao.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-zinc-700/20 mt-3">
                          <p className="text-xs font-semibold text-zinc-400">
                            Opções de resposta:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {opcoesExibicao.map((op, opIndex) => (
                              <div
                                key={op.id || opIndex}
                                className={`text-xs px-3 py-2 rounded-xl border ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200'}`}
                              >
                                • {op.opcao_texto}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {abaAtiva === 'enviadas' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={18}
                  style={{ color: 'var(--primary-color)' }}
                />
                <h2 className="text-lg font-bold">
                  Histórico de Respostas Enviadas ({sessoesEnviadas.length})
                </h2>
              </div>

              {sessoesEnviadas.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                >
                  <p className="text-sm opacity-60">
                    Ainda não foram enviadas respostas para esta pesquisa.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessoesEnviadas.map((sessao: any, index) => {
                    // Procura a data em todas as variações possíveis do banco/Sequelize
                    const dataBruta =
                      sessao.criada_em ||
                      sessao.createdAt ||
                      sessao.created_at ||
                      sessao.data_criacao;

                    const dataFormatada = dataBruta
                      ? new Date(dataBruta).toLocaleString('pt-BR')
                      : 'Data não registada';

                    return (
                      <div
                        key={sessao.id || index}
                        className={`p-5 rounded-2xl border shadow-md flex items-center justify-between gap-4 ${
                          theme === 'dark'
                            ? 'bg-[#1a1a1e] border-[#29292e]'
                            : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">
                              Entrevista #{sessao.id}
                            </h4>
                            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                              <Clock size={13} />
                              <span>Enviado em: {dataFormatada}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DetalhesPesquisaUser;
