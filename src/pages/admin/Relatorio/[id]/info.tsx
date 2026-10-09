import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../../components/Header/Header';
import { relatorioService } from '../../../../services/relatorioService';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export function RelatorioInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados dos campos de configuração
  const [form, setForm] = useState({
    titulo_relatorio: '',
    diretor_responsavel: '',
    periodo_campo: '',
    contratante: '',
    porcentagem_pesquisada: '',
    tamanho_amostra: '',
    sobre_empresa: '',
    objetivo: '',
    metodologia: '',
    publico_investigado: '',
    analise_resultado: '',
    formula_aplicada: '',
    setores_pesquisa: '',
    coletores_dados: '',
    margem_erro: '',
    coordenacao_estatistica: '',
    analista_tecnico: '',
  });

  useEffect(() => {
    document.title = 'Configurar Relatório e PDF - Vibe Opinião';
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setLoading(true);
      const res = await relatorioService.getByPesquisaId(id!);
      const lista = res.relatorios || res.data || res;
      const rel = Array.isArray(lista)
        ? lista.find((r: any) => Number(r.pesquisa_id) === Number(id))
        : lista;

      if (rel) {
        setForm({
          titulo_relatorio: rel.titulo_relatorio || '',
          diretor_responsavel: rel.diretor_responsavel || '',
          periodo_campo: rel.periodo_campo || '',
          contratante: rel.contratante || '',
          porcentagem_pesquisada: rel.porcentagem_pesquisada || '',
          tamanho_amostra: rel.tamanho_amostra || '',
          sobre_empresa: rel.sobre_empresa || '',
          objetivo: rel.objetivo || '',
          metodologia: rel.metodologia || '',
          publico_investigado: rel.publico_investigado || '',
          analise_resultado: rel.analise_resultado || '',
          formula_aplicada: rel.formula_aplicada || '',
          setores_pesquisa: rel.setores_pesquisa || '',
          coletores_dados: rel.coletores_dados || '',
          margem_erro: rel.margem_erro || '',
          coordenacao_estatistica: rel.coordenacao_estatistica || '',
          analista_tecnico: rel.analista_tecnico || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório', error);
      toast.error('Erro ao carregar informações.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const toastId = toast.loading('Salvando informações...');
    try {
      await relatorioService.update(Number(id), form);
      toast.success('Informações salvas com sucesso no banco!', {
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar as informações.', { id: toastId });
    }
  }

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
          title="Configurar Capa e Ficha Técnica"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <button
            onClick={() => navigate(`/admin/relatorios/${id}`)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer w-fit ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Relatório</span>
          </button>

          <div
            className={`p-6 md:p-8 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <FileText size={20} style={{ color: 'var(--primary-color)' }} />
              Gerenciar Informações e Textos Oficiais do PDF
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: 'var(--primary-color)' }}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Título do Relatório
                    </label>
                    <input
                      type="text"
                      name="titulo_relatorio"
                      value={form.titulo_relatorio}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Diretor Responsável
                    </label>
                    <input
                      type="text"
                      name="diretor_responsavel"
                      value={form.diretor_responsavel}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Período de Campo
                    </label>
                    <input
                      type="text"
                      name="periodo_campo"
                      value={form.periodo_campo}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Contratante
                    </label>
                    <input
                      type="text"
                      name="contratante"
                      value={form.contratante}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Porcentagem Pesquisada
                    </label>
                    <input
                      type="text"
                      name="porcentagem_pesquisada"
                      value={form.porcentagem_pesquisada}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                    Tamanho da Amostra
                  </label>
                  <input
                    type="text"
                    name="tamanho_amostra"
                    value={form.tamanho_amostra}
                    onChange={handleChange}
                    placeholder="Ex: Foram entrevistados 341 eleitores..."
                    className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                    Sobre a Empresa
                  </label>
                  <textarea
                    name="sobre_empresa"
                    rows={3}
                    value={form.sobre_empresa}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border text-sm outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                    Objetivo da Pesquisa
                  </label>
                  <textarea
                    name="objetivo"
                    rows={3}
                    value={form.objetivo}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border text-sm outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Metodologia Utilizada
                    </label>
                    <textarea
                      name="metodologia"
                      rows={3}
                      value={form.metodologia}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Público Investigado
                    </label>
                    <textarea
                      name="publico_investigado"
                      rows={3}
                      value={form.publico_investigado}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                </div>

                <hr className="my-6 border-zinc-700/30" />
                <h3 className="text-md font-bold uppercase tracking-wide">
                  Campos da Página de Análise e Interpretação (Nova Página)
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                    Texto de Análise e Interpretação de Resultado
                  </label>
                  <textarea
                    name="analise_resultado"
                    rows={4}
                    value={form.analise_resultado}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border text-sm outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                    Fórmula Aplicada / Metodologia de Distribuição
                  </label>
                  <textarea
                    name="formula_aplicada"
                    rows={3}
                    value={form.formula_aplicada}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border text-sm outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Setores da Pesquisa
                    </label>
                    <input
                      type="text"
                      name="setores_pesquisa"
                      value={form.setores_pesquisa}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Coletores de Dados
                    </label>
                    <input
                      type="text"
                      name="coletores_dados"
                      value={form.coletores_dados}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Margem de Erro
                    </label>
                    <input
                      type="text"
                      name="margem_erro"
                      value={form.margem_erro}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Coordenação Estatística
                    </label>
                    <input
                      type="text"
                      name="coordenacao_estatistica"
                      value={form.coordenacao_estatistica}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                      Analista Técnico
                    </label>
                    <input
                      type="text"
                      name="analista_tecnico"
                      value={form.analista_tecnico}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  >
                    <Save size={18} />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
