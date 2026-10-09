import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../../components/Header/Header';
import { pesquisaService } from '../../../../services/pesquisaService';
import { perguntaService } from '../../../../services/perguntaService';
import { perguntaOpcaoService } from '../../../../services/perguntaOpcaoService';
import { api } from '../../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  FileText,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  X,
  Layers,
  Send,
} from 'lucide-react';

interface Opcao {
  id?: number;
  opcao_texto: string;
  pergunta_id?: number;
  ordem?: number;
}

interface PerguntaTemplate {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
  obrigatoria?: number;
  escala_max?: number;
  template_id: number;
  opcoes?: Opcao[];
}

export function DetalhesTemplate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [template, setTemplate] = useState<any>(null);
  const [perguntas, setPerguntas] = useState<PerguntaTemplate[]>([]);
  const [pesquisas, setPesquisas] = useState<any[]>([]);

  const [isPerguntaModalOpen, setIsPerguntaModalOpen] = useState(false);
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [modalPerguntaType, setModalPerguntaType] = useState<'nova' | 'editar'>(
    'nova'
  );
  const [selectedPergunta, setSelectedPergunta] =
    useState<PerguntaTemplate | null>(null);

  const [posicaoInsercao, setPosicaoInsercao] = useState<'inicio' | 'fim'>(
    'fim'
  );
  const [pesquisaSelecionadaId, setPesquisaSelecionadaId] = useState<
    number | ''
  >('');
  const [opcoesRemovidas, setOpcoesRemovidas] = useState<number[]>([]);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    titulo: string;
  }>({ isOpen: false, id: null, titulo: '' });

  const [perguntaForm, setPerguntaForm] = useState({
    titulo: '',
    tipo: 'multipla_unica',
    obrigatoria: 1,
    escala_max: 5,
    opcoes: [{ id: null as number | null, opcao_texto: '' }],
  });

  useEffect(() => {
    if (id) {
      loadTemplateData();
      loadPesquisasDisponiveis();
    }
  }, [id]);

  async function loadTemplateData() {
    try {
      const resTemplates = await api.get('/api/templates-perguntas');
      const listaTemplates =
        resTemplates.data?.templates || resTemplates.data || [];
      const encontrado = listaTemplates.find((t: any) => t.id === Number(id));

      setTemplate(
        encontrado || {
          id,
          titulo: 'Template Reutilizável',
          descricao: 'Modelo reutilizável de perguntas',
        }
      );

      const resPerguntas = await perguntaService.getAll();
      const listaPerguntas = resPerguntas.perguntas || resPerguntas || [];
      const filtradas = listaPerguntas.filter(
        (p: any) => Number(p.template_id) === Number(id)
      );

      try {
        const opcoesRes = await perguntaOpcaoService.getAll();
        const todasOpcoes =
          opcoesRes.opcoes || opcoesRes.data?.opcoes || opcoesRes || [];

        filtradas.forEach((p: PerguntaTemplate) => {
          p.opcoes = todasOpcoes
            .filter((o: Opcao) => Number(o.pergunta_id) === Number(p.id))
            .sort((a: Opcao, b: Opcao) => (a.ordem || 0) - (b.ordem || 0));
        });
      } catch (err) {
        console.error('Erro ao buscar opções:', err);
      }

      const ordenadas = filtradas.sort(
        (a: PerguntaTemplate, b: PerguntaTemplate) =>
          (a.ordem || 0) - (b.ordem || 0)
      );
      const normalizadas = ordenadas.map((p: any, idx: any) => ({
        ...p,
        ordem: idx + 1,
      }));

      setPerguntas(normalizadas);
    } catch {
      toast.error('Erro ao carregar dados do template.');
    }
  }

  async function loadPesquisasDisponiveis() {
    try {
      const res = await pesquisaService.getAll();
      setPesquisas(res.pesquisas || res || []);
    } catch {
      console.error('Erro ao carregar pesquisas');
    }
  }

  const handleMudarOrdem = async (
    index: number,
    direcao: 'subir' | 'descer'
  ) => {
    const novaLista = [...perguntas];
    const targetIndex = direcao === 'subir' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= novaLista.length) return;

    const temp = novaLista[index];
    novaLista[index] = novaLista[targetIndex];
    novaLista[targetIndex] = temp;

    const listaAtualizada = novaLista.map((p, idx) => ({
      ...p,
      ordem: idx + 1,
    }));

    setPerguntas(listaAtualizada);

    try {
      for (const p of listaAtualizada) {
        await perguntaService.update(p.id, { ordem: p.ordem });
      }
      toast.success('Ordem atualizada!');
    } catch {
      toast.error('Erro ao salvar nova ordem.');
    }
  };

  const handleOpenModalPergunta = (
    type: 'nova' | 'editar',
    pergunta: PerguntaTemplate | null = null
  ) => {
    setModalPerguntaType(type);
    setOpcoesRemovidas([]);

    if (type === 'editar' && pergunta) {
      setSelectedPergunta(pergunta);
      const opcoesMapeadas =
        pergunta.opcoes && pergunta.opcoes.length > 0
          ? pergunta.opcoes.map((o) => ({
              id: o.id || null,
              opcao_texto: o.opcao_texto,
            }))
          : [{ id: null, opcao_texto: '' }];

      setPerguntaForm({
        titulo: pergunta.titulo || '',
        tipo: pergunta.tipo || 'multipla_unica',
        obrigatoria: pergunta.obrigatoria ?? 1,
        escala_max: pergunta.escala_max || 5,
        opcoes: opcoesMapeadas,
      });
    } else {
      setSelectedPergunta(null);
      setPerguntaForm({
        titulo: '',
        tipo: 'multipla_unica',
        obrigatoria: 1,
        escala_max: 5,
        opcoes: [{ id: null, opcao_texto: '' }],
      });
    }
    setIsPerguntaModalOpen(true);
  };

  const handleAddOpcao = () => {
    setPerguntaForm({
      ...perguntaForm,
      opcoes: [...perguntaForm.opcoes, { id: null, opcao_texto: '' }],
    });
  };

  const handleRemoveOpcao = (index: number) => {
    const opcao = perguntaForm.opcoes[index];
    if (opcao.id) {
      setOpcoesRemovidas([...opcoesRemovidas, opcao.id]);
    }
    const novasOpcoes = perguntaForm.opcoes.filter((_, i) => i !== index);
    setPerguntaForm({
      ...perguntaForm,
      opcoes:
        novasOpcoes.length > 0 ? novasOpcoes : [{ id: null, opcao_texto: '' }],
    });
  };

  const handleOpcaoChange = (index: number, value: string) => {
    const novasOpcoes = [...perguntaForm.opcoes];
    novasOpcoes[index].opcao_texto = value;
    setPerguntaForm({ ...perguntaForm, opcoes: novasOpcoes });
  };

  const handleSavePergunta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const proximaOrdem =
        modalPerguntaType === 'nova'
          ? perguntas.length + 1
          : selectedPergunta?.ordem;

      const payloadPergunta = {
        titulo: perguntaForm.titulo,
        descricao: 'sem descrição',
        tipo: perguntaForm.tipo,
        obrigatoria: Number(perguntaForm.obrigatoria),
        template_id: Number(id),
        pesquisa_id: null,
        ordem: proximaOrdem,
        escala_max:
          perguntaForm.tipo === 'escala'
            ? Number(perguntaForm.escala_max)
            : undefined,
      };

      let perguntaId = selectedPergunta?.id;

      if (modalPerguntaType === 'nova') {
        const res = await perguntaService.create(payloadPergunta);

        if (res && res.id) {
          perguntaId = res.id;
        } else if (res && res.pergunta && res.pergunta.id) {
          perguntaId = res.pergunta.id;
        } else if (res && res.data && res.data.id) {
          perguntaId = res.data.id;
        }

        if (!perguntaId) {
          const todasPerguntasRes = await perguntaService.getAll();
          const listaPerguntas =
            todasPerguntasRes.perguntas || todasPerguntasRes || [];
          const perguntaResgatada = listaPerguntas
            .filter((p: any) => Number(p.template_id) === Number(id))
            .sort((a: any, b: any) => b.id - a.id)[0];

          if (perguntaResgatada && perguntaResgatada.id) {
            perguntaId = perguntaResgatada.id;
          }
        }
      } else if (perguntaId) {
        await perguntaService.update(perguntaId, payloadPergunta);
      }

      if (!perguntaId) {
        toast.error('Erro ao identificar o ID da pergunta.');
        return;
      }

      const precisaDeOpcoes = [
        'multipla_unica',
        'multipla_multipla',
        'selecione',
        'verdadeiro_falso',
      ].includes(perguntaForm.tipo);

      if (perguntaId && precisaDeOpcoes) {
        for (const opId of opcoesRemovidas) {
          await perguntaOpcaoService.delete(opId);
        }

        for (let i = 0; i < perguntaForm.opcoes.length; i++) {
          const op = perguntaForm.opcoes[i];
          if (!op.opcao_texto.trim()) continue;

          if (op.id) {
            await perguntaOpcaoService.update(op.id, {
              opcao_texto: op.opcao_texto,
              ordem: i + 1,
            });
          } else {
            await perguntaOpcaoService.create({
              pergunta_id: perguntaId,
              opcao_texto: op.opcao_texto,
              ordem: i + 1,
            });
          }
        }
      }

      toast.success(
        modalPerguntaType === 'nova'
          ? 'Pergunta adicionada ao template!'
          : 'Pergunta atualizada!'
      );
      setIsPerguntaModalOpen(false);
      loadTemplateData();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao salvar pergunta.');
    }
  };

  const confirmDeletePergunta = (id: number, titulo: string) => {
    setDeleteModal({ isOpen: true, id, titulo });
  };

  const executeDeletePergunta = async () => {
    if (!deleteModal.id) return;
    try {
      await perguntaService.delete(deleteModal.id);

      const restantes = perguntas.filter((p) => p.id !== deleteModal.id);
      for (let i = 0; i < restantes.length; i++) {
        await perguntaService.update(restantes[i].id, { ordem: i + 1 });
      }

      toast.success('Pergunta excluída com sucesso!');
      setDeleteModal({ isOpen: false, id: null, titulo: '' });
      loadTemplateData();
    } catch {
      toast.error('Erro ao excluir pergunta.');
    }
  };

  const handleInjetarNaPesquisa = async () => {
    if (!pesquisaSelecionadaId) {
      toast.error('Selecione uma pesquisa de destino.');
      return;
    }

    if (perguntas.length === 0) {
      toast.error('Este template não tem perguntas.');
      return;
    }

    try {
      const resPesq = await perguntaService.getAll({
        pesquisa_id: pesquisaSelecionadaId,
      });
      const perguntasDestino =
        resPesq.perguntas || resPesq.data?.perguntas || resPesq || [];

      const existentesOrdenadas = perguntasDestino.sort(
        (a: any, b: any) => (a.ordem || 0) - (b.ordem || 0)
      );

      if (posicaoInsercao === 'inicio') {
        // Desloca as existentes para a frente
        for (let i = 0; i < existentesOrdenadas.length; i++) {
          const pExistente = existentesOrdenadas[i];
          const novaOrdemExistente = perguntas.length + i + 1;
          await perguntaService.update(pExistente.id, {
            ordem: novaOrdemExistente,
          });
        }
      }

      const ultimaOrdemExistente =
        existentesOrdenadas.length > 0
          ? Math.max(...existentesOrdenadas.map((p: any) => p.ordem || 0))
          : 0;

      // Injeta as perguntas do template
      for (let i = 0; i < perguntas.length; i++) {
        const pOrig = perguntas[i];
        const novaOrdem =
          posicaoInsercao === 'inicio' ? i + 1 : ultimaOrdemExistente + i + 1;

        const novaPRes = await perguntaService.create({
          titulo: pOrig.titulo,
          descricao: 'sem descrição',
          tipo: pOrig.tipo,
          obrigatoria: pOrig.obrigatoria ?? 1,
          pesquisa_id: Number(pesquisaSelecionadaId),
          template_id: null,
          ordem: novaOrdem,
          escala_max: pOrig.escala_max, // Garante que a escala vai junto
        });

        // 🚨 TENTATIVA BLINDADA DE OBTER O ID
        let novaId =
          novaPRes?.id ||
          novaPRes?.pergunta?.id ||
          novaPRes?.data?.id ||
          novaPRes?.data?.pergunta?.id;

        // 🚨 FALLBACK: Se o ID não veio direto do backend, busca a última criada
        if (!novaId) {
          const fallbackRes = await perguntaService.getAll({
            pesquisa_id: pesquisaSelecionadaId,
          });
          const listaFallback =
            fallbackRes.perguntas ||
            fallbackRes.data?.perguntas ||
            fallbackRes ||
            [];

          const resgatada = listaFallback
            .filter(
              (p: any) =>
                Number(p.pesquisa_id) === Number(pesquisaSelecionadaId)
            )
            .sort((a: any, b: any) => b.id - a.id)[0];

          if (resgatada && resgatada.id) {
            novaId = resgatada.id;
          }
        }

        // 🚨 Só insere as opções se encontrar o ID com sucesso
        if (novaId && pOrig.opcoes && pOrig.opcoes.length > 0) {
          for (let j = 0; j < pOrig.opcoes.length; j++) {
            const op = pOrig.opcoes[j];
            await perguntaOpcaoService.create({
              pergunta_id: novaId,
              opcao_texto: op.opcao_texto,
              ordem: op.ordem || j + 1,
            });
          }
        }
      }

      toast.success('Perguntas injetadas e ordenadas com sucesso!');
      setIsInjectModalOpen(false);
      navigate(`/admin/pesquisas/${pesquisaSelecionadaId}`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao injetar perguntas.');
    }
  };

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

  const precisaDeOpcoes = [
    'multipla_unica',
    'multipla_multipla',
    'selecione',
    'verdadeiro_falso',
  ].includes(perguntaForm.tipo);

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
          title="Gerenciar Template"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <button
            onClick={() => navigate('/admin/pesquisas')}
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
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {template?.titulo ||
                    template?.nome ||
                    'Template Reutilizável'}
                </h1>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  {template?.descricao || 'Modelo reutilizável de perguntas'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsInjectModalOpen(true)}
              className="py-2.5 px-5 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Send size={16} />
              <span>Adicionar a uma Pesquisa</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
            <div className="flex items-center gap-2">
              <Layers size={20} style={{ color: 'var(--primary-color)' }} />
              <h2 className="text-xl font-bold">
                Perguntas do Template ({perguntas.length})
              </h2>
            </div>
            <button
              onClick={() => handleOpenModalPergunta('nova')}
              className="w-full sm:w-auto py-2.5 px-5 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Plus size={18} />
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          <div className="space-y-4">
            {perguntas.length === 0 ? (
              <div
                className={`p-8 rounded-2xl border text-center ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
              >
                <p className="text-sm opacity-60">
                  Nenhuma pergunta cadastrada neste template ainda.
                </p>
              </div>
            ) : (
              perguntas.map((pergunta, index) => (
                <div
                  key={pergunta.id}
                  className={`p-4 md:p-5 rounded-2xl border shadow-md flex items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMudarOrdem(index, 'subir')}
                        disabled={index === 0}
                        className={`p-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200'}`}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMudarOrdem(index, 'descer')}
                        disabled={index === perguntas.length - 1}
                        className={`p-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300' : 'bg-zinc-50 border-zinc-200'}`}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400">
                          #{index + 1}
                        </span>
                        <h4 className="font-bold text-base truncate">
                          {pergunta.titulo}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-blue-500/10 text-blue-400">
                          {formatarTipoPergunta(pergunta.tipo)}
                        </span>
                        {pergunta.obrigatoria === 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-500/10 text-emerald-400">
                            Obrigatória
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleOpenModalPergunta('editar', pergunta)
                      }
                      className="p-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                      title="Editar Pergunta"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        confirmDeletePergunta(pergunta.id, pergunta.titulo)
                      }
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Excluir Pergunta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {isPerguntaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers size={20} style={{ color: 'var(--primary-color)' }} />
                {modalPerguntaType === 'nova'
                  ? 'Adicionar Pergunta'
                  : 'Editar Pergunta'}
              </h2>
              <button
                onClick={() => setIsPerguntaModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSavePergunta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold opacity-80">
                  Título da Pergunta
                </label>
                <input
                  type="text"
                  required
                  value={perguntaForm.titulo}
                  onChange={(e) =>
                    setPerguntaForm({ ...perguntaForm, titulo: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  placeholder="Ex: Pergunta do template"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold opacity-80">
                  Tipo da Pergunta
                </label>
                <select
                  value={perguntaForm.tipo}
                  onChange={(e) =>
                    setPerguntaForm({ ...perguntaForm, tipo: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                >
                  <option value="multipla_unica">
                    Múltipla Escolha (Única - Rádio)
                  </option>
                  <option value="multipla_multipla">
                    Múltipla Escolha (Várias - Checkbox)
                  </option>
                  <option value="selecione">Seleção (Dropdown / Select)</option>
                  <option value="texto">Texto Livre</option>
                  <option value="verdadeiro_falso">Verdadeiro ou Falso</option>
                  <option value="escala">Escala Numérica</option>
                  <option value="concordancia">Nível de Concordância</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="obrigatoria"
                  checked={perguntaForm.obrigatoria === 1}
                  onChange={(e) =>
                    setPerguntaForm({
                      ...perguntaForm,
                      obrigatoria: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-4 h-4 rounded border-zinc-300 text-orange-500 cursor-pointer"
                />
                <label
                  htmlFor="obrigatoria"
                  className="text-sm font-semibold cursor-pointer select-none"
                >
                  Pergunta Obrigatória
                </label>
              </div>

              {precisaDeOpcoes && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold opacity-80">
                      Opções de Resposta
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOpcao}
                      className="py-1 px-3 rounded-lg text-xs font-semibold text-white shadow-md flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <Plus size={14} />
                      <span>Adicionar Opção</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {perguntaForm.opcoes.map((opcao, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={opcao.opcao_texto}
                          onChange={(e) =>
                            handleOpcaoChange(index, e.target.value)
                          }
                          placeholder={`Opção ${index + 1}`}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOpcao(index)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPerguntaModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-medium cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] text-white' : 'bg-zinc-200 text-zinc-800'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-white font-medium shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <h2 className="text-xl font-bold">Adicionar Template à Pesquisa</h2>
            <p className="text-sm text-zinc-400">
              Escolha a pesquisa de destino e onde deseja inserir as perguntas.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">
                Selecione a Pesquisa
              </label>
              <select
                value={pesquisaSelecionadaId}
                onChange={(e) =>
                  setPesquisaSelecionadaId(Number(e.target.value))
                }
                className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
              >
                <option value="">Escolha uma pesquisa...</option>
                {pesquisas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">
                Posição de Inserção
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPosicaoInsercao('inicio')}
                  className={`py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${posicaoInsercao === 'inicio' ? 'bg-orange-500 text-white border-orange-500' : 'border-zinc-700'}`}
                >
                  No Início
                </button>
                <button
                  type="button"
                  onClick={() => setPosicaoInsercao('fim')}
                  className={`py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${posicaoInsercao === 'fim' ? 'bg-orange-500 text-white border-orange-500' : 'border-zinc-700'}`}
                >
                  No Final
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsInjectModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-700 text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleInjetarNaPesquisa}
                className="flex-1 py-3 rounded-xl text-white font-medium cursor-pointer"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Confirmar e Injetar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl text-center space-y-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            <p className="text-sm text-zinc-400">
              Tem a certeza de que pretende excluir a pergunta "
              {deleteModal.titulo}"?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, titulo: '' })
                }
                className="flex-1 py-2.5 rounded-xl bg-zinc-700 text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeletePergunta}
                className="flex-1 py-2.5 rounded-xl text-white font-medium bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalhesTemplate;
