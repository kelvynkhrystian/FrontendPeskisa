import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../../components/Header/Header';
import { pesquisaService } from '../../../../services/pesquisaService';
import { perguntaService } from '../../../../services/perguntaService';
import { perguntaOpcaoService } from '../../../../services/perguntaOpcaoService';
import { equipeService } from '../../../../services/equipeService';
import { pesquisaEquipeService } from '../../../../services/pesquisaEquipeService';
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
  Calendar,
  Users,
} from 'lucide-react';

interface Opcao {
  id?: number;
  opcao_texto: string;
  pergunta_id?: number;
  ordem?: number;
}

interface Pergunta {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: string;
  ordem: number;
  obrigatoria?: number;
  escala_max?: number;
  pesquisa_id: number;
  opcoes?: Opcao[];
}

interface Pesquisa {
  id: number;
  titulo: string;
  empresa?: string;
  descricao?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

export function DetalhesPesquisa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pesquisa, setPesquisa] = useState<Pesquisa | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [equipesVinculadas, setEquipesVinculadas] = useState<any[]>([]);

  const [isEditPesquisaModalOpen, setIsEditPesquisaModalOpen] = useState(false);
  const [isPerguntaModalOpen, setIsPerguntaModalOpen] = useState(false);
  const [modalPerguntaType, setModalPerguntaType] = useState<'nova' | 'editar'>(
    'nova'
  );
  const [selectedPergunta, setSelectedPergunta] = useState<Pergunta | null>(
    null
  );

  const [opcoesRemovidas, setOpcoesRemovidas] = useState<number[]>([]);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    titulo: string;
  }>({ isOpen: false, id: null, titulo: '' });

  const [pesquisaForm, setPesquisaForm] = useState({
    titulo: '',
    empresa: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    status: 'ativa',
  });

  const [perguntaForm, setPerguntaForm] = useState({
    titulo: '',
    tipo: 'multipla_unica',
    obrigatoria: 1,
    escala_max: 5,
    opcoes: [{ id: null as number | null, opcao_texto: '' }],
  });

  useEffect(() => {
    if (id) {
      loadDetalhesPesquisa();
      loadEquipesVinculadas();
    }
  }, [id]);

  async function loadEquipesVinculadas() {
    try {
      const [relacoesRes, equipesRes] = await Promise.all([
        pesquisaEquipeService.getByPesquisa(Number(id)),
        equipeService.getAll(),
      ]);

      const relacoes = relacoesRes.data || relacoesRes || [];
      const todasEquipes = equipesRes.equipes || equipesRes || [];

      const vinculadas = relacoes
        .map((rel: any) => {
          return (
            todasEquipes.find((eq: any) => eq.id === rel.equipe_id) ||
            rel.equipe
          );
        })
        .filter(Boolean);

      setEquipesVinculadas(vinculadas);
    } catch (err) {
      console.error('Erro ao buscar equipes vinculadas:', err);
    }
  }

  async function loadDetalhesPesquisa() {
    try {
      const res = await pesquisaService.getAll();
      const lista = res.pesquisas || res;
      const encontrada = lista.find((p: Pesquisa) => p.id === Number(id));

      if (encontrada) {
        setPesquisa(encontrada);
        setPesquisaForm({
          titulo: encontrada.titulo || '',
          empresa: encontrada.empresa || '',
          descricao: encontrada.descricao || '',
          data_inicio: encontrada.data_inicio
            ? encontrada.data_inicio.split('T')[0]
            : '',
          data_fim: encontrada.data_fim
            ? encontrada.data_fim.split('T')[0]
            : '',
          status: encontrada.status || 'ativa',
        });
      }

      const perguntasRes = await perguntaService.getAll({ pesquisa_id: id });
      const listaPerguntas = perguntasRes.perguntas || perguntasRes || [];
      const filtradas = listaPerguntas.filter(
        (p: Pergunta) => Number(p.pesquisa_id) === Number(id)
      );

      try {
        const opcoesRes = await perguntaOpcaoService.getAll();
        const todasOpcoes = opcoesRes.opcoes || opcoesRes || [];

        filtradas.forEach((p: Pergunta) => {
          p.opcoes = todasOpcoes
            .filter((o: Opcao) => Number(o.pergunta_id) === Number(p.id))
            .sort((a: Opcao, b: Opcao) => (a.ordem || 0) - (b.ordem || 0));
        });
      } catch (err) {
        console.error('Erro ao buscar opções das perguntas:', err);
      }

      setPerguntas(
        filtradas.sort((a: Pergunta, b: Pergunta) => a.ordem - b.ordem)
      );
    } catch {
      toast.error('Erro ao carregar detalhes da pesquisa.');
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

  const handleUpdatePesquisa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pesquisaService.update(Number(id), pesquisaForm);
      toast.success('Pesquisa atualizada com sucesso!');
      setIsEditPesquisaModalOpen(false);
      loadDetalhesPesquisa();
    } catch {
      toast.error('Erro ao atualizar pesquisa.');
    }
  };

  const handleOpenModalPergunta = (
    type: 'nova' | 'editar',
    pergunta: Pergunta | null = null
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
      const payloadPergunta = {
        titulo: perguntaForm.titulo,
        descricao: 'sem descrição',
        tipo: perguntaForm.tipo,
        obrigatoria: Number(perguntaForm.obrigatoria),
        pesquisa_id: Number(id),
        ordem:
          modalPerguntaType === 'nova'
            ? perguntas.length + 1
            : selectedPergunta?.ordem,
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

        // Se o ID veio nulo ou não veio, resgata imediatamente pelo título na base de dados
        if (!perguntaId) {
          const todasPerguntasRes = await perguntaService.getAll({
            pesquisa_id: id,
          });
          const listaPerguntas =
            todasPerguntasRes.perguntas || todasPerguntasRes || [];

          const perguntaResgatada = listaPerguntas
            .filter(
              (p: Pergunta) =>
                p.titulo === payloadPergunta.titulo &&
                Number(p.pesquisa_id) === payloadPergunta.pesquisa_id
            )
            .sort((a: Pergunta, b: Pergunta) => b.id - a.id)[0];

          if (perguntaResgatada && perguntaResgatada.id) {
            perguntaId = perguntaResgatada.id;
          }
        }
      } else if (perguntaId) {
        await perguntaService.update(perguntaId, payloadPergunta);
      }

      if (!perguntaId) {
        toast.error(
          'Erro crítico: Não foi possível identificar o ID da pergunta.'
        );
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
      } else if (perguntaId && !precisaDeOpcoes && selectedPergunta?.opcoes) {
        for (const op of selectedPergunta.opcoes) {
          if (op.id) await perguntaOpcaoService.delete(op.id);
        }
      }

      toast.success(
        modalPerguntaType === 'nova'
          ? 'Pergunta e opções salvas com sucesso!'
          : 'Pergunta atualizada!'
      );
      setIsPerguntaModalOpen(false);
      loadDetalhesPesquisa();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const msg =
        error.response?.data?.error ||
        error.message ||
        'Erro ao salvar pergunta.';
      toast.error(msg);
    }
  };

  const confirmDeletePergunta = (id: number, titulo: string) => {
    setDeleteModal({ isOpen: true, id, titulo });
  };

  const executeDeletePergunta = async () => {
    if (!deleteModal.id) return;
    try {
      await perguntaService.delete(deleteModal.id);
      toast.success('Pergunta excluída com sucesso!');
      setDeleteModal({ isOpen: false, id: null, titulo: '' });
      loadDetalhesPesquisa();
    } catch {
      toast.error('Erro ao excluir pergunta.');
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
          title="Gerenciar Pesquisa"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <button
            onClick={() => navigate('/admin/pesquisas')}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer w-fit ${
              theme === 'dark'
                ? 'bg-[#1a1a1e] border-[#29292e] hover:bg-zinc-800 text-zinc-300'
                : 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700'
            }`}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Pesquisas</span>
          </button>

          {/* Cabeçalho */}
          <div
            className={`p-6 md:p-8 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-4 rounded-2xl text-white shadow-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {pesquisa?.titulo || 'Carregando...'}
                  </h1>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${pesquisa?.status === 'ativa' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                  >
                    {pesquisa?.status || 'ativa'}
                  </span>
                </div>
                <p
                  className={`text-xs font-semibold`}
                  style={{ color: 'var(--primary-color)' }}
                >
                  {pesquisa?.empresa || 'Empresa não informada'}
                </p>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  {pesquisa?.descricao || 'Sem descrição informada.'}
                </p>

                <div className="flex items-center gap-2 text-xs pt-2 text-zinc-400 flex-wrap">
                  {pesquisa?.data_inicio && (
                    <div className="flex items-center gap-1.5">
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

                  {equipesVinculadas.length > 0 && (
                    <>
                      <span className="hidden sm:inline px-1 text-zinc-600">
                        •
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Users
                          size={14}
                          style={{ color: 'var(--primary-color)' }}
                        />
                        <span className="font-medium">
                          Equipes:{' '}
                          <span
                            className={
                              theme === 'dark'
                                ? 'text-zinc-300'
                                : 'text-zinc-700'
                            }
                          >
                            {equipesVinculadas.map((e) => e.nome).join(', ')}
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditPesquisaModalOpen(true)}
              className="py-2.5 px-5 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer self-start md:self-center flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Edit2 size={16} />
              <span>Editar Pesquisa</span>
            </button>
          </div>

          {/* Secção de Perguntas */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
            <div className="flex items-center gap-2">
              <Layers size={20} style={{ color: 'var(--primary-color)' }} />
              <h2 className="text-xl font-bold">
                Perguntas da Pesquisa ({perguntas.length})
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

          {/* Lista de Perguntas */}
          <div className="space-y-4">
            {perguntas.length === 0 ? (
              <div
                className={`p-8 rounded-2xl border text-center ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
              >
                <p className="text-sm opacity-60">
                  Nenhuma pergunta cadastrada nesta pesquisa ainda.
                </p>
              </div>
            ) : (
              perguntas.map((pergunta, index) => (
                <div
                  key={pergunta.id}
                  className={`p-4 md:p-5 rounded-2xl border shadow-md flex items-center justify-between gap-4 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMudarOrdem(index, 'subir')}
                        disabled={index === 0}
                        className={`p-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] hover:bg-zinc-800 text-zinc-300'
                            : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                        }`}
                        title="Subir ordem"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMudarOrdem(index, 'descer')}
                        disabled={index === perguntas.length - 1}
                        className={`p-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] hover:bg-zinc-800 text-zinc-300'
                            : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                        }`}
                        title="Descer ordem"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400">
                          #{pergunta.ordem}
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

      {/* Modal para Editar Dados da Pesquisa */}
      {isEditPesquisaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit2 size={20} style={{ color: 'var(--primary-color)' }} />
                Editar Dados da Pesquisa
              </h2>
              <button
                onClick={() => setIsEditPesquisaModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdatePesquisa} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold opacity-80">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={pesquisaForm.titulo}
                  onChange={(e) =>
                    setPesquisaForm({ ...pesquisaForm, titulo: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold opacity-80">
                  Empresa
                </label>
                <input
                  type="text"
                  value={pesquisaForm.empresa}
                  onChange={(e) =>
                    setPesquisaForm({
                      ...pesquisaForm,
                      empresa: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold opacity-80">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={pesquisaForm.data_inicio}
                    onChange={(e) =>
                      setPesquisaForm({
                        ...pesquisaForm,
                        data_inicio: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold opacity-80">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={pesquisaForm.data_fim}
                    onChange={(e) =>
                      setPesquisaForm({
                        ...pesquisaForm,
                        data_fim: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold opacity-80">
                  Status
                </label>
                <select
                  value={pesquisaForm.status}
                  onChange={(e) =>
                    setPesquisaForm({ ...pesquisaForm, status: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="ativa">Ativa</option>
                  <option value="pausada">Pausada</option>
                  <option value="encerrada">Encerrada</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold opacity-80">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={pesquisaForm.descricao}
                  onChange={(e) =>
                    setPesquisaForm({
                      ...pesquisaForm,
                      descricao: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditPesquisaModalOpen(false)}
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

      {/* Modal Inteligente para Adicionar / Editar Pergunta */}
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
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
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
                  placeholder="Ex: Em quem você votaria?"
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
                  className="w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
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
                          title="Excluir opção"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {perguntaForm.tipo === 'escala' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold opacity-80">
                    Intervalo da Escala Numérica
                  </label>
                  <select
                    value={perguntaForm.escala_max}
                    onChange={(e) =>
                      setPerguntaForm({
                        ...perguntaForm,
                        escala_max: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  >
                    <option value={3}>1 a 3</option>
                    <option value={5}>1 a 5</option>
                    <option value={10}>1 a 10</option>
                  </select>
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

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl text-center space-y-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            <p
              className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              Tem a certeza de que pretende excluir a pergunta{' '}
              <span className="font-semibold text-white">
                "{deleteModal.titulo}"
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, titulo: '' })
                }
                className={`flex-1 py-2.5 rounded-xl font-medium cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] text-white' : 'bg-zinc-200 text-zinc-800'}`}
              >
                Cancelar
              </button>
              <button
                onClick={executeDeletePergunta}
                className="flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg bg-red-600 hover:bg-red-700 cursor-pointer"
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

export default DetalhesPesquisa;
