import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserSidebar } from '../../../components/Sidebar/UserSidebar';
import { Header } from '../../../components/Header/Header';
import { dbLocal, RespostaOffline } from '../../../services/dbLocal';
import { api } from '../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  WifiOff,
  Wifi,
  CloudUpload,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function EnviosUser() {
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pendentes, setPendentes] = useState<RespostaOffline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    // Monitora o estado da internet em tempo real
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    carregarPendentes();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function carregarPendentes() {
    try {
      setLoading(true);
      // Busca todas as respostas guardadas no IndexedDB (Dexie)
      const lista = await dbLocal.respostas_offline.toArray();
      setPendentes(lista);
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      toast.error('Erro ao carregar coletas offline.');
    } finally {
      setLoading(false);
    }
  }

  // Função para sincronizar um item individual ou todos
  async function sincronizarItem(item: RespostaOffline) {
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet para sincronizar.');
      return;
    }

    try {
      // Envia para o backend a sessão e respostas salvas offline
      await api.post('/api/resposta-sessoes', {
        pesquisa_id: item.pesquisa_id,
        usuario_id: JSON.parse(localStorage.getItem('user') || '{}').id || 1,
        equipe_id:
          JSON.parse(localStorage.getItem('user') || '{}').equipe_id || null,
        dispositivo: 'Mobile Offline',
        respostas: item.respostas,
        data_coleta: item.data_coleta,
      });

      // Se enviou com sucesso, apaga do IndexedDB local
      if (item.id) {
        await dbLocal.respostas_offline.delete(item.id);
      }

      toast.success('Entrevista sincronizada com sucesso!');
      carregarPendentes();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao sincronizar entrevista. Tente novamente.');
    }
  }

  async function sincronizarTudo() {
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet.');
      return;
    }

    if (pendentes.length === 0) return;

    setSincronizando(true);
    let sucessos = 0;

    for (const item of pendentes) {
      try {
        await api.post('/api/resposta-sessoes', {
          pesquisa_id: item.pesquisa_id,
          usuario_id: JSON.parse(localStorage.getItem('user') || '{}').id || 1,
          equipe_id:
            JSON.parse(localStorage.getItem('user') || '{}').equipe_id || null,
          dispositivo: 'Mobile Offline',
          respostas: item.respostas,
          data_coleta: item.data_coleta,
        });

        if (item.id) {
          await dbLocal.respostas_offline.delete(item.id);
        }
        sucessos++;
      } catch (err) {
        console.error('Falha ao sincronizar item:', err);
      }
    }

    setSincronizando(false);
    toast.success(
      `${sucessos} de ${pendentes.length} entrevistas sincronizadas!`
    );
    carregarPendentes();
  }

  async function apagarLocal(id?: number) {
    if (!id) return;
    if (
      confirm(
        'Tem certeza que deseja apagar esta resposta guardada localmente?'
      )
    ) {
      await dbLocal.respostas_offline.delete(id);
      toast.success('Registro local removido.');
      carregarPendentes();
    }
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
          title="Gestão de Envios (Offline)"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          {/* BARRA DE ESTADO DE CONEXÃO E SINCRONIZAÇÃO */}
          <div
            className={`p-5 rounded-2xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
              >
                {isOnline ? <Wifi size={22} /> : <WifiOff size={22} />}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isOnline ? 'Conectado à Internet' : 'Modo Offline Ativo'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {pendentes.length}{' '}
                  {pendentes.length === 1
                    ? 'resposta aguardando'
                    : 'respostas aguardando'}{' '}
                  envio.
                </p>
              </div>
            </div>

            {pendentes.length > 0 && (
              <button
                onClick={sincronizarTudo}
                disabled={!isOnline || sincronizando}
                className="py-2.5 px-5 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer text-sm"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <CloudUpload size={18} />
                <span>
                  {sincronizando ? 'A sincronizar...' : 'Sincronizar Todos'}
                </span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">
              Coletas Pendentes no Dispositivo
            </h2>
            <p className="text-xs text-zinc-400">
              Respostas preenchidas sem conexão que estão armazenadas de forma
              segura no seu navegador.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              A carregar registos locais...
            </div>
          ) : pendentes.length === 0 ? (
            <div
              className={`p-12 rounded-2xl border text-center space-y-3 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <CheckCircle2
                size={40}
                className="mx-auto text-emerald-500 opacity-60"
              />
              <h3 className="font-bold text-base">Tudo Sincronizado!</h3>
              <p className="text-xs text-zinc-400">
                Não existem respostas pendentes guardadas neste dispositivo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendentes.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase">
                        Pendente
                      </span>
                      <h4 className="font-bold text-base">
                        {item.pesquisa_titulo}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar
                          size={13}
                          style={{ color: 'var(--primary-color)' }}
                        />
                        {new Date(item.data_coleta).toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers
                          size={13}
                          style={{ color: 'var(--primary-color)' }}
                        />
                        {item.respostas?.length || 0} questões respondidas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-700/20">
                    <button
                      onClick={() => sincronizarItem(item)}
                      disabled={!isOnline}
                      className="flex-1 md:flex-none py-2 px-4 rounded-xl text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-40 cursor-pointer"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <CloudUpload size={15} />
                      <span>Sincronizar</span>
                    </button>

                    <button
                      onClick={() => apagarLocal(item.id)}
                      className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Apagar do dispositivo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default EnviosUser;
