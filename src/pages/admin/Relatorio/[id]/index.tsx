import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../../components/Header/Header';
import { perguntaService } from '../../../../services/perguntaService';
import { perguntaOpcaoService } from '../../../../services/perguntaOpcaoService';
import { pesquisaService } from '../../../../services/pesquisaService';
import { api } from '../../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Filter,
  Info,
  Users,
  MessageSquare,
  FileDown,
} from 'lucide-react';

interface Opcao {
  id: number;
  pergunta_id?: number;
  opcao_texto: string;
  ordem?: number;
}

interface Pergunta {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
  escala_max?: number;
  opcoes?: Opcao[];
}

export function DetalhesRelatorio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pesquisaInfo, setPesquisaInfo] = useState<any>({
    titulo: 'Carregando...',
    totalRespostas: 0,
  });
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<any[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState('geral');

  const filtros = [
    { value: 'geral', label: 'Geral' },
    { value: 'local', label: 'Local' },
    { value: 'local_geral', label: 'Local + Geral' },
    { value: 'genero_geral', label: 'Gênero + Geral' },
  ];

  useEffect(() => {
    document.title = 'Relatório Detalhado - Vibe Opinião';
    loadDadosReais();
  }, [id]);

  async function loadDadosReais() {
    try {
      setLoading(true);

      const todasPesquisas = await pesquisaService.getAll();
      const listaPesquisas =
        (todasPesquisas as any).pesquisas || todasPesquisas || [];
      const pesquisaAtual = listaPesquisas.find(
        (p: any) => Number(p.id) === Number(id)
      );

      if (pesquisaAtual) {
        setPesquisaInfo(pesquisaAtual);
      }

      const resPerguntas = await perguntaService.getAll({ pesquisa_id: id });
      const listaPerguntas = (
        (resPerguntas as any).perguntas ||
        resPerguntas ||
        []
      ).filter((p: any) => Number(p.pesquisa_id) === Number(id));

      const resOpcoes = await perguntaOpcaoService.getAll();
      const listaOpcoes = (resOpcoes as any).opcoes || resOpcoes || [];

      const perguntasComOpcoes = listaPerguntas
        .map((p: Pergunta) => {
          let opcoesDaPergunta = listaOpcoes.filter(
            (o: Opcao) => Number(o.pergunta_id) === Number(p.id)
          );

          if (
            (p.tipo === 'escala' || p.tipo === 'escala_numerica') &&
            opcoesDaPergunta.length === 0
          ) {
            const max = Number(p.escala_max) || 5;
            opcoesDaPergunta = Array.from({ length: max }, (_, i) => ({
              id: i + 1,
              opcao_texto: String(i + 1),
              ordem: i + 1,
            }));
          }

          if (p.tipo === 'concordancia' && opcoesDaPergunta.length === 0) {
            const concordanciaTextos = [
              'Discordo totalmente',
              'Discordo',
              'Neutro',
              'Concordo',
              'Concordo totalmente',
            ];
            opcoesDaPergunta = concordanciaTextos.map((txt, i) => ({
              id: i + 1,
              opcao_texto: txt,
              ordem: i + 1,
            }));
          }

          return {
            ...p,
            opcoes: opcoesDaPergunta.sort(
              (a: Opcao, b: Opcao) => (a.ordem || 0) - (b.ordem || 0)
            ),
          };
        })
        .sort((a: Pergunta, b: Pergunta) => (a.ordem || 0) - (b.ordem || 0));

      setPerguntas(perguntasComOpcoes);

      try {
        const resRespostas = await api.get(`/api/respostas?pesquisa_id=${id}`);
        const listaRespostas =
          resRespostas.data.respostas || resRespostas.data || [];
        setRespostas(listaRespostas);

        const sessoesUnicas = new Set(
          listaRespostas.map((r: any) => r.sessao_id).filter(Boolean)
        );
        const totalColetas =
          sessoesUnicas.size > 0 ? sessoesUnicas.size : listaRespostas.length;

        setPesquisaInfo((prev: any) => ({
          ...prev,
          totalRespostas: totalColetas,
        }));
      } catch (err) {
        console.warn('Erro ao buscar respostas da API:', err);
        setRespostas([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados do relatório.');
    } finally {
      setLoading(false);
    }
  }

  // Função robusta para processar estatísticas considerando opcao_texto e resposta
  const calcularEstatisticasPergunta = (pergunta: Pergunta) => {
    const respostasDaPergunta = respostas.filter(
      (r: any) => Number(r.pergunta_id) === Number(pergunta.id)
    );
    const totalVotos = respostasDaPergunta.length;

    // 1. Tratamento para Texto Livre
    if (pergunta.tipo === 'texto' || pergunta.tipo === 'texto_livre') {
      const textosUnicos = respostasDaPergunta
        .map((r: any) => r.resposta || r.opcao_texto || '')
        .filter(
          (txt: string) =>
            txt && txt.trim() !== '' && txt !== 'undefined' && txt !== 'null'
        );

      return {
        tipo: 'texto',
        textos: textosUnicos,
        total: totalVotos,
      };
    }

    // 2. Tratamento para Verdadeiro/Falso com sub-opções
    if (
      pergunta.tipo === 'verdadeiro_falso' &&
      pergunta.opcoes &&
      pergunta.opcoes.length > 0
    ) {
      const estatisticasVF = pergunta.opcoes.map((opcao) => {
        let contagemVerdadeiro = 0;
        let contagemFalso = 0;

        respostasDaPergunta.forEach((r: any) => {
          const rawVal = r.resposta || r.opcao_texto;
          if (!rawVal || rawVal === 'undefined') return;

          try {
            const parsed =
              typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;

            if (parsed && typeof parsed === 'object') {
              const valorOpcao = parsed[opcao.opcao_texto];

              if (String(valorOpcao).toLowerCase() === 'verdadeiro') {
                contagemVerdadeiro++;
              } else if (String(valorOpcao).toLowerCase() === 'falso') {
                contagemFalso++;
              }
            }
          } catch (e) {
            // Caso seja valor simples antigo
          }
        });

        const totalOpcao = contagemVerdadeiro + contagemFalso;
        const porcVerdadeiro =
          totalOpcao > 0
            ? Number(((contagemVerdadeiro / totalOpcao) * 100).toFixed(1))
            : 0;
        const porcFalso =
          totalOpcao > 0
            ? Number(((contagemFalso / totalOpcao) * 100).toFixed(1))
            : 0;

        return {
          texto: opcao.opcao_texto,
          totalSub: totalOpcao,
          verdadeiro: {
            contagem: contagemVerdadeiro,
            porcentagem: porcVerdadeiro,
          },
          falso: { contagem: contagemFalso, porcentagem: porcFalso },
        };
      });

      return {
        tipo: 'verdadeiro_falso_com_opcoes',
        subItens: estatisticasVF,
        total: totalVotos,
      };
    }

    // 3. Tratamento para Múltipla Escolha, Select, Escala, Concordância
    // 3. Tratamento para Múltipla Escolha, Select, Escala, Concordância
    const opcoesCalculadas = (pergunta.opcoes || []).map((opcao) => {
      const optText = String(opcao.opcao_texto || '')
        .trim()
        .toLowerCase();

      const contagem = respostasDaPergunta.filter((r: any) => {
        const rOpt = String(r.opcao_texto || '')
          .trim()
          .toLowerCase();
        const rResp = String(r.resposta || '')
          .trim()
          .toLowerCase();

        if (rOpt === optText || rResp === optText) return true;

        if (r.resposta && r.resposta !== 'undefined') {
          try {
            const parsed = JSON.parse(r.resposta);
            if (Array.isArray(parsed)) {
              return parsed.some(
                (item: any) => String(item).trim().toLowerCase() === optText
              );
            }
          } catch {}
        }

        return false;
      }).length;

      return { texto: opcao.opcao_texto, contagem };
    });

    // Se for checkbox (multipla_multipla), calcula a porcentagem baseada na soma total de votos das opções
    const somaTotalVotosOpcoes = opcoesCalculadas.reduce(
      (acc, curr) => acc + curr.contagem,
      0
    );

    const estatisticasOpcoes = opcoesCalculadas.map((opcao) => {
      const porcentagem =
        pergunta.tipo === 'multipla_multipla'
          ? somaTotalVotosOpcoes > 0
            ? Number(((opcao.contagem / somaTotalVotosOpcoes) * 100).toFixed(1))
            : 0
          : totalVotos > 0
            ? Number(((opcao.contagem / totalVotos) * 100).toFixed(1))
            : 0;

      return {
        texto: opcao.texto,
        contagem: opcao.contagem,
        porcentagem,
      };
    });

    return {
      tipo: 'opcoes',
      opcoes: estatisticasOpcoes,
      total: totalVotos,
    };
  };

  const handleInfoSetup = () => {
    toast('Configuração de capa para PDF em desenvolvimento!', { icon: '📄' });
  };

  const handleGerarPDF = () => {
    window.print();
  };

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
          title="Detalhes do Relatório"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate('/admin/relatorios')}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer w-fit ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Relatórios</span>
          </button>

          {/* Header do Relatório */}
          <div
            className={`p-6 rounded-2xl border shadow-sm space-y-6 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  {pesquisaInfo.titulo}
                </h1>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-500 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-lg">
                  <Users size={16} />
                  {pesquisaInfo.totalRespostas || 0} Respostas Coletadas
                </div>
              </div>

              {/* Filtros e Botão PDF */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                >
                  <Filter size={18} className="text-zinc-500" />
                  <select
                    value={filtroAtivo}
                    onChange={(e) => setFiltroAtivo(e.target.value)}
                    className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                  >
                    {filtros.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGerarPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <FileDown size={18} />
                  <span>Gerar PDF</span>
                </button>

                <button
                  onClick={handleInfoSetup}
                  title="Configurar capa do PDF"
                  className={`p-3 rounded-xl border transition-all hover:opacity-80 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                >
                  <Info size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Aviso se o filtro ativo não for 'geral' */}
          {filtroAtivo !== 'geral' && (
            <div
              className={`p-6 rounded-2xl border text-center opacity-75 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <p className="text-sm font-medium">
                Filtro "{filtros.find((f) => f.value === filtroAtivo)?.label}"
                selecionado. Dados indisponíveis no momento (preparado para
                lógica futura).
              </p>
            </div>
          )}

          {/* Conteúdo do Relatório */}
          {filtroAtivo === 'geral' &&
            (loading ? (
              <div className="flex justify-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: 'var(--primary-color)' }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {perguntas.map((pergunta, index) => {
                  const resultado = calcularEstatisticasPergunta(pergunta);

                  return (
                    <div
                      key={pergunta.id}
                      className={`p-6 md:p-8 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                    >
                      <div className="flex items-start gap-3 mb-6">
                        <div
                          className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-sm"
                          style={{ backgroundColor: 'var(--primary-color)' }}
                        >
                          {index + 1}
                        </div>
                        <h3 className="font-bold text-lg md:text-xl leading-snug">
                          {pergunta.titulo}
                        </h3>
                      </div>

                      {/* Renderização para Texto Livre */}
                      {resultado.tipo === 'texto' ? (
                        <div className="space-y-3 pl-0 md:pl-11">
                          {resultado.textos && resultado.textos.length > 0 ? (
                            resultado.textos.map((txt: string, i: number) => (
                              <div
                                key={i}
                                className={`p-3.5 rounded-xl border flex items-start gap-3 text-sm ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                              >
                                <MessageSquare
                                  size={16}
                                  className="mt-0.5 shrink-0 opacity-60"
                                />
                                <span className="leading-relaxed">{txt}</span>
                              </div>
                            ))
                          ) : (
                            <p
                              className={`text-xs italic ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                            >
                              Nenhuma resposta de texto livre registrada ainda.
                            </p>
                          )}
                        </div>
                      ) : resultado.tipo === 'verdadeiro_falso_com_opcoes' ? (
                        /* Renderização para Verdadeiro/Falso com sub-opções (Saúde, Educação, Bets) */
                        <div className="space-y-4 pl-0 md:pl-11">
                          {resultado.subItens?.map((sub: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                            >
                              <span className="text-sm font-bold block">
                                {sub.texto}
                              </span>

                              {/* Barra de Verdadeiro */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-end text-xs">
                                  <span className="font-medium text-emerald-500">
                                    Verdadeiro
                                  </span>
                                  <span className="font-bold text-zinc-500">
                                    {sub.verdadeiro.contagem} votos (
                                    {sub.verdadeiro.porcentagem}%)
                                  </span>
                                </div>
                                <div
                                  className={`w-full h-2.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                >
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${sub.verdadeiro.porcentagem}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Barra de Falso */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-end text-xs">
                                  <span className="font-medium text-rose-500">
                                    Falso
                                  </span>
                                  <span className="font-bold text-zinc-500">
                                    {sub.falso.contagem} votos (
                                    {sub.falso.porcentagem}%)
                                  </span>
                                </div>
                                <div
                                  className={`w-full h-2.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                >
                                  <div
                                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${sub.falso.porcentagem}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Gráficos de Barras Horizontais para Opções Comuns */
                        <div className="space-y-5 pl-0 md:pl-11">
                          {resultado.opcoes &&
                            resultado.opcoes.map((opcao: any, i: number) => (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between items-end text-sm">
                                  <span className="font-medium">
                                    {opcao.texto}
                                  </span>
                                  <span className="font-bold text-zinc-500 text-xs">
                                    {opcao.contagem} votos ({opcao.porcentagem}
                                    %)
                                  </span>
                                </div>
                                <div
                                  className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                >
                                  <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                      width: `${opcao.porcentagem}%`,
                                      backgroundColor: 'var(--primary-color)',
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {perguntas.length === 0 && !loading && (
                  <div
                    className={`p-12 text-center rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'}`}
                  >
                    Esta pesquisa ainda não possui perguntas cadastradas.
                  </div>
                )}
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}

export default DetalhesRelatorio;
