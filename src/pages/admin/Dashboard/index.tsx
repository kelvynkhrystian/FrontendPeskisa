import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  CheckCircle2,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  ClipboardList,
  RefreshCw,
  User,
  Users,
  FileText,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../components/Header/Header';
import { api } from '../../../services/api';

export function Dashboard() {
  const { theme, nomeApp } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [pesquisasAtivasCount, setPesquisasAtivasCount] = useState(0);
  const [respostasHoje, setRespostasHoje] = useState(0);
  const [respostasSemana, setRespostasSemana] = useState(0);
  const [respostasMes, setRespostasMes] = useState(0);
  const [dadosGrafico7Dias, setDadosGrafico7Dias] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [ultimosLogs, setUltimosLogs] = useState<any[]>([]);

  useEffect(() => {
    document.title = `Painel - ${nomeApp}`;
    carregarDadosReais();
  }, [nomeApp]);

  async function carregarDadosReais() {
    try {
      setLoading(true);

      // 1. Buscar Pesquisas, Equipes e Usuários
      let listaPesquisas = [];
      let equipesMap: Record<number, string> = {};
      let usuariosMap: Record<number, string> = {};

      try {
        const resPesq = await api.get('/api/pesquisas');
        listaPesquisas = resPesq.data.pesquisas || resPesq.data || [];
      } catch (e) {}

      try {
        const resEquipes = await api.get('/api/equipes');
        const eqData = resEquipes.data.equipes || resEquipes.data || [];
        eqData.forEach((eq: any) => {
          equipesMap[eq.id] = eq.nome || eq.nome_equipe;
        });
      } catch (e) {}

      try {
        const resUsers = await api.get('/api/users');
        const usrData = resUsers.data.users || resUsers.data || [];
        usrData.forEach((u: any) => {
          usuariosMap[u.id] = u.nome || u.name;
        });
      } catch (e) {}

      const ativas = listaPesquisas.filter(
        (p: any) => p.status === 'ativa' || p.ativa === true || !p.status
      );
      setPesquisasAtivasCount(ativas.length);

      const pesquisaMap: Record<number, string> = {};
      listaPesquisas.forEach((p: any) => {
        pesquisaMap[p.id] = p.titulo || `Pesquisa #${p.id}`;
      });

      // 2. Buscar Sessões Coletadas (resposta_sessoes)
      let listaSessoes = [];
      const rotasPossiveis = [
        '/api/resposta-sessoes',
        '/api/respostas',
        '/api/sessoes',
      ];

      for (const rota of rotasPossiveis) {
        try {
          const res = await api.get(rota);
          const dados =
            res.data.resposta_sessoes ||
            res.data.sessoes ||
            res.data.respostas ||
            res.data ||
            [];
          if (Array.isArray(dados) && dados.length > 0) {
            listaSessoes = dados;
            break;
          }
        } catch (err) {}
      }

      // 3. Cálculos de Datas e Gráfico fixo (Segunda a Domingo)
      const agora = new Date();
      agora.setHours(0, 0, 0, 0);

      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(agora.getDate() - 7);

      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      let hojeCount = 0;
      let semanaCount = 0;
      let mesCount = 0;

      const contagemSemanaFixa = [0, 0, 0, 0, 0, 0, 0];

      listaSessoes.forEach((r: any) => {
        const dataStr =
          r.criada_em || r.created_at || r.data_criacao || r.createdAt;
        if (!dataStr) return;

        const dataReg = new Date(dataStr);
        dataReg.setHours(0, 0, 0, 0);

        if (dataReg.getTime() === agora.getTime()) {
          hojeCount++;
        }

        if (dataReg >= umaSemanaAtras) {
          semanaCount++;
          let diaSemanaJS = dataReg.getDay();
          let indexSegDom = diaSemanaJS === 0 ? 6 : diaSemanaJS - 1;
          contagemSemanaFixa[indexSegDom] =
            (contagemSemanaFixa[indexSegDom] || 0) + 1;
        }

        if (dataReg >= inicioMes) {
          mesCount++;
        }
      });

      setRespostasHoje(hojeCount);
      setRespostasSemana(semanaCount);
      setRespostasMes(mesCount);
      setDadosGrafico7Dias(contagemSemanaFixa);

      // 4. Atividade Recente: mantendo o histórico ordenado
      const logsReais = listaSessoes
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.criada_em || b.created_at || 0).getTime() -
            new Date(a.criada_em || a.created_at || 0).getTime()
        )
        .map((r: any) => {
          const dataObj = new Date(r.criada_em || r.created_at || Date.now());
          const horaFormatada =
            dataObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            }) +
            ' às ' +
            dataObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

          const equipeNome = r.equipe_id
            ? equipesMap[r.equipe_id] || `Equipe #${r.equipe_id}`
            : 'Não vinculada';
          const usuarioNome = r.usuario_id
            ? usuariosMap[r.usuario_id] || `Usuário #${r.usuario_id}`
            : 'admin';

          return {
            id: r.id,
            pesquisaNome:
              pesquisaMap[r.pesquisa_id] || `Pesquisa #${r.pesquisa_id || 1}`,
            usuario: usuarioNome,
            equipe: equipeNome,
            horario: horaFormatada,
          };
        });

      setUltimosLogs(logsReais);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const diasSemanaLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Painel de Controle"
          setMobileMenuOpen={setMobileMenuOpen}
          notificationCount={3}
        />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          {/* BANNER DE BOAS VINDAS */}
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm ${
              theme === 'dark'
                ? 'bg-[#1a1a1e] border-[#29292e]'
                : 'bg-white border-zinc-200'
            }`}
          >
            <div>
              <h2 className="text-xl font-bold">Olá, Administrador</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Monitoramento de dados e fluxo de coletas em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {loading
                ? 'Carregando dados...'
                : 'Sistema Operacional e Sincronizado'}
            </div>
          </div>

          {/* 4 QUADRADOS INICIAIS (GRID 2x2 NO MOBILE, 4 COLUNAS NO DESKTOP) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div
              className={`p-4 md:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] md:text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Respostas Hoje
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black mt-2 text-emerald-500">
                    {loading ? '...' : respostasHoje}
                  </h3>
                </div>
                <div className="p-2.5 md:p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-3 text-[11px] md:text-xs font-medium text-zinc-400">
                Coletas registradas hoje
              </div>
            </div>

            <div
              className={`p-4 md:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] md:text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Respostas (Semana)
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black mt-2">
                    {loading ? '...' : respostasSemana}
                  </h3>
                </div>
                <div className="p-2.5 md:p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <BarChart3 size={18} />
                </div>
              </div>
              <div className="mt-3 text-[11px] md:text-xs font-medium text-zinc-400">
                Acumulado 7 dias
              </div>
            </div>

            <div
              className={`p-4 md:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] md:text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Respostas (Mês)
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black mt-2">
                    {loading ? '...' : respostasMes}
                  </h3>
                </div>
                <div className="p-2.5 md:p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <Calendar size={18} />
                </div>
              </div>
              <div className="mt-3 text-[11px] md:text-xs font-medium text-zinc-400">
                Total do mês atual
              </div>
            </div>

            <div
              className={`p-4 md:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] md:text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Pesquisas Ativas
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black mt-2">
                    {loading ? '...' : pesquisasAtivasCount}
                  </h3>
                </div>
                <div
                  className="p-2.5 md:p-3 rounded-xl"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--primary-color) 15%, transparent)',
                    color: 'var(--primary-color)',
                  }}
                >
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="mt-3 text-[11px] md:text-xs font-medium text-zinc-400">
                Questionários abertos
              </div>
            </div>
          </div>

          {/* SEÇÃO INFERIOR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GRÁFICO FIXO DE SEGUNDA A DOMINGO */}
            <div
              className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <h3 className="font-bold text-base mb-1">
                Respostas coletadas nos últimos 7 dias
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Acompanhamento estatístico diário (Segunda a Domingo)
              </p>

              <div className="flex-1 flex items-end justify-between gap-2 pt-6 px-2 border-b border-zinc-500/10 min-h-[200px]">
                {dadosGrafico7Dias.map((val, index) => {
                  const maxVal = Math.max(...dadosGrafico7Dias, 1);
                  const alturaPercentual = Math.max((val / maxVal) * 100, 8);

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                    >
                      <span className="text-xs font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}
                      </span>
                      <div
                        className="w-full max-w-[48px] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                        style={{
                          height: `${alturaPercentual}%`,
                          backgroundColor: 'var(--primary-color)',
                        }}
                      />
                      <span className="text-xs text-zinc-400 font-medium mt-1">
                        {diasSemanaLabels[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ATIVIDADE RECENTE (Limitada a 2 blocos visíveis com scroll) */}
            <div
              className={`p-6 rounded-2xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base">Atividade Recente</h3>
                    <p className="text-xs text-zinc-400">
                      Últimas coletas sincronizadas
                    </p>
                  </div>
                  <Clock size={16} className="text-zinc-400" />
                </div>

                {/* max-h limitado para exibir exatamente 2 blocos na visualização */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {ultimosLogs.length > 0 ? (
                    ultimosLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-100'}`}
                      >
                        {/* Linha 1: Data e Horário em cima */}
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 border-b border-zinc-500/10 pb-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {log.horario}
                          </span>
                          <span>Sessão #{log.id}</span>
                        </div>

                        {/* Linha 2: Nome da Pesquisa */}
                        <div className="font-bold flex items-center gap-1.5 truncate text-sm pt-0.5">
                          <FileText
                            size={14}
                            style={{ color: 'var(--primary-color)' }}
                            className="shrink-0"
                          />
                          <span className="truncate">{log.pesquisaNome}</span>
                        </div>

                        {/* Linha 3: Equipe e Usuário (Sem prefixos) */}
                        <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-500/10">
                          <span className="flex items-center gap-1 truncate pr-2">
                            <Users
                              size={12}
                              className="text-blue-500 shrink-0"
                            />{' '}
                            {log.equipe}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <User
                              size={12}
                              className="text-emerald-500 shrink-0"
                            />{' '}
                            {log.usuario}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-zinc-400 text-sm">
                      Nenhuma atividade recente registrada.
                    </div>
                  )}
                </div>
              </div>

              {/* <button
                onClick={carregarDadosReais}
                className={`mt-6 w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-zinc-300 hover:bg-[#29292e]' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                <RefreshCw
                  size={16}
                  className={loading ? 'animate-spin' : ''}
                />{' '}
                Atualizar Dados
              </button> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
