import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../../components/Header/Header';
import { pesquisaService } from '../../../../services/pesquisaService';
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
} from 'lucide-react';

interface Pergunta {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
  descricao?: string;
  obrigatoria?: number;
}

interface Pesquisa {
  id: number;
  titulo: string;
  empresa?: string;
  descricao?: string;
  status?: string;
}

export function DetalhesPesquisa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pesquisa, setPesquisa] = useState<Pesquisa | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);

  // Modais de Edição
  const [isEditPesquisaModalOpen, setIsEditPesquisaModalOpen] = useState(false);
  const [pesquisaForm, setPesquisaForm] = useState({
    titulo: '',
    empresa: '',
    descricao: '',
  });

  useEffect(() => {
    if (id) {
      loadDetalhesPesquisa();
    }
  }, [id]);

  async function loadDetalhesPesquisa() {
    try {
      // Busca dados da pesquisa
      const res = await pesquisaService.getAll();
      const lista = res.pesquisas || res;
      const encontrada = lista.find((p: Pesquisa) => p.id === Number(id));
      if (encontrada) {
        setPesquisa(encontrada);
        setPesquisaForm({
          titulo: encontrada.titulo || '',
          empresa: encontrada.empresa || '',
          descricao: encontrada.descricao || '',
        });
      }

      // Busca perguntas vinculadas a esta pesquisa
      const perguntasRes = await api.get(`/api/perguntas?pesquisa_id=${id}`);
      const listaPerguntas =
        perguntasRes.data.perguntas || perguntasRes.data || [];
      // Ordena por ordem
      setPerguntas(
        listaPerguntas.sort((a: Pergunta, b: Pergunta) => a.ordem - b.ordem)
      );
    } catch {
      toast.error('Erro ao carregar detalhes da pesquisa.');
    }
  }

  // Subir ou Descer ordem da pergunta
  const handleMudarOrdem = async (
    index: number,
    direcao: 'subir' | 'descer'
  ) => {
    const novaLista = [...perguntas];
    const targetIndex = direcao === 'subir' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= novaLista.length) return;

    // Troca de posições
    const temp = novaLista[index];
    novaLista[index] = novaLista[targetIndex];
    novaLista[targetIndex] = temp;

    // Reatribui o campo ordem sequencialmente
    const listaAtualizada = novaLista.map((p, idx) => ({
      ...p,
      ordem: idx + 1,
    }));

    setPerguntas(listaAtualizada);

    // Opcional: Salvar no backend a nova ordem
    try {
      for (const p of listaAtualizada) {
        await api.put(`/api/perguntas/${p.id}`, { ordem: p.ordem });
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
          {/* Botão Voltar */}
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

          {/* Cabeçalho com dados da pesquisa */}
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
                <div className="flex items-center gap-3">
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
                  className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
                >
                  Empresa:{' '}
                  <span className="text-white">
                    {pesquisa?.empresa || 'Não informada'}
                  </span>
                </p>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  {pesquisa?.descricao || 'Sem descrição informada.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditPesquisaModalOpen(true)}
              className="py-2.5 px-5 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer self-start md:self-center"
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
              onClick={() => toast.success('Modal de adicionar pergunta')}
              className="w-full sm:w-auto py-2.5 px-5 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Plus size={18} />
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          {/* Lista de Perguntas com Ordenação por Setas */}
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
                    {/* Botões de Subir / Descer Ordem */}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400">
                          #{pergunta.ordem}
                        </span>
                        <h4 className="font-bold text-base truncate">
                          {pergunta.titulo}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-blue-500/10 text-blue-400">
                          {pergunta.tipo}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                      >
                        {pergunta.descricao || 'Sem descrição adicional.'}
                      </p>
                    </div>
                  </div>

                  {/* Ações da Pergunta */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toast.success('Editar pergunta')}
                      className="p-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                      title="Editar Pergunta"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => toast.success('Excluir pergunta')}
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

      {/* Modal para Editar Dados Básicos da Pesquisa */}
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
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
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
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                />
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
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditPesquisaModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-white font-medium shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
