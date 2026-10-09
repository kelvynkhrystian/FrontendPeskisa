import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../../components/Header/Header';
import { perguntaService } from '../../../../services/perguntaService';
import { perguntaOpcaoService } from '../../../../services/perguntaOpcaoService';
import { pesquisaService } from '../../../../services/pesquisaService';
import { relatorioService } from '../../../../services/relatorioService'; // <-- IMPORT NECESSÁRIO PRO PDF
import { api } from '../../../../services/api';
import toast, { Toaster } from 'react-hot-toast';

// --- IMPORTS DO REACT-PDF ---
import { pdf } from '@react-pdf/renderer';
import { RelatorioPDFDocument } from './pdf';

import {
  ArrowLeft,
  Filter,
  Info,
  Users,
  MessageSquare,
  FileDown,
  FileText,
  Calendar,
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

const normalizeStr = (str: string) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function DetalhesRelatorio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados extras para o PDF
  const [configPdf, setConfigPdf] = useState<any>({});
  const [configSistema, setConfigSistema] = useState<any>({});

  const [pesquisaInfo, setPesquisaInfo] = useState<any>({
    titulo: 'Carregando...',
    totalRespostas: 0,
    data_criacao: new Date().toISOString(),
  });
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<any[]>([]);

  // Estados para os Filtros
  const [filtroAtivo, setFiltroAtivo] = useState('geral');
  const [subFiltroAtivo, setSubFiltroAtivo] = useState('');

  const filtros = [
    { value: 'geral', label: 'Geral (Todos os Dados)' },
    { value: 'logradouro', label: 'Por Logradouro' },
    { value: 'genero', label: 'Por Gênero (Comparativo)' },
    { value: 'renda', label: 'Por Renda' },
    { value: 'idade', label: 'Por Faixa Etária' },
    { value: 'logradouro_geral', label: 'Logradouro + Geral' },
    { value: 'genero_geral', label: 'Gênero + Geral' },
    { value: 'renda_geral', label: 'Renda + Geral' },
    { value: 'idade_geral', label: 'Faixa Etária + Geral' },
    { value: 'logradouro_genero', label: 'Logradouro + Gênero' },
    { value: 'renda_genero', label: 'Renda + Gênero' },
    { value: 'idade_genero', label: 'Faixa Etária + Gênero' },
    { value: 'logradouro_genero_geral', label: 'Logradouro + Gênero + Geral' },
    { value: 'renda_genero_geral', label: 'Renda + Gênero + Geral' },
    { value: 'idade_genero_geral', label: 'Faixa Etária + Gênero + Geral' },
  ];

  const labelMap: Record<string, string> = {
    logradouro: 'Logradouro',
    genero: 'Gênero',
    renda: 'Renda',
    idade: 'Faixa Etária',
  };

  useEffect(() => {
    document.title = 'Relatório Detalhado - Vibe Opinião';
    loadDadosReais();
    loadExtras(); // Busca capa e configs do PDF independentemente sem afetar os dados da tela
  }, [id]);

  async function loadExtras() {
    try {
      const resRel = await relatorioService.getByPesquisaId(id!);
      const lista = resRel.relatorios || resRel.data || resRel;
      const rel = Array.isArray(lista)
        ? lista.find((r: any) => Number(r.pesquisa_id) === Number(id))
        : lista;
      if (rel) setConfigPdf(rel);

      const resConfig = await api.get('/api/config');
      setConfigSistema(resConfig.data.config || resConfig.data);
    } catch (e) {
      console.warn('Erro ao carregar extras do PDF', e);
    }
  }

  async function loadDadosReais() {
    try {
      setLoading(true);

      const todasPesquisas = await pesquisaService.getAll();
      const listaPesquisas =
        (todasPesquisas as any).pesquisas || todasPesquisas || [];
      const pesquisaAtual = listaPesquisas.find(
        (p: any) => Number(p.id) === Number(id)
      );

      if (pesquisaAtual) setPesquisaInfo(pesquisaAtual);

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

  // Função auxiliar robusta: prioriza r.opcao_id e faz fallback para texto/resposta
  function getRespostaTexto(r: any, todasPerguntas: Pergunta[]) {
    const perguntaObj = todasPerguntas.find(
      (p) => Number(p.id) === Number(r.pergunta_id)
    );

    if (r.opcao_id && perguntaObj && perguntaObj.opcoes) {
      const optById = perguntaObj.opcoes.find(
        (o) => String(o.id) === String(r.opcao_id)
      );
      if (optById) return optById.opcao_texto;
    }

    let val = (r.opcao_texto || r.resposta || '').trim();
    if (!val || val === 'undefined' || val === 'null') return '';

    if (perguntaObj && perguntaObj.opcoes) {
      const opt = perguntaObj.opcoes.find(
        (o) =>
          String(o.id) === String(val) ||
          String(o.ordem) === String(val) ||
          normalizeStr(o.opcao_texto) === normalizeStr(val)
      );
      if (opt) {
        val = opt.opcao_texto;
      }
    }
    return val;
  }

  // Identificação Demográfica nas Perguntas
  // const { demografiaIds, perfisPorSessao, opcoesDemograficas } = useMemo(() => {
  const { perfisPorSessao, opcoesDemograficas } = useMemo(() => {
    const ids: Record<string, number> = {};
    perguntas.forEach((p) => {
      const t = normalizeStr(p.titulo);
      if (
        t.includes('logradouro') ||
        t.includes('bairro') ||
        t.includes('local')
      )
        ids.logradouro = p.id;
      if (t.includes('genero') || t.includes('sexo')) ids.genero = p.id;
      if (t.includes('renda') || t.includes('salario')) ids.renda = p.id;
      if (t.includes('idade') || t.includes('etaria')) ids.idade = p.id;
    });

    const perfis: Record<string, Record<string, string>> = {};
    const unicos: Record<string, Set<string>> = {
      logradouro: new Set(),
      genero: new Set(),
      renda: new Set(),
      idade: new Set(),
    };

    respostas.forEach((r) => {
      if (!r.sessao_id) return;
      if (!perfis[r.sessao_id]) perfis[r.sessao_id] = {};
      const valor = getRespostaTexto(r, perguntas);
      if (valor === undefined || valor === null || valor === '') return;

      Object.entries(ids).forEach(([chave, idPergunta]) => {
        if (Number(r.pergunta_id) === Number(idPergunta)) {
          perfis[r.sessao_id][chave] = valor;
          unicos[chave].add(valor);
        }
      });
    });

    if (unicos.genero.size === 0) {
      unicos.genero.add('Masculino');
      unicos.genero.add('Feminino');
    }

    const getOrderedOptions = (chave: string, unicosSet: Set<string>) => {
      const arr = Array.from(unicosSet);
      const idPerg = ids[chave];
      if (!idPerg) return arr.sort();
      const p = perguntas.find((item) => Number(item.id) === Number(idPerg));
      if (!p || !p.opcoes || p.opcoes.length === 0) return arr.sort();

      return arr.sort((a, b) => {
        const indexA = p.opcoes!.findIndex(
          (o) => normalizeStr(o.opcao_texto) === normalizeStr(a)
        );
        const indexB = p.opcoes!.findIndex(
          (o) => normalizeStr(o.opcao_texto) === normalizeStr(b)
        );
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    };

    return {
      demografiaIds: ids,
      perfisPorSessao: perfis,
      opcoesDemograficas: {
        logradouro: getOrderedOptions('logradouro', unicos.logradouro),
        genero: getOrderedOptions('genero', unicos.genero),
        renda: getOrderedOptions('renda', unicos.renda),
        idade: getOrderedOptions('idade', unicos.idade),
      },
    };
  }, [perguntas, respostas]);

  useEffect(() => {
    if (filtroAtivo !== 'geral') setSubFiltroAtivo('todos');
    else setSubFiltroAtivo('');
  }, [filtroAtivo]);

  // Função para Ocultar TODAS as Perguntas de Filtro/Demográficas do relatório
  const isPerguntaRedundante = (perguntaTitulo: string) => {
    const t = normalizeStr(perguntaTitulo);
    if (
      t.includes('logradouro') ||
      t.includes('bairro') ||
      t.includes('local') ||
      t.includes('genero') ||
      t.includes('sexo') ||
      t.includes('renda') ||
      t.includes('salario') ||
      t.includes('idade') ||
      t.includes('etaria')
    ) {
      return true;
    }
    return false;
  };

  // Cálculo Estatístico Blindado com verificação robusta de múltiplos gêneros
  const calcularEstatisticasPergunta = (
    pergunta: Pergunta,
    baseRespostas: any[],
    splitKey?: string,
    perfis?: any
  ) => {
    const respostasDaPergunta = baseRespostas.filter(
      (r: any) => Number(r.pergunta_id) === Number(pergunta.id)
    );
    const totalVotos = respostasDaPergunta.length;

    let splitValues = ['Geral'];
    if (splitKey && perfis) {
      const unicos = new Set<string>();
      baseRespostas.forEach((r) => {
        const val = perfis[r.sessao_id]?.[splitKey];
        if (val) unicos.add(val);
      });
      let arr = Array.from(unicos);
      arr.sort((a, b) => {
        if (a.toLowerCase() === 'masculino') return -1;
        if (b.toLowerCase() === 'masculino') return 1;
        if (a.toLowerCase() === 'feminino') return -1;
        if (b.toLowerCase() === 'feminino') return 1;
        return a.localeCompare(b);
      });
      // Blindagem central: Se houver menos de 2 gêneros, força 'Geral' (barra única)
      splitValues = arr.length > 1 ? arr : ['Geral'];
    }

    if (pergunta.tipo === 'texto' || pergunta.tipo === 'texto_livre') {
      const textosMap: Record<string, number> = {};
      respostasDaPergunta.forEach((r: any) => {
        const txt = (r.resposta || r.opcao_texto || '').trim();
        if (txt && txt !== 'undefined' && txt !== 'null') {
          textosMap[txt] = (textosMap[txt] || 0) + 1;
        }
      });
      const textosAgrupados = Object.entries(textosMap).map(([texto, qtd]) => ({
        texto,
        quantidade: qtd,
      }));
      return {
        tipo: 'texto',
        textos: textosAgrupados,
        total: totalVotos,
        splitValues: ['Geral'],
      };
    }

    if (
      pergunta.tipo === 'verdadeiro_falso' &&
      pergunta.opcoes &&
      pergunta.opcoes.length > 0
    ) {
      const estatisticasVF = pergunta.opcoes.map((opcao) => {
        const splitsData: Record<
          string,
          { verdadeiro: number; falso: number }
        > = {};

        splitValues.forEach((sv) => {
          const respsDoSplit =
            splitKey && sv !== 'Geral'
              ? respostasDaPergunta.filter(
                  (r) =>
                    normalizeStr(perfis[r.sessao_id]?.[splitKey]) ===
                    normalizeStr(sv)
                )
              : respostasDaPergunta;

          let contagemVerdadeiro = 0;
          let contagemFalso = 0;

          respsDoSplit.forEach((r: any) => {
            const rawVal = r.resposta || r.opcao_texto;
            if (!rawVal || rawVal === 'undefined') return;
            try {
              const parsed =
                typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
              if (parsed && typeof parsed === 'object') {
                const valorOpcao = parsed[opcao.opcao_texto];
                if (String(valorOpcao).toLowerCase() === 'verdadeiro')
                  contagemVerdadeiro++;
                else if (String(valorOpcao).toLowerCase() === 'falso')
                  contagemFalso++;
              }
            } catch (e) {}
          });

          const totalOpcao = contagemVerdadeiro + contagemFalso;
          splitsData[sv] = {
            verdadeiro:
              totalOpcao > 0
                ? Number(((contagemVerdadeiro / totalOpcao) * 100).toFixed(1))
                : 0,
            falso:
              totalOpcao > 0
                ? Number(((contagemFalso / totalOpcao) * 100).toFixed(1))
                : 0,
          };
        });

        return { texto: opcao.opcao_texto, splits: splitsData };
      });

      return {
        tipo: 'verdadeiro_falso_com_opcoes',
        subItens: estatisticasVF,
        total: totalVotos,
        splitValues,
      };
    }

    const opcoesCalculadas = (pergunta.opcoes || []).map((opcao) => {
      const optText = String(opcao.opcao_texto || '')
        .trim()
        .toLowerCase();
      const splitsData: Record<
        string,
        { contagem: number; porcentagem: number }
      > = {};

      splitValues.forEach((sv) => {
        const respsDoSplit =
          splitKey && sv !== 'Geral'
            ? respostasDaPergunta.filter(
                (r) =>
                  normalizeStr(perfis[r.sessao_id]?.[splitKey]) ===
                  normalizeStr(sv)
              )
            : respostasDaPergunta;

        const contagem = respsDoSplit.filter((r: any) => {
          const rOpt = String(r.opcao_texto || '')
            .trim()
            .toLowerCase();
          const rResp = String(r.resposta || '')
            .trim()
            .toLowerCase();
          const resolvedResp = normalizeStr(getRespostaTexto(r, perguntas));
          if (rOpt === optText || rResp === optText || resolvedResp === optText)
            return true;
          if (r.resposta && r.resposta !== 'undefined') {
            try {
              const parsed = JSON.parse(r.resposta);
              if (Array.isArray(parsed))
                return parsed.some(
                  (item: any) => normalizeStr(String(item)) === optText
                );
            } catch {}
          }
          return false;
        }).length;
        splitsData[sv] = { contagem, porcentagem: 0 };
      });
      return { texto: opcao.opcao_texto, splits: splitsData };
    });

    splitValues.forEach((sv) => {
      const respsDoSplit =
        splitKey && sv !== 'Geral'
          ? respostasDaPergunta.filter(
              (r) =>
                normalizeStr(perfis[r.sessao_id]?.[splitKey]) ===
                normalizeStr(sv)
            )
          : respostasDaPergunta;
      const totalDoSplit = respsDoSplit.length;
      let baseCalculo = totalDoSplit;
      if (pergunta.tipo === 'multipla_multipla') {
        baseCalculo = opcoesCalculadas.reduce(
          (acc, curr) => acc + (curr.splits[sv]?.contagem || 0),
          0
        );
      }
      opcoesCalculadas.forEach((opcao) => {
        if (!opcao.splits[sv])
          opcao.splits[sv] = { contagem: 0, porcentagem: 0 };
        opcao.splits[sv].porcentagem =
          baseCalculo > 0
            ? Number(
                (
                  ((opcao.splits[sv]?.contagem || 0) / baseCalculo) *
                  100
                ).toFixed(1)
              )
            : 0;
      });
    });

    return {
      tipo: 'opcoes',
      opcoes: opcoesCalculadas,
      total: totalVotos,
      splitValues,
    };
  };

  const partesFiltro = filtroAtivo.split('_');
  const chavePrincipal = partesFiltro[0];
  const temGer = filtroAtivo.includes('geral');

  let currentSplitKey: string | undefined = undefined;
  if (
    filtroAtivo === 'genero' ||
    filtroAtivo === 'genero_geral' ||
    filtroAtivo.includes('_genero')
  ) {
    currentSplitKey = 'genero';
  }

  const precisaSubfiltro = filtroAtivo !== 'geral';
  const opcoesSubfiltro =
    opcoesDemograficas[chavePrincipal as keyof typeof opcoesDemograficas] || [];
  const labelChavePrincipal = labelMap[chavePrincipal] || chavePrincipal;

  let gruposParaRenderizar: { nome: string; respostas: any[] }[] = [];

  if (filtroAtivo === 'geral') {
    gruposParaRenderizar = [{ nome: 'Geral', respostas: respostas }];
  } else if (filtroAtivo === 'genero') {
    if (subFiltroAtivo === 'todos') {
      gruposParaRenderizar = [{ nome: 'Geral', respostas: respostas }];
      currentSplitKey = 'genero';
    } else if (subFiltroAtivo) {
      gruposParaRenderizar = [
        {
          nome: `Gênero: ${subFiltroAtivo}`,
          respostas: respostas.filter(
            (r) =>
              normalizeStr(perfisPorSessao[r.sessao_id]?.['genero']) ===
              normalizeStr(subFiltroAtivo)
          ),
        },
      ];
      currentSplitKey = undefined;
    }
  } else if (filtroAtivo === 'genero_geral') {
    if (subFiltroAtivo === 'todos') {
      gruposParaRenderizar = [
        { nome: 'Gênero (Comparativo)', respostas: respostas },
      ];
      currentSplitKey = 'genero';
    } else if (subFiltroAtivo) {
      gruposParaRenderizar = [
        {
          nome: `Gênero: ${subFiltroAtivo}`,
          respostas: respostas.filter(
            (r) =>
              normalizeStr(perfisPorSessao[r.sessao_id]?.['genero']) ===
              normalizeStr(subFiltroAtivo)
          ),
        },
      ];
      currentSplitKey = undefined;
    }
  } else {
    if (subFiltroAtivo === 'todos') {
      opcoesSubfiltro.forEach((opcao) => {
        const filtradas = respostas.filter((r) => {
          const val = perfisPorSessao[r.sessao_id]?.[chavePrincipal];
          return val && normalizeStr(val) === normalizeStr(opcao);
        });
        if (filtradas.length > 0) {
          gruposParaRenderizar.push({
            nome: `${labelChavePrincipal}: ${opcao}`,
            respostas: filtradas,
          });
        }
      });
    } else if (subFiltroAtivo) {
      gruposParaRenderizar = [
        {
          nome: `${labelChavePrincipal}: ${subFiltroAtivo}`,
          respostas: respostas.filter(
            (r) =>
              normalizeStr(perfisPorSessao[r.sessao_id]?.[chavePrincipal]) ===
              normalizeStr(subFiltroAtivo)
          ),
        },
      ];
      currentSplitKey = filtroAtivo.includes('_genero') ? 'genero' : undefined;
    }
  }

  const grupoGeralConsolidado =
    temGer && subFiltroAtivo === 'todos'
      ? { nome: 'Geral', respostas: respostas }
      : null;

  const splitKeyForGeral = filtroAtivo.endsWith('_geral')
    ? undefined
    : currentSplitKey;

  const gruposNormais =
    temGer && subFiltroAtivo === 'todos'
      ? gruposParaRenderizar.filter((g) => g.nome !== 'Geral')
      : gruposParaRenderizar;

  const categorizarGrupo = (nome: string) => {
    if (chavePrincipal === 'logradouro') {
      const val = nome
        .replace(`${labelMap.logradouro}: `, '')
        .trim()
        .toUpperCase();
      if (val.startsWith('ZU')) return 'ZU - ZONA URBANA';
      if (val.startsWith('ZO')) return 'ZO - ZONA OESTE';
      if (val.startsWith('ZR')) return 'ZR - ZONA RURAL';
      return 'OUTROS LOCAIS';
    }
    return '';
  };

  const groupedByCategory = gruposNormais.reduce(
    (acc, grupo) => {
      const cat = categorizarGrupo(grupo.nome);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(grupo);
      return acc;
    },
    {} as Record<string, typeof gruposNormais>
  );

  const perguntasVisiveis = perguntas.filter(
    (p) => !isPerguntaRedundante(p.id, p.titulo)
  );

  // =========================================================================
  // GERAÇÃO DE PDF NATIVO (@react-pdf/renderer) INTEGRADA AOS FILTROS
  // =========================================================================
  const handleInfoSetup = () => navigate(`/admin/relatorios/${id}/info`);

  // const handleGerarPDF = async () => {
  //   const toastId = toast.loading('Compilando documento PDF nativo...');
  //   try {
  //     // Cria uma cópia inteligente das categorias enviadas pro PDF, injetando o grupoGeralConsolidado no final
  //     const pdfGroupedByCategory = { ...groupedByCategory };

  //     if (grupoGeralConsolidado) {
  //       pdfGroupedByCategory['GERAL (DADOS CONSOLIDADOS)'] = [
  //         grupoGeralConsolidado,
  //       ];
  //     }

  //     // Um "wrapper" que garante que o grupo geral obedeça ao 'splitKeyForGeral' enquanto os normais usam 'currentSplitKey'
  //     const wrapperCalcularEstatisticas = (
  //       perguntaPDF: Pergunta,
  //       respostasDoGrupo: any[],
  //       splitKeyBase: string | undefined,
  //       perfis: any
  //     ) => {
  //       const ehGrupoGeral =
  //         grupoGeralConsolidado &&
  //         respostasDoGrupo === grupoGeralConsolidado.respostas;
  //       const keyCorreta = ehGrupoGeral ? splitKeyForGeral : splitKeyBase;
  //       return calcularEstatisticasPergunta(
  //         perguntaPDF,
  //         respostasDoGrupo,
  //         keyCorreta,
  //         perfis
  //       );
  //     };

  //     const doc = (
  //       <RelatorioPDFDocument
  //         pesquisaInfo={pesquisaInfo}
  //         configPdf={configPdf}
  //         configSistema={configSistema}
  //         groupedByCategory={pdfGroupedByCategory}
  //         perguntasVisiveis={perguntasVisiveis}
  //         calcularEstatisticasPergunta={wrapperCalcularEstatisticas}
  //         currentSplitKey={currentSplitKey}
  //         perfisPorSessao={perfisPorSessao}
  //       />
  //     );

  //     const blob = await pdf(doc).toBlob();
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `Relatorio_Oficial_${pesquisaInfo.titulo || 'Pesquisa'}.pdf`;
  //     link.click();
  //     URL.revokeObjectURL(url);

  //     toast.success('PDF Gerado e baixado com sucesso!', { id: toastId });
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('Ocorreu um erro ao gerar o PDF.', { id: toastId });
  //   }
  // };

  const handleGerarPDF = async () => {
    const toastId = toast.loading('Calculando sumário inteligente...');
    try {
      // Cria uma cópia inteligente das categorias enviadas pro PDF, injetando o grupoGeralConsolidado no final
      const pdfGroupedByCategory = { ...groupedByCategory };

      if (grupoGeralConsolidado) {
        pdfGroupedByCategory['GERAL (DADOS CONSOLIDADOS)'] = [
          grupoGeralConsolidado,
        ];
      }

      // Um "wrapper" que garante que o grupo geral obedeça ao 'splitKeyForGeral'
      const wrapperCalcularEstatisticas = (
        perguntaPDF: Pergunta,
        respostasDoGrupo: any[],
        splitKeyBase: string | undefined,
        perfis: any
      ) => {
        const ehGrupoGeral =
          grupoGeralConsolidado &&
          respostasDoGrupo === grupoGeralConsolidado.respostas;
        const keyCorreta = ehGrupoGeral ? splitKeyForGeral : splitKeyBase;
        return calcularEstatisticasPergunta(
          perguntaPDF,
          respostasDoGrupo,
          keyCorreta,
          perfis
        );
      };

      // 1. EXTRAIR OS NOMES DOS GRUPOS
      const nomesGrupos: string[] = [];
      Object.entries(pdfGroupedByCategory).forEach(
        ([_, grupos]: [string, any]) => {
          grupos.forEach((g: any) => {
            nomesGrupos.push(g.nome);
          });
        }
      );

      // 2. GERAR PDF RASCUNHO (Invisível, sem sumário calculado)
      const docRascunho = (
        <RelatorioPDFDocument
          pesquisaInfo={pesquisaInfo}
          configPdf={configPdf}
          configSistema={configSistema}
          groupedByCategory={pdfGroupedByCategory}
          perguntasVisiveis={perguntasVisiveis}
          calcularEstatisticasPergunta={wrapperCalcularEstatisticas}
          currentSplitKey={currentSplitKey}
          perfisPorSessao={perfisPorSessao}
          mapeamentoPaginas={{}} // <-- Vazio no rascunho
        />
      );
      const blobRascunho = await pdf(docRascunho).toBlob();

      // 3. MANDAR PRO BACKEND CALCULAR AS PÁGINAS
      toast.loading('Mapeando páginas do sumário...', { id: toastId });
      const formData = new FormData();
      formData.append('pdf', blobRascunho, 'rascunho.pdf');
      formData.append('nomesGrupos', JSON.stringify(nomesGrupos));

      // Note o "/api" na frente, igual você usa no resto do arquivo!
      const response = await api.post('/api/pdf-sumario/calcular', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const paginasMapeadas = response.data;

      // 4. GERAR PDF OFICIAL COM AS PÁGINAS PREENCHIDAS
      toast.loading('Finalizando documento oficial...', { id: toastId });
      const docOficial = (
        <RelatorioPDFDocument
          pesquisaInfo={pesquisaInfo}
          configPdf={configPdf}
          configSistema={configSistema}
          groupedByCategory={pdfGroupedByCategory}
          perguntasVisiveis={perguntasVisiveis}
          calcularEstatisticasPergunta={wrapperCalcularEstatisticas}
          currentSplitKey={currentSplitKey}
          perfisPorSessao={perfisPorSessao}
          mapeamentoPaginas={paginasMapeadas} // <-- PÁGINAS REAIS DO BACKEND AQUI!
        />
      );

      const blobOficial = await pdf(docOficial).toBlob();
      const url = URL.createObjectURL(blobOficial);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Oficial_${pesquisaInfo.titulo || 'Pesquisa'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('PDF Gerado e baixado com sucesso!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao gerar o PDF.', { id: toastId });
    }
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

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto print:p-0 print:bg-white print:text-black">
          <button
            onClick={() => navigate('/admin/relatorios')}
            className={`print:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer w-fit ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Relatórios</span>
          </button>

          <div
            className={`print:hidden p-6 rounded-2xl border shadow-sm space-y-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Filter size={20} style={{ color: 'var(--primary-color)' }} />
                Controles e Filtros
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors focus-within:ring-2 focus-within:ring-orange-500/50"
                  style={{ borderColor: 'var(--primary-color)' }}
                >
                  <select
                    value={filtroAtivo}
                    onChange={(e) => setFiltroAtivo(e.target.value)}
                    className={`bg-transparent text-sm font-semibold outline-none cursor-pointer w-full ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}
                    style={{ color: 'var(--primary-color)' }}
                  >
                    {filtros.map((f) => (
                      <option
                        key={f.value}
                        value={f.value}
                        className={
                          theme === 'dark'
                            ? 'bg-[#121214] text-white'
                            : 'bg-white text-zinc-900'
                        }
                      >
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {precisaSubfiltro && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border focus-within:ring-2 focus-within:ring-orange-500/50 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                  >
                    <select
                      value={subFiltroAtivo}
                      onChange={(e) => setSubFiltroAtivo(e.target.value)}
                      className={`bg-transparent text-sm font-medium outline-none cursor-pointer ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}
                    >
                      <option
                        value=""
                        className={
                          theme === 'dark' ? 'bg-[#121214]' : 'bg-white'
                        }
                      >
                        Selecione uma opção...
                      </option>
                      <option
                        value="todos"
                        className={
                          theme === 'dark' ? 'bg-[#121214]' : 'bg-white'
                        }
                      >
                        Todos (Todos juntos no PDF)
                      </option>
                      {opcoesSubfiltro.map((op, idx) => (
                        <option
                          key={idx}
                          value={op}
                          className={
                            theme === 'dark' ? 'bg-[#121214]' : 'bg-white'
                          }
                        >
                          {labelChavePrincipal}: {op}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleGerarPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <FileDown size={18} />
                  <span>Gerar PDF Oficial</span>
                </button>
                <button
                  onClick={handleInfoSetup}
                  title="Configurar capa do PDF"
                  className={`p-2.5 rounded-xl border transition-all hover:opacity-80 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                >
                  <Info size={20} />
                </button>
              </div>
            </div>
          </div>

          <div
            id="relatorio-header"
            className={`p-8 rounded-2xl shadow-sm mb-8 print:shadow-none print:rounded-none print:px-0 print:border-b-2 print:border-zinc-300 ${theme === 'dark' ? 'bg-[#1a1a1e] border border-[#29292e]' : 'bg-white border border-zinc-200'}`}
          >
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight uppercase print:text-black">
                  {pesquisaInfo.titulo}
                </h1>
                <p className="text-sm opacity-60 font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Relatório de Resultados Oficiais
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div
                  className="flex items-center gap-2 text-sm font-bold text-white px-3 py-1.5 rounded-lg print:text-black print:border print:border-zinc-300"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <Users size={16} />
                  {pesquisaInfo.totalRespostas || 0} Entrevistados
                </div>
                <div
                  className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-100'} print:bg-white print:border print:border-zinc-300`}
                >
                  <Filter size={16} />
                  Visão: {
                    filtros.find((f) => f.value === filtroAtivo)?.label
                  }{' '}
                  {subFiltroAtivo
                    ? `(${subFiltroAtivo === 'todos' ? 'Todos' : subFiltroAtivo})`
                    : ''}
                </div>
                <div
                  className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-100'} print:bg-white print:border print:border-zinc-300`}
                >
                  <Calendar size={16} />
                  Gerado em: {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          {precisaSubfiltro && !subFiltroAtivo && (
            <div
              className={`p-6 rounded-2xl border text-center opacity-75 print:hidden ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <p className="text-sm font-medium">
                Selecione uma opção no subfiltro acima para visualizar os dados.
              </p>
            </div>
          )}

          {(!precisaSubfiltro || (precisaSubfiltro && subFiltroAtivo)) &&
            (loading ? (
              <div className="flex justify-center py-12 print:hidden">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: 'var(--primary-color)' }}
                />
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedByCategory).map(([catName, grupos]) => (
                  <div key={catName} className="space-y-10">
                    {catName && (
                      <h2 className="text-2xl font-black uppercase text-center border-b-2 pb-4 mb-4 print:text-black print:border-black">
                        {catName}
                      </h2>
                    )}

                    {grupos.map((grupo, gIdx) => (
                      <div
                        key={gIdx}
                        className="space-y-6 print:break-inside-avoid"
                      >
                        {grupo.nome !== 'Geral' && (
                          <div
                            className={`font-bold text-lg p-4 rounded-xl border-l-4 shadow-sm print:border-l-4 print:shadow-none print:bg-zinc-50 print:text-black ${theme === 'dark' ? 'bg-[#29292e] text-zinc-100' : 'bg-zinc-100 text-zinc-800'}`}
                            style={{ borderLeftColor: 'var(--primary-color)' }}
                          >
                            {grupo.nome}
                          </div>
                        )}

                        {perguntasVisiveis.map((pergunta, index) => {
                          const resultado = calcularEstatisticasPergunta(
                            pergunta,
                            grupo.respostas,
                            currentSplitKey,
                            perfisPorSessao
                          );
                          const isSplit = resultado.splitValues.length > 1;

                          return (
                            <div
                              key={pergunta.id}
                              className={`p-6 md:p-8 rounded-2xl border shadow-sm print:shadow-none print:border-zinc-300 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                            >
                              <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-3">
                                  <div
                                    className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-sm print:border print:border-black"
                                    style={{
                                      backgroundColor: 'var(--primary-color)',
                                    }}
                                  >
                                    {index + 1}
                                  </div>
                                  <h3 className="font-bold text-lg md:text-xl leading-snug print:text-black uppercase">
                                    {pergunta.titulo}
                                  </h3>
                                </div>

                                {isSplit && (
                                  <div className="flex gap-4 text-xs font-bold uppercase tracking-wide print:text-black">
                                    {resultado.splitValues.map((sv) => (
                                      <div
                                        key={sv}
                                        className="flex items-center gap-1.5"
                                      >
                                        <div
                                          className={`w-3 h-3 rounded-sm ${normalizeStr(sv) === 'masculino' ? 'bg-green-700' : normalizeStr(sv) === 'feminino' ? 'bg-orange-500' : 'bg-blue-500'} print:!${normalizeStr(sv) === 'masculino' ? 'bg-green-700' : normalizeStr(sv) === 'feminino' ? 'bg-orange-500' : 'bg-blue-500'}`}
                                          style={{
                                            backgroundColor:
                                              normalizeStr(sv) === 'masculino'
                                                ? '#15803d'
                                                : normalizeStr(sv) ===
                                                    'feminino'
                                                  ? '#f97316'
                                                  : '#3b82f6',
                                          }}
                                        />
                                        {sv}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {resultado.tipo === 'opcoes' && (
                                <div
                                  className={`space-y-4 ${isSplit ? '' : 'pl-0 md:pl-11'}`}
                                >
                                  {resultado?.opcoes?.map(
                                    (opcao: any, i: number) => {
                                      if (isSplit) {
                                        return (
                                          <div
                                            key={i}
                                            className="flex items-center gap-4 mb-3"
                                          >
                                            <div className="w-1/3 md:w-1/4 font-bold text-sm uppercase leading-tight print:text-black">
                                              {opcao.texto}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1.5">
                                              {resultado?.splitValues?.map(
                                                (sv: string) => {
                                                  const pct =
                                                    opcao.splits[sv]
                                                      ?.porcentagem || 0;
                                                  const colorHex =
                                                    normalizeStr(sv) ===
                                                    'masculino'
                                                      ? '#15803d'
                                                      : normalizeStr(sv) ===
                                                          'feminino'
                                                        ? '#f97316'
                                                        : '#3b82f6';
                                                  return (
                                                    <div
                                                      key={sv}
                                                      className="flex items-center gap-3"
                                                    >
                                                      <div className="flex-1 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden print:border print:border-zinc-300">
                                                        <div
                                                          className="h-full rounded-sm transition-all"
                                                          style={{
                                                            width: `${pct}%`,
                                                            backgroundColor:
                                                              pct > 0
                                                                ? colorHex
                                                                : 'transparent',
                                                          }}
                                                        />
                                                      </div>
                                                      <div className="w-12 text-right font-bold text-sm print:text-black">
                                                        {pct}%
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        const pctGeral =
                                          opcao.splits['Geral']?.porcentagem ||
                                          0;
                                        return (
                                          <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between items-end text-sm">
                                              <span className="font-medium print:text-black">
                                                {opcao.texto}
                                              </span>
                                              <span className="font-bold text-zinc-500 text-xs print:text-black">
                                                {pctGeral}%
                                              </span>
                                            </div>
                                            <div
                                              className={`w-full h-3 rounded-full overflow-hidden print:border print:border-zinc-300 ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                            >
                                              <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out print:!bg-orange-500"
                                                style={{
                                                  width: `${pctGeral}%`,
                                                  backgroundColor:
                                                    'var(--primary-color)',
                                                }}
                                              />
                                            </div>
                                          </div>
                                        );
                                      }
                                    }
                                  )}
                                </div>
                              )}

                              {resultado.tipo === 'texto' && (
                                <div className="space-y-3 pl-0 md:pl-11">
                                  {resultado.textos &&
                                  resultado.textos.length > 0 ? (
                                    resultado.textos.map(
                                      (item: any, i: number) => (
                                        <div
                                          key={i}
                                          className={`p-3.5 rounded-xl border flex items-start gap-3 text-sm print:border-zinc-300 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                                        >
                                          <MessageSquare
                                            size={16}
                                            className="mt-0.5 shrink-0 opacity-60"
                                          />
                                          <span className="leading-relaxed font-semibold">
                                            {item.quantidade > 1
                                              ? `${item.quantidade}x - `
                                              : ''}
                                            "{item.texto}"
                                          </span>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p
                                      className={`text-xs italic ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                                    >
                                      Nenhuma resposta registrada neste
                                      segmento.
                                    </p>
                                  )}
                                </div>
                              )}

                              {resultado.tipo ===
                                'verdadeiro_falso_com_opcoes' && (
                                <div
                                  className={`space-y-4 ${isSplit ? '' : 'pl-0 md:pl-11'}`}
                                >
                                  {resultado.subItens?.map(
                                    (sub: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className={`p-4 rounded-xl border space-y-3 print:border-zinc-300 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                                      >
                                        <span className="text-sm font-bold block print:text-black">
                                          {sub.texto}
                                        </span>

                                        {isSplit ? (
                                          <div className="space-y-3 pt-1">
                                            {resultado.splitValues.map(
                                              (sv: string) => {
                                                const pVerdadeiro =
                                                  sub.splits[sv]?.verdadeiro ||
                                                  0;
                                                const pFalso =
                                                  sub.splits[sv]?.falso || 0;
                                                const colorHex =
                                                  normalizeStr(sv) ===
                                                  'masculino'
                                                    ? '#15803d'
                                                    : normalizeStr(sv) ===
                                                        'feminino'
                                                      ? '#f97316'
                                                      : '#3b82f6';
                                                return (
                                                  <div
                                                    key={sv}
                                                    className="space-y-1.5 border-t pt-2 first:border-t-0 first:pt-0 dark:border-zinc-800"
                                                  >
                                                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                                      {sv}
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs font-medium text-emerald-500">
                                                      <span>Verdadeiro</span>
                                                      <span>
                                                        {pVerdadeiro}%
                                                      </span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                                      <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                          width: `${pVerdadeiro}%`,
                                                          backgroundColor:
                                                            colorHex,
                                                        }}
                                                      />
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs font-medium text-rose-500 pt-1">
                                                      <span>Falso</span>
                                                      <span>{pFalso}%</span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                                      <div
                                                        className="h-full rounded-full bg-rose-500"
                                                        style={{
                                                          width: `${pFalso}%`,
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <div className="space-y-1">
                                              <div className="flex justify-between items-end text-xs">
                                                <span className="font-medium text-emerald-500">
                                                  Verdadeiro
                                                </span>
                                                <span className="font-bold text-zinc-500 print:text-black">
                                                  {sub.splits['Geral']
                                                    ?.verdadeiro || 0}
                                                  %
                                                </span>
                                              </div>
                                              <div
                                                className={`w-full h-2.5 rounded-full overflow-hidden print:border print:border-zinc-300 ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                              >
                                                <div
                                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 print:bg-emerald-500"
                                                  style={{
                                                    width: `${sub.splits['Geral']?.verdadeiro || 0}%`,
                                                  }}
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-1">
                                              <div className="flex justify-between items-end text-xs">
                                                <span className="font-medium text-rose-500">
                                                  Falso
                                                </span>
                                                <span className="font-bold text-zinc-500 print:text-black">
                                                  {sub.splits['Geral']?.falso ||
                                                    0}
                                                  %
                                                </span>
                                              </div>
                                              <div
                                                className={`w-full h-2.5 rounded-full overflow-hidden print:border print:border-zinc-300 ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                              >
                                                <div
                                                  className="h-full bg-rose-500 rounded-full transition-all duration-500 print:bg-rose-500"
                                                  style={{
                                                    width: `${sub.splits['Geral']?.falso || 0}%`,
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}

                {grupoGeralConsolidado && (
                  <div className="space-y-6 pt-8 border-t-4 border-zinc-500/20 print:break-before-page">
                    <h2 className="text-2xl font-black uppercase text-center border-b-2 pb-4 mb-6 print:text-black print:border-black">
                      Geral
                    </h2>

                    <div
                      className={`font-bold text-lg p-4 rounded-xl border-l-4 shadow-sm print:border-l-4 print:shadow-none print:bg-zinc-50 print:text-black ${theme === 'dark' ? 'bg-[#29292e] text-zinc-100' : 'bg-zinc-100 text-zinc-800'}`}
                      style={{ borderLeftColor: 'var(--primary-color)' }}
                    >
                      Todos os Dados Consolidados
                    </div>

                    {perguntasVisiveis.map((pergunta, index) => {
                      const resultado = calcularEstatisticasPergunta(
                        pergunta,
                        grupoGeralConsolidado.respostas,
                        splitKeyForGeral,
                        perfisPorSessao
                      );
                      const isSplit = resultado.splitValues.length > 1;

                      return (
                        <div
                          key={`geral-${pergunta.id}`}
                          className={`p-6 md:p-8 rounded-2xl border shadow-sm print:shadow-none print:border-zinc-300 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-3">
                              <div
                                className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-sm print:border print:border-black"
                                style={{
                                  backgroundColor: 'var(--primary-color)',
                                }}
                              >
                                {index + 1}
                              </div>
                              <h3 className="font-bold text-lg md:text-xl leading-snug print:text-black uppercase">
                                {pergunta.titulo}
                              </h3>
                            </div>

                            {isSplit && (
                              <div className="flex gap-4 text-xs font-bold uppercase tracking-wide print:text-black">
                                {resultado.splitValues.map((sv) => (
                                  <div
                                    key={sv}
                                    className="flex items-center gap-1.5"
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-sm ${normalizeStr(sv) === 'masculino' ? 'bg-green-700' : normalizeStr(sv) === 'feminino' ? 'bg-orange-500' : 'bg-blue-500'} print:!${normalizeStr(sv) === 'masculino' ? 'bg-green-700' : normalizeStr(sv) === 'feminino' ? 'bg-orange-500' : 'bg-blue-500'}`}
                                      style={{
                                        backgroundColor:
                                          normalizeStr(sv) === 'masculino'
                                            ? '#15803d'
                                            : normalizeStr(sv) === 'feminino'
                                              ? '#f97316'
                                              : '#3b82f6',
                                      }}
                                    />
                                    {sv}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {resultado.tipo === 'opcoes' && (
                            <div
                              className={`space-y-4 ${isSplit ? '' : 'pl-0 md:pl-11'}`}
                            >
                              {resultado?.opcoes?.map(
                                (opcao: any, i: number) => {
                                  if (isSplit) {
                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center gap-4 mb-3"
                                      >
                                        <div className="w-1/3 md:w-1/4 font-bold text-sm uppercase leading-tight print:text-black">
                                          {opcao.texto}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1.5">
                                          {resultado?.splitValues?.map(
                                            (sv: string) => {
                                              const pct =
                                                opcao.splits[sv]?.porcentagem ||
                                                0;
                                              const colorHex =
                                                normalizeStr(sv) === 'masculino'
                                                  ? '#15803d'
                                                  : normalizeStr(sv) ===
                                                      'feminino'
                                                    ? '#f97316'
                                                    : '#3b82f6';
                                              return (
                                                <div
                                                  key={sv}
                                                  className="flex items-center gap-3"
                                                >
                                                  <div className="flex-1 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden print:border print:border-zinc-300">
                                                    <div
                                                      className="h-full rounded-sm transition-all"
                                                      style={{
                                                        width: `${pct}%`,
                                                        backgroundColor:
                                                          pct > 0
                                                            ? colorHex
                                                            : 'transparent',
                                                      }}
                                                    />
                                                  </div>
                                                  <div className="w-12 text-right font-bold text-sm print:text-black">
                                                    {pct}%
                                                  </div>
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    const pctGeral =
                                      opcao.splits['Geral']?.porcentagem || 0;
                                    return (
                                      <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between items-end text-sm">
                                          <span className="font-medium print:text-black">
                                            {opcao.texto}
                                          </span>
                                          <span className="font-bold text-zinc-500 text-xs print:text-black">
                                            {pctGeral}%
                                          </span>
                                        </div>
                                        <div
                                          className={`w-full h-3 rounded-full overflow-hidden print:border print:border-zinc-300 ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                        >
                                          <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out print:!bg-orange-500"
                                            style={{
                                              width: `${pctGeral}%`,
                                              backgroundColor:
                                                'var(--primary-color)',
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  }
                                }
                              )}
                            </div>
                          )}

                          {resultado.tipo === 'texto' && (
                            <div className="space-y-3 pl-0 md:pl-11">
                              {resultado.textos &&
                              resultado.textos.length > 0 ? (
                                resultado.textos.map((item: any, i: number) => (
                                  <div
                                    key={i}
                                    className={`p-3.5 rounded-xl border flex items-start gap-3 text-sm print:border-zinc-300 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                                  >
                                    <MessageSquare
                                      size={16}
                                      className="mt-0.5 shrink-0 opacity-60"
                                    />
                                    <span className="leading-relaxed font-semibold">
                                      {item.quantidade > 1
                                        ? `${item.quantidade}x - `
                                        : ''}
                                      "{item.texto}"
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p
                                  className={`text-xs italic ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                                >
                                  Nenhuma resposta registrada neste segmento.
                                </p>
                              )}
                            </div>
                          )}

                          {resultado.tipo === 'verdadeiro_falso_com_opcoes' && (
                            <div
                              className={`space-y-4 ${isSplit ? '' : 'pl-0 md:pl-11'}`}
                            >
                              {resultado.subItens?.map(
                                (sub: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`p-4 rounded-xl border space-y-3 print:border-zinc-300 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                                  >
                                    <span className="text-sm font-bold block print:text-black">
                                      {sub.texto}
                                    </span>

                                    {isSplit ? (
                                      <div className="space-y-3 pt-1">
                                        {resultado.splitValues.map(
                                          (sv: string) => {
                                            const pVerdadeiro =
                                              sub.splits[sv]?.verdadeiro || 0;
                                            const pFalso =
                                              sub.splits[sv]?.falso || 0;
                                            const colorHex =
                                              normalizeStr(sv) === 'masculino'
                                                ? '#15803d'
                                                : normalizeStr(sv) ===
                                                    'feminino'
                                                  ? '#f97316'
                                                  : '#3b82f6';
                                            return (
                                              <div
                                                key={sv}
                                                className="space-y-1.5 border-t pt-2 first:border-t-0 first:pt-0 dark:border-zinc-800"
                                              >
                                                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                                  {sv}
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-medium text-emerald-500">
                                                  <span>Verdadeiro</span>
                                                  <span>{pVerdadeiro}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                                  <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                      width: `${pVerdadeiro}%`,
                                                      backgroundColor: colorHex,
                                                    }}
                                                  />
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-medium text-rose-500 pt-1">
                                                  <span>Falso</span>
                                                  <span>{pFalso}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                                  <div
                                                    className="h-full rounded-full bg-rose-500"
                                                    style={{
                                                      width: `${pFalso}%`,
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-end text-xs">
                                            <span className="font-medium text-emerald-500">
                                              Verdadeiro
                                            </span>
                                            <span className="font-bold text-zinc-500 print:text-black">
                                              {sub.splits['Geral']
                                                ?.verdadeiro || 0}
                                              %
                                            </span>
                                          </div>
                                          <div
                                            className={`w-full h-2.5 rounded-full overflow-hidden print:border print:border-zinc-300 ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                          >
                                            <div
                                              className="h-full bg-emerald-500 rounded-full transition-all duration-500 print:bg-emerald-500"
                                              style={{
                                                width: `${sub.splits['Geral']?.verdadeiro || 0}%`,
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-end text-xs">
                                            <span className="font-medium text-rose-500">
                                              Falso
                                            </span>
                                            <span className="font-bold text-zinc-500 print:text-black">
                                              {sub.splits['Geral']?.falso || 0}%
                                            </span>
                                          </div>
                                          <div
                                            className={`w-full h-2.5 rounded-full overflow-hidden print:border print:border-zinc-300 ${theme === 'dark' ? 'bg-[#29292e]' : 'bg-zinc-200'}`}
                                          >
                                            <div
                                              className="h-full bg-rose-500 rounded-full transition-all duration-500 print:bg-rose-500"
                                              style={{
                                                width: `${sub.splits['Geral']?.falso || 0}%`,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {perguntasVisiveis.length === 0 && !loading && (
                  <div
                    className={`p-12 text-center rounded-2xl border print:hidden ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'}`}
                  >
                    Esta pesquisa ainda não possui perguntas visíveis
                    cadastradas para o filtro selecionado.
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
