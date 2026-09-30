import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../components/Header/Header';
import { pesquisaService } from '../../../services/pesquisaService';
import { equipeService } from '../../../services/equipeService';
import { pesquisaEquipeService } from '../../../services/pesquisaEquipeService';
import { api } from '../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Settings,
  Users,
  Play,
  X,
  Calendar,
  UserCheck,
  Layers,
  UserMinus,
} from 'lucide-react';

interface Equipe {
  id: number;
  nome: string;
  descricao?: string;
  equipe_id?: number;
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

interface Template {
  id: number;
  titulo?: string;
  nome?: string;
  descricao?: string;
}

export function Pesquisas() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pesquisas' | 'templates'>(
    'pesquisas'
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipesDaPesquisa, setEquipesDaPesquisa] = useState<Equipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    | 'nova_pesquisa'
    | 'editar_pesquisa'
    | 'novo_template'
    | 'editar_template'
    | 'equipes_pesquisa'
    | 'adicionar_equipe'
    | null
  >(null);

  const [selectedPesquisa, setSelectedPesquisa] = useState<Pesquisa | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  // Formulários
  const [pesquisaForm, setPesquisaForm] = useState({
    titulo: '',
    empresa: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    status: 'ativa',
  });

  const [templateForm, setTemplateForm] = useState({
    nome: '',
    descricao: '',
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'pesquisa' | 'template' | null;
    id: number | null;
    titulo: string;
  }>({ isOpen: false, type: null, id: null, titulo: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const pesquisasRes = await pesquisaService.getAll();
      setPesquisas(pesquisasRes.pesquisas || pesquisasRes);

      const templatesRes = await api.get('/api/templates-perguntas');
      setTemplates(templatesRes.data.templates || templatesRes.data || []);

      const equipesRes = await equipeService.getAll();
      setEquipes(equipesRes.equipes || equipesRes || []);
    } catch {
      toast.error('Erro ao carregar dados do servidor.');
    }
  }

  const carregarEquipesDaPesquisa = async (pesquisaId: number) => {
    try {
      const res = await pesquisaEquipeService.getByPesquisa(pesquisaId);
      const lista = res.equipes || res.data || res || [];
      setEquipesDaPesquisa(lista);
    } catch {
      setEquipesDaPesquisa([]);
    }
  };

  const handleOpenModal = (type: any, item: any = null) => {
    setModalType(type);
    setTeamSearchTerm('');
    if (type === 'editar_pesquisa' && item) {
      setSelectedPesquisa(item);
      setPesquisaForm({
        titulo: item.titulo || '',
        empresa: item.empresa || '',
        descricao: item.descricao || '',
        data_inicio: item.data_inicio ? item.data_inicio.split('T')[0] : '',
        data_fim: item.data_fim ? item.data_fim.split('T')[0] : '',
        status: item.status || 'ativa',
      });
    } else if (type === 'nova_pesquisa') {
      setPesquisaForm({
        titulo: '',
        empresa: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        status: 'ativa',
      });
    } else if (type === 'editar_template' && item) {
      setSelectedTemplate(item);
      setTemplateForm({
        nome: item.nome || item.titulo || '',
        descricao: item.descricao || '',
      });
    } else if (type === 'novo_template') {
      setTemplateForm({ nome: '', descricao: '' });
    } else if (type === 'equipes_pesquisa' && item) {
      setSelectedPesquisa(item);
      carregarEquipesDaPesquisa(item.id);
    } else if (type === 'adicionar_equipe' && item) {
      setSelectedPesquisa(item);
      carregarEquipesDaPesquisa(item.id);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'nova_pesquisa') {
        await pesquisaService.create({ ...pesquisaForm, criado_por: 1 });
        toast.success('Pesquisa criada com sucesso!');
      } else if (modalType === 'editar_pesquisa' && selectedPesquisa) {
        await pesquisaService.update(selectedPesquisa.id, pesquisaForm);
        toast.success('Pesquisa atualizada com sucesso!');
      } else if (modalType === 'novo_template') {
        await api.post('/api/templates-perguntas', {
          nome: templateForm.nome,
          descricao: templateForm.descricao,
        });
        toast.success('Template criado com sucesso!');
      } else if (modalType === 'editar_template' && selectedTemplate) {
        await api.put(`/api/templates-perguntas/${selectedTemplate.id}`, {
          nome: templateForm.nome,
          descricao: templateForm.descricao,
        });
        toast.success('Template atualizado com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Erro ao realizar operação.');
    }
  };

  const handleToggleStatus = async (pesquisa: Pesquisa) => {
    const statusAtual = pesquisa.status || 'ativa';
    const novoStatus = statusAtual === 'ativa' ? 'pausada' : 'ativa';
    try {
      await pesquisaService.update(pesquisa.id, { status: novoStatus });
      toast.success(`Status alterado para: ${novoStatus.toUpperCase()}`);
      loadData();
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  const handleDuplicate = async (pesquisa: Pesquisa) => {
    try {
      await pesquisaService.create({
        titulo: `${pesquisa.titulo} (Cópia)`,
        empresa: pesquisa.empresa,
        descricao: pesquisa.descricao,
        status: pesquisa.status || 'pausada',
        data_inicio: pesquisa.data_inicio,
        data_fim: pesquisa.data_fim,
        criado_por: 1,
      });
      toast.success('Pesquisa duplicada com sucesso!');
      loadData();
    } catch {
      toast.error('Erro ao duplicar pesquisa.');
    }
  };

  const handleVincularEquipe = async (equipeId: number) => {
    if (!selectedPesquisa) return;
    try {
      await pesquisaEquipeService.vincular(selectedPesquisa.id, equipeId);
      toast.success('Equipe vinculada com sucesso!');
      carregarEquipesDaPesquisa(selectedPesquisa.id);
    } catch {
      toast.error('Erro ao vincular equipe.');
    }
  };

  const handleDesvincularEquipe = async (equipeId: number) => {
    if (!selectedPesquisa) return;
    try {
      await pesquisaEquipeService.desvincular(selectedPesquisa.id, equipeId);
      toast.success('Equipe desvinculada!');
      carregarEquipesDaPesquisa(selectedPesquisa.id);
    } catch {
      toast.error('Erro ao desvincular equipe.');
    }
  };

  const confirmDelete = (
    type: 'pesquisa' | 'template',
    id: number,
    titulo: string
  ) => {
    setDeleteModal({ isOpen: true, type, id, titulo });
  };

  const executeDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    try {
      if (deleteModal.type === 'pesquisa') {
        await pesquisaService.delete(deleteModal.id);
        toast.success('Pesquisa excluída!');
      } else {
        await api.delete(`/api/templates-perguntas/${deleteModal.id}`);
        toast.success('Template excluído!');
      }
      setDeleteModal({ isOpen: false, type: null, id: null, titulo: '' });
      loadData();
    } catch {
      toast.error('Erro ao excluir registo.');
    }
  };

  const filteredPesquisas = pesquisas.filter((p) =>
    p.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTemplates = templates.filter((t) =>
    (t.titulo || t.nome || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          title="Gerenciamento de Pesquisas"
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <div
            className={`p-6 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3.5 rounded-xl text-white shadow-md flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <FileText size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Pesquisas e Templates
                </h1>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  Selecione uma pesquisa para iniciar ou gerencie os modelos
                  reutilizáveis.
                </p>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div
            className="flex p-1.5 rounded-lg gap-2 w-full sm:max-w-md border shadow-sm"
            style={{
              backgroundColor: theme === 'dark' ? '#1a1a1e' : '#ffffff',
              borderColor: theme === 'dark' ? '#29292e' : '#e4e4e7',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('pesquisas');
                setSearchTerm('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition-all cursor-pointer ${activeTab === 'pesquisas' ? 'text-white shadow-md' : 'text-zinc-400'}`}
              style={{
                backgroundColor:
                  activeTab === 'pesquisas'
                    ? 'var(--primary-color)'
                    : 'transparent',
              }}
            >
              <FileText size={16} />
              <span>Pesquisas</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('templates');
                setSearchTerm('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition-all cursor-pointer ${activeTab === 'templates' ? 'text-white shadow-md' : 'text-zinc-400'}`}
              style={{
                backgroundColor:
                  activeTab === 'templates'
                    ? 'var(--primary-color)'
                    : 'transparent',
              }}
            >
              <FileText size={16} />
              <span>Templates</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search
                className={`absolute left-3 top-3.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activeTab === 'pesquisas'
                    ? 'Buscar pesquisa...'
                    : 'Buscar template...'
                }
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e] text-white' : 'bg-white border-zinc-300'}`}
              />
            </div>
            <button
              onClick={() =>
                handleOpenModal(
                  activeTab === 'pesquisas' ? 'nova_pesquisa' : 'novo_template'
                )
              }
              className="w-full sm:w-auto py-3 px-6 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Plus size={18} />
              <span>
                {activeTab === 'pesquisas' ? 'Nova Pesquisa' : 'Novo Template'}
              </span>
            </button>
          </div>

          {/* Listagem Pesquisas */}
          {activeTab === 'pesquisas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPesquisas.map((pesquisa) => (
                <div
                  key={pesquisa.id}
                  className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold">{pesquisa.titulo}</h3>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${pesquisa.status === 'ativa' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                      >
                        {pesquisa.status || 'ativa'}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5 font-semibold"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      {pesquisa.empresa || 'Empresa não informada'}
                    </p>
                    <p
                      className={`text-sm mt-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                    >
                      {pesquisa.descricao || 'Sem descrição'}
                    </p>
                    {pesquisa.data_inicio && (
                      <div className="flex items-center gap-3 text-xs mt-3 pt-3 border-t border-zinc-500/10">
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
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-8 pt-4 border-t border-zinc-500/10">
                    <button
                      onClick={() => handleToggleStatus(pesquisa)}
                      className="py-2 px-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Play size={14} />
                      <span>Status</span>
                    </button>
                    <button
                      onClick={() =>
                        handleOpenModal('equipes_pesquisa', pesquisa)
                      }
                      className="py-2 px-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Users size={14} />
                      <span>Equipes</span>
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/pesquisas/${pesquisa.id}`)
                      }
                      className="py-2 px-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Settings size={14} />
                      <span>Gerir</span>
                    </button>
                    <button
                      onClick={() =>
                        handleOpenModal('editar_pesquisa', pesquisa)
                      }
                      className="py-2 px-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Edit2 size={14} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDuplicate(pesquisa)}
                      className="py-2 px-2 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Copy size={14} />
                      <span>Duplicar</span>
                    </button>
                    <button
                      onClick={() =>
                        confirmDelete('pesquisa', pesquisa.id, pesquisa.titulo)
                      }
                      className="py-2 px-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Listagem Templates */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const nomeTemplate =
                  template.titulo || template.nome || 'Template sem nome';
                return (
                  <div
                    key={template.id}
                    className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                  >
                    <div>
                      <h3 className="text-lg font-bold">{nomeTemplate}</h3>
                      <p
                        className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                      >
                        {template.descricao ||
                          'Template base para perguntas pré-prontas'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-8 pt-4 border-t border-zinc-500/15">
                      <button
                        onClick={() =>
                          navigate(`/admin/templates/${template.id}`)
                        }
                        className="flex-1 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer"
                      >
                        <Layers size={14} />
                        <span>Gerir</span>
                      </button>
                      <button
                        onClick={() =>
                          handleOpenModal('editar_template', template)
                        }
                        className="flex-1 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() =>
                          confirmDelete('template', template.id, nomeTemplate)
                        }
                        className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal Equipes e Formulários */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {modalType === 'equipes_pesquisa' ? (
                  <Users size={22} style={{ color: 'var(--primary-color)' }} />
                ) : (
                  <FileText
                    size={22}
                    style={{ color: 'var(--primary-color)' }}
                  />
                )}
                {modalType === 'nova_pesquisa' && 'Nova Pesquisa'}
                {modalType === 'editar_pesquisa' && 'Editar Pesquisa'}
                {modalType === 'novo_template' && 'Novo Template'}
                {modalType === 'editar_template' && 'Editar Template'}
                {modalType === 'equipes_pesquisa' &&
                  `Equipes da ${selectedPesquisa?.titulo}`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {modalType === 'equipes_pesquisa' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold opacity-80">
                    Equipes Vinculadas
                  </span>
                  <button
                    onClick={() =>
                      handleOpenModal('adicionar_equipe', selectedPesquisa)
                    }
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white shadow-md flex items-center gap-1 cursor-pointer"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  >
                    <Plus size={14} />
                    <span>Adicionar Equipe</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {equipesDaPesquisa.length === 0 ? (
                    <p className="text-sm opacity-60 text-center py-4">
                      Nenhuma equipe vinculada.
                    </p>
                  ) : (
                    equipesDaPesquisa.map((vinc: any) => {
                      const equipeIdReal = vinc.equipe_id || vinc.id;
                      const equipeDetalhe = equipes.find(
                        (e) => e.id === equipeIdReal
                      );

                      const nomeEquipe =
                        vinc.nome || equipeDetalhe?.nome || 'Equipe sem nome';
                      const descEquipe =
                        vinc.descricao ||
                        equipeDetalhe?.descricao ||
                        'Sem descrição';

                      return (
                        <div
                          key={equipeIdReal || Math.random()}
                          className={`p-3 rounded-xl border flex justify-between items-center gap-3 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate">
                              {nomeEquipe}
                            </p>
                            <p className="text-xs opacity-60 truncate">
                              {descEquipe}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDesvincularEquipe(equipeIdReal)
                            }
                            className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2.5 text-xs font-semibold"
                          >
                            <UserMinus size={14} />
                            <span>Remover</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-4 py-3 rounded-xl text-white font-medium shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Fechar
                </button>
              </div>
            ) : modalType === 'adicionar_equipe' ? (
              <div className="space-y-4">
                <div className="relative w-full">
                  <Search
                    className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                    size={16}
                  />
                  <input
                    type="text"
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                    placeholder="Pesquisar equipe..."
                    className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none border ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  />
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {equipes
                    .filter(
                      (eq) =>
                        !equipesDaPesquisa.some(
                          (v) =>
                            v.id === eq.id ||
                            v.equipe_id === eq.id ||
                            v.id === eq.equipe_id
                        )
                    )
                    .filter((eq) =>
                      eq.nome
                        ?.toLowerCase()
                        .includes(teamSearchTerm.toLowerCase())
                    )
                    .map((eq) => (
                      <div
                        key={eq.id}
                        className={`p-3 rounded-xl border flex justify-between items-center gap-3 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate">
                            {eq.nome}
                          </p>
                          <p className="text-xs opacity-60 truncate">
                            {eq.descricao || 'Sem descrição'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleVincularEquipe(eq.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 px-3 text-xs font-semibold"
                        >
                          <UserCheck size={16} />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() =>
                    handleOpenModal('equipes_pesquisa', selectedPesquisa)
                  }
                  className={`w-full mt-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] text-white' : 'bg-zinc-200 text-zinc-800'}`}
                >
                  Voltar
                </button>
              </div>
            ) : modalType?.includes('template') ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold opacity-80">
                    Nome do Template
                  </label>
                  <input
                    type="text"
                    required
                    value={templateForm.nome}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, nome: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold opacity-80">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={templateForm.descricao}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        descricao: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] text-white' : 'bg-zinc-50 border-zinc-300'}`}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold opacity-80">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={pesquisaForm.titulo}
                    onChange={(e) =>
                      setPesquisaForm({
                        ...pesquisaForm,
                        titulo: e.target.value,
                      })
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
                      setPesquisaForm({
                        ...pesquisaForm,
                        status: e.target.value,
                      })
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
                    onClick={() => setIsModalOpen(false)}
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
            )}
          </div>
        </div>
      )}

      {/* Modal Exclusão */}
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
              Tem certeza de que pretende excluir{' '}
              <span className="font-semibold text-white">
                "{deleteModal.titulo}"
              </span>
              ?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    type: null,
                    id: null,
                    titulo: '',
                  })
                }
                className={`flex-1 py-2.5 rounded-xl font-medium cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] text-white' : 'bg-zinc-200 text-zinc-800'}`}
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
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

export default Pesquisas;
