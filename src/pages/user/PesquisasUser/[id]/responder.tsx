import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { UserSidebar } from '../../../../components/Sidebar/UserSidebar';
import { Header } from '../../../../components/Header/Header';
import { pesquisaService } from '../../../../services/pesquisaService';
import { perguntaService } from '../../../../services/perguntaService';
import { perguntaOpcaoService } from '../../../../services/perguntaOpcaoService';
import { api } from '../../../../services/api';
import { dbLocal } from '../../../../services/dbLocal';
import toast, { Toaster } from 'react-hot-toast';
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  WifiOff,
  CloudUpload,
  Send,
  AlertCircle,
  RefreshCw,
  List,
  Plus,
} from 'lucide-react';

interface Opcao {
  id: number;
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

interface ModalState {
  isOpen: boolean;
  type: 'online' | 'offline' | null;
}

export function ResponderPesquisa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pesquisa, setPesquisa] = useState<any>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<number, any>>({});

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });

  useEffect(() => {
    if (id) {
      loadPesquisa();
    }
  }, [id]);

  async function loadPesquisa() {
    try {
      setLoading(true);

      const resPesquisa = (await pesquisaService.getById)
        ? await pesquisaService.getById(Number(id))
        : null;
      if (resPesquisa) {
        setPesquisa(resPesquisa.pesquisa || resPesquisa);
      } else {
        const todas = await pesquisaService.getAll();
        const lista = todas.pesquisas || todas || [];
        setPesquisa(lista.find((p: any) => Number(p.id) === Number(id)));
      }

      const resPerguntas = await perguntaService.getAll({ pesquisa_id: id });
      const listaPerguntas: Pergunta[] =
        resPerguntas.perguntas || resPerguntas || [];
      const filtradas = listaPerguntas.filter(
        (p: any) => Number(p.pesquisa_id) === Number(id)
      );

      try {
        const opcoesRes = await perguntaOpcaoService.getAll();
        const todasOpcoes = opcoesRes.opcoes || opcoesRes || [];
        filtradas.forEach((p) => {
          p.opcoes = todasOpcoes
            .filter((o: any) => Number(o.pergunta_id) === Number(p.id))
            .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
        });
      } catch (err) {
        console.error('Erro ao carregar opções', err);
      }

      setPerguntas(filtradas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
    } catch (error) {
      toast.error('Erro ao carregar formulário da pesquisa.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (perguntaId: number, valor: any, tipo: string) => {
    setRespostas((prev) => {
      if (tipo === 'multipla_multipla') {
        const atual = prev[perguntaId] || [];
        if (atual.includes(valor)) {
          return {
            ...prev,
            [perguntaId]: atual.filter((v: any) => v !== valor),
          };
        } else {
          return { ...prev, [perguntaId]: [...atual, valor] };
        }
      }
      return { ...prev, [perguntaId]: valor };
    });
  };

  const handleSubmeter = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    for (const p of perguntas) {
      if (p.obrigatoria === 1) {
        const resp = respostas[p.id];
        if (
          resp === undefined ||
          resp === null ||
          resp === '' ||
          (Array.isArray(resp) && resp.length === 0)
        ) {
          toast.error(`A pergunta "${p.titulo}" é obrigatória.`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    // 1. EXTRAÇÃO BLINDADA DO USUÁRIO
    const userStorage = localStorage.getItem('user');
    const userObj = userStorage ? JSON.parse(userStorage) : {};

    // Se não encontrar o ID (por causa do erro 404 no auth/me), força o ID 1 para testes
    const usuarioId = userObj.id ? Number(userObj.id) : 1;

    const equipeRawId = userObj.equipe_id || userObj.equipeId;
    const equipeId = equipeRawId ? Number(equipeRawId) : null;

    // 2. DISPOSITIVO CURTO (< 20 caracteres)
    const dispositivoNome = window.innerWidth <= 768 ? 'Mobile' : 'Desktop';

    const payloadRespostas = perguntas.map((p) => {
      const isArray = Array.isArray(respostas[p.id]);
      const valorResposta = isArray
        ? JSON.stringify(respostas[p.id])
        : respostas[p.id];

      return {
        pergunta_id: p.id,
        valor: valorResposta || null,
        tipo: p.tipo,
      };
    });

    const payloadSessao = {
      pesquisa_id: Number(id),
      usuario_id: usuarioId,
      equipe_id: equipeId,
      dispositivo: dispositivoNome,
      respostas: payloadRespostas,
      data_coleta: new Date().toISOString(),
    };

    try {
      if (navigator.onLine) {
        // FLUXO ONLINE
        await api.post('/api/resposta-sessoes', payloadSessao);

        setModal({ isOpen: true, type: 'online' });
      } else {
        // FLUXO OFFLINE
        await dbLocal.respostas_offline.add({
          ...payloadSessao,
          pesquisa_titulo: pesquisa?.titulo || 'Pesquisa sem título',
        });

        setModal({ isOpen: true, type: 'offline' });
      }
    } catch (error: any) {
      console.error(error);
      const msgErro =
        error.response?.data?.message ||
        'Erro ao salvar a resposta. Verifique a validação do backend.';
      toast.error(msgErro);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRespostas({});
    setModal({ isOpen: false, type: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cores dinâmicas para bordas e fundos baseado no tema e na seleção
  const getBordaSelecionada = (selecionado: boolean) =>
    selecionado
      ? 'var(--primary-color)'
      : theme === 'dark'
        ? '#29292e'
        : '#e4e4e7';

  const renderOpcoes = (pergunta: Pergunta) => {
    const pId = pergunta.id;

    if (pergunta.tipo === 'texto') {
      return (
        <textarea
          value={respostas[pId] || ''}
          onChange={(e) => handleChange(pId, e.target.value, 'texto')}
          placeholder="Digite a resposta aqui..."
          rows={3}
          className={`w-full p-3 rounded-xl text-sm border outline-none resize-none transition-colors ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-300'}`}
          style={
            {
              focusVisible: { borderColor: 'var(--primary-color)' },
            } as React.CSSProperties
          }
        />
      );
    }

    if (pergunta.tipo === 'verdadeiro_falso') {
      return (
        <div className="flex gap-4">
          {['Verdadeiro', 'Falso'].map((op) => {
            const selecionado = respostas[pId] === op;
            return (
              <label
                key={op}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${theme === 'dark' ? 'bg-[#121214]' : 'bg-zinc-50'}`}
                style={{ borderColor: getBordaSelecionada(selecionado) }}
              >
                <input
                  type="radio"
                  name={`p_${pId}`}
                  value={op}
                  checked={selecionado}
                  onChange={() => handleChange(pId, op, 'verdadeiro_falso')}
                  className="hidden"
                />
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: selecionado
                      ? 'var(--primary-color)'
                      : '#a1a1aa',
                  }}
                >
                  {selecionado && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium">{op}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (pergunta.tipo === 'escala' || pergunta.tipo === 'concordancia') {
      let opcoes: string[] = [];
      if (pergunta.tipo === 'escala') {
        const max = pergunta.escala_max || 5;
        opcoes = Array.from({ length: max }, (_, i) => String(i + 1));
      } else {
        opcoes = [
          'Discordo totalmente',
          'Discordo',
          'Neutro',
          'Concordo',
          'Concordo totalmente',
        ];
      }

      return (
        <div
          className={`grid gap-2 ${pergunta.tipo === 'escala' ? 'grid-cols-5 md:grid-cols-10' : 'grid-cols-1 md:grid-cols-5'}`}
        >
          {opcoes.map((op) => {
            const selecionado = respostas[pId] === op;
            return (
              <label
                key={op}
                className={`flex flex-col items-center justify-center text-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${theme === 'dark' ? 'bg-[#121214] hover:bg-[#1a1a1e]' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                style={{ borderColor: getBordaSelecionada(selecionado) }}
              >
                <input
                  type="radio"
                  name={`p_${pId}`}
                  value={op}
                  checked={selecionado}
                  onChange={() => handleChange(pId, op, pergunta.tipo)}
                  className="hidden"
                />
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: selecionado
                      ? 'var(--primary-color)'
                      : '#a1a1aa',
                  }}
                >
                  {selecionado && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    />
                  )}
                </div>
                <span className="text-xs font-semibold leading-tight">
                  {op}
                </span>
              </label>
            );
          })}
        </div>
      );
    }

    if (pergunta.tipo === 'selecione') {
      return (
        <select
          value={respostas[pId] || ''}
          onChange={(e) => handleChange(pId, e.target.value, 'selecione')}
          className={`w-full p-3 rounded-xl text-sm border outline-none transition-colors ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-300'}`}
        >
          <option value="" disabled>
            Selecione uma opção...
          </option>
          {pergunta.opcoes?.map((op) => (
            <option key={op.id} value={op.opcao_texto}>
              {op.opcao_texto}
            </option>
          ))}
        </select>
      );
    }

    if (pergunta.tipo === 'multipla_unica') {
      return (
        <div className="space-y-2">
          {pergunta.opcoes?.map((op) => {
            const selecionado = respostas[pId] === op.opcao_texto;
            return (
              <label
                key={op.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${theme === 'dark' ? 'bg-[#121214] hover:bg-[#1a1a1e]' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                style={{ borderColor: getBordaSelecionada(selecionado) }}
              >
                <input
                  type="radio"
                  name={`p_${pId}`}
                  value={op.opcao_texto}
                  checked={selecionado}
                  onChange={() =>
                    handleChange(pId, op.opcao_texto, 'multipla_unica')
                  }
                  className="hidden"
                />
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    borderColor: selecionado
                      ? 'var(--primary-color)'
                      : '#a1a1aa',
                  }}
                >
                  {selecionado && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    />
                  )}
                </div>
                <span className="text-sm">{op.opcao_texto}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (pergunta.tipo === 'multipla_multipla') {
      const respAtual = respostas[pId] || [];
      return (
        <div className="space-y-2">
          {pergunta.opcoes?.map((op) => {
            const isChecked = respAtual.includes(op.opcao_texto);
            return (
              <label
                key={op.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${theme === 'dark' ? 'bg-[#121214] hover:bg-[#1a1a1e]' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                style={{ borderColor: getBordaSelecionada(isChecked) }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    handleChange(pId, op.opcao_texto, 'multipla_multipla')
                  }
                  className="hidden"
                />
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'border-transparent' : 'border-2 border-zinc-400'}`}
                  style={
                    isChecked ? { backgroundColor: 'var(--primary-color)' } : {}
                  }
                >
                  {isChecked && (
                    <CheckCircle size={14} strokeWidth={3} color="#ffffff" />
                  )}
                </div>
                <span className="text-sm">{op.opcao_texto}</span>
              </label>
            );
          })}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#121214] text-white' : 'bg-[#f4f4f5] text-zinc-800'}`}
      >
        <p className="text-sm font-medium">A carregar formulário...</p>
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
          title="Preencher Pesquisa"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 max-w-4xl mx-auto w-full">
          <button
            onClick={() => navigate(`/user/pesquisas/${id}`)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer w-fit ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Detalhes</span>
          </button>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {pesquisa?.titulo}
            </h1>
            <p className="text-sm text-zinc-500">
              Preencha os campos abaixo com as respostas do entrevistado.
            </p>
          </div>

          <form onSubmit={handleSubmeter} className="space-y-6">
            {perguntas.map((pergunta, index) => (
              <div
                key={pergunta.id}
                className={`p-6 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
              >
                <div className="mb-4 space-y-1.5">
                  <div className="flex gap-2">
                    <span
                      className="font-bold"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      {(index + 1).toString().padStart(2, '0')}.
                    </span>
                    <h3 className="font-bold text-base leading-snug">
                      {pergunta.titulo}
                    </h3>
                  </div>
                  {pergunta.obrigatoria === 1 && (
                    <span className="text-[10px] uppercase font-bold text-zinc-400 ml-6 flex items-center gap-1">
                      <AlertCircle size={10} /> Obrigatória
                    </span>
                  )}
                </div>

                <div className="pl-6">{renderOpcoes(pergunta)}</div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {isSubmitting ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
              <span>
                {isSubmitting ? 'A salvar...' : 'Concluir e Salvar Resposta'}
              </span>
            </button>
          </form>
        </main>
      </div>

      {/* MODAL DE SUCESSO */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl border p-8 shadow-2xl text-center space-y-6 transform transition-all scale-100 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            {modal.type === 'online' ? (
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/5">
                <CloudUpload size={40} />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-500/5">
                <WifiOff size={40} />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-bold">
                {modal.type === 'online'
                  ? 'Resposta Enviada!'
                  : 'Salvo Offline!'}
              </h3>
              <p
                className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                {modal.type === 'online'
                  ? 'A resposta foi computada e enviada para o servidor com sucesso.'
                  : 'Sua resposta foi salva no dispositivo. Sincronize depois para enviar à base de dados.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={resetForm}
                className="w-full py-3.5 rounded-xl text-white font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Plus size={18} />
                Fazer Nova Resposta
              </button>

              <button
                onClick={() =>
                  modal.type === 'online'
                    ? navigate(`/user/pesquisas/${id}`)
                    : navigate('/user/envios')
                }
                className={`w-full py-3.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-[#29292e] text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'}`}
              >
                {modal.type === 'online' ? (
                  <>
                    <ArrowLeft size={18} />
                    Voltar para a Pesquisa
                  </>
                ) : (
                  <>
                    <List size={18} />
                    Ir para Envios (Sincronizar)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResponderPesquisa;
