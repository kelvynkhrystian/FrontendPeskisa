import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../components/Header/Header';
import { equipeService } from '../../../services/equipeService';
import { userService } from '../../../services/userService';
import toast, { Toaster } from 'react-hot-toast';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Plus,
  List as ListIcon,
  User as UserIcon,
  X,
  UserCheck,
  UserMinus,
} from 'lucide-react';

interface Equipe {
  id: number;
  nome: string;
  descricao?: string;
}

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  role?: string;
  equipe_id?: number | null;
}

export function Equipes() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'equipes' | 'funcionarios'>(
    'equipes'
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'equipe' | 'funcionario' | 'membros' | 'adicionar_membro' | null
  >(null);

  const [selectedItem, setSelectedItem] = useState<{
    id?: number;
    nome?: string;
    descricao?: string;
    email?: string;
    equipe_id?: number | null;
    equipe?: Equipe;
    membros?: Funcionario[];
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'equipe' | 'funcionario' | null;
    id: number | null;
    nome: string;
  }>({ isOpen: false, type: null, id: null, nome: '' });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    email: '',
    senha: '',
    equipe_id: '',
  });

  const { nomeApp } = useTheme();

  useEffect(() => {
    document.title = `Equipes - ${nomeApp || 'Peskisa'}`;
  }, [nomeApp]);

  useEffect(() => {
    async function loadData() {
      try {
        const equipesRes = await equipeService.getAll();
        setEquipes(equipesRes.equipes || equipesRes);

        const usersRes = await userService.getAll();
        setFuncionarios(usersRes.users || usersRes);
      } catch {
        toast.error('Erro ao carregar informações do servidor.');
      }
    }

    loadData();
  }, []);

  const fetchData = async () => {
    try {
      const equipesRes = await equipeService.getAll();
      setEquipes(equipesRes.equipes || equipesRes);

      const usersRes = await userService.getAll();
      setFuncionarios(usersRes.users || usersRes);
    } catch {
      toast.error('Erro ao carregar informações do servidor.');
    }
  };

  const handleOpenModal = (
    type: 'equipe' | 'funcionario' | 'membros' | 'adicionar_membro',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any = null
  ) => {
    setModalType(type);
    setSelectedItem(item);
    setMemberSearchTerm('');
    if (item && type === 'equipe') {
      setFormData({
        nome: item.nome || '',
        descricao: item.descricao || '',
        email: '',
        senha: '',
        equipe_id: '',
      });
    } else if (item && type === 'funcionario') {
      setFormData({
        nome: item.nome || '',
        descricao: '',
        email: item.email || '',
        senha: '',
        equipe_id: item.equipe_id ? String(item.equipe_id) : '',
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        email: '',
        senha: '',
        equipe_id: '',
      });
    }
    setIsModalOpen(true);
  };

  // Remover funcionário da equipe (define equipe_id como null)
  const handleRemoveMemberFromTeam = async (funcionarioId: number) => {
    try {
      await userService.update(funcionarioId, { equipe_id: null });
      toast.success('Funcionário removido da equipe!');
      await fetchData();

      if (selectedItem?.equipe) {
        const updatedUsers = await userService.getAll();
        const allUsers = updatedUsers.users || updatedUsers;
        const membrosAtualizados = allUsers.filter(
          (f: Funcionario) => f.equipe_id === selectedItem.equipe?.id
        );
        setSelectedItem({
          ...selectedItem,
          membros: membrosAtualizados,
        });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao remover membro.');
    }
  };

  // Adicionar funcionário a uma equipe
  const handleAddMemberToTeam = async (
    funcionarioId: number,
    equipeId: number
  ) => {
    try {
      await userService.update(funcionarioId, { equipe_id: equipeId });
      toast.success('Funcionário adicionado à equipe com sucesso!');
      await fetchData();
      const updatedUsers = await userService.getAll();
      const allUsers = updatedUsers.users || updatedUsers;
      const equipeAtual = equipes.find((eq) => eq.id === equipeId);
      const membrosAtualizados = allUsers.filter(
        (f: Funcionario) => f.equipe_id === equipeId
      );
      setSelectedItem({
        equipe: equipeAtual,
        membros: membrosAtualizados,
        id: equipeAtual?.id,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao adicionar membro.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Converte corretamente equipe_id para number ou null para passar pelo Joi do backend
      const formattedEquipeId =
        formData.equipe_id === '' ? null : Number(formData.equipe_id);

      if (modalType === 'equipe') {
        if (selectedItem?.id) {
          await equipeService.update(Number(selectedItem.id), {
            nome: formData.nome,
            descricao: formData.descricao,
          });
          toast.success('Equipe atualizada com sucesso!');
        } else {
          await equipeService.create({
            nome: formData.nome,
            descricao: formData.descricao,
          });
          toast.success('Equipe criada com sucesso!');
        }
      } else if (modalType === 'funcionario') {
        if (selectedItem?.id) {
          await userService.update(Number(selectedItem.id), {
            nome: formData.nome,
            email: formData.email,
            equipe_id: formattedEquipeId, // <--- Aqui
            ...(formData.senha ? { senha: formData.senha } : {}),
          });
          toast.success('Funcionário atualizado com sucesso!');
        } else {
          await userService.create({
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha || '123456',
            role: 'user',
            equipe_id: formattedEquipeId, // <--- E aqui
          });
          toast.success('Funcionário cadastrado com sucesso!');
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao realizar operação.');
    }
  };

  const confirmDelete = (
    type: 'equipe' | 'funcionario',
    id: number,
    nome: string
  ) => {
    setDeleteModal({ isOpen: true, type, id, nome });
  };

  const executeDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    try {
      if (deleteModal.type === 'equipe') {
        await equipeService.delete(deleteModal.id);
        toast.success('Equipe excluída com sucesso!');
      } else {
        await userService.delete(deleteModal.id);
        toast.success('Funcionário excluído com sucesso!');
      }
      setDeleteModal({ isOpen: false, type: null, id: null, nome: '' });
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao excluir.');
    }
  };

  const filteredEquipes = equipes.filter((eq) =>
    eq.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFuncionarios = funcionarios
    .filter((fn) => fn.role !== 'admin')
    .filter(
      (fn) =>
        fn.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fn.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Header title="Equipes" setMobileMenuOpen={setMobileMenuOpen} />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          <div
            className={`p-6 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3.5 rounded-xl text-white shadow-md flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Users size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Equipes e Funcionários
                </h1>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  Gerencie grupos de recolha, cadastre funcionários e atribua
                  permissões.
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex p-1.5 rounded-lg gap-2 w-full sm:max-w-sm border shadow-sm transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1a1a1e' : '#ffffff',
              borderColor: theme === 'dark' ? '#29292e' : '#e4e4e7',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('equipes');
                setSearchTerm('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'equipes'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'equipes'
                    ? 'var(--primary-color)'
                    : 'transparent',
              }}
            >
              <Users size={16} />
              <span>Equipes</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('funcionarios');
                setSearchTerm('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'funcionarios'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'funcionarios'
                    ? 'var(--primary-color)'
                    : 'transparent',
              }}
            >
              <UserPlus size={16} />
              <span>Funcionários</span>
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
                  activeTab === 'equipes'
                    ? 'Pesquisar equipe...'
                    : 'Pesquisar funcionário...'
                }
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                  theme === 'dark'
                    ? 'bg-[#1a1a1e] border-[#29292e] text-white focus:border-zinc-500'
                    : 'bg-white border-zinc-300 focus:border-zinc-400'
                }`}
              />
            </div>

            <button
              onClick={() =>
                handleOpenModal(
                  activeTab === 'equipes' ? 'equipe' : 'funcionario'
                )
              }
              className="w-full sm:w-auto py-3 px-6 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Plus size={18} />
              <span>
                Adicionar {activeTab === 'equipes' ? 'Equipe' : 'Funcionário'}
              </span>
            </button>
          </div>

          {activeTab === 'equipes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipes.map((equipe) => {
                const membrosDaEquipe = funcionarios.filter(
                  (f) => f.equipe_id === equipe.id
                );
                return (
                  <div
                    key={equipe.id}
                    className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
                  >
                    <div>
                      <h3 className="text-lg font-bold">{equipe.nome}</h3>
                      <p
                        className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                      >
                        {equipe.descricao || 'Sem descrição'}
                      </p>
                      <div
                        className="mt-4 inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid #29292e',
                        }}
                      >
                        {membrosDaEquipe.length} membros
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-8 pt-4 border-t border-zinc-500/10">
                      <button
                        onClick={() =>
                          handleOpenModal('adicionar_membro', equipe)
                        }
                        className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors flex justify-center cursor-pointer"
                        title="Adicionar Membro"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenModal('membros', {
                            id: equipe.id,
                            equipe,
                            membros: membrosDaEquipe,
                          })
                        }
                        className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors flex justify-center cursor-pointer"
                        title="Ver Membros"
                      >
                        <ListIcon size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal('equipe', equipe)}
                        className="flex-1 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex justify-center cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          confirmDelete('equipe', equipe.id, equipe.nome)
                        }
                        className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex justify-center cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'funcionarios' && (
            <div
              className={`rounded-2xl border shadow-lg overflow-hidden transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
            >
              <div className="flex flex-col divide-y divide-zinc-500/10">
                {filteredFuncionarios.map((func) => {
                  const eq = equipes.find((e) => e.id === func.equipe_id);
                  return (
                    <div
                      key={func.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-500/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full ${theme === 'dark' ? 'bg-[#121214]' : 'bg-zinc-100'}`}
                        >
                          <UserIcon
                            size={24}
                            style={{ color: 'var(--primary-color)' }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-base">{func.nome}</h4>
                          <p
                            className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                          >
                            {func.email}
                          </p>
                          <span className="text-xs font-medium mt-1 inline-block opacity-70">
                            Equipe: {eq ? eq.nome : 'Sem equipe'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                          onClick={() => handleOpenModal('funcionario', func)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                        >
                          <Edit2 size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() =>
                            confirmDelete('funcionario', func.id, func.nome)
                          }
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                        >
                          <Trash2 size={16} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${theme === 'dark' ? 'bg-[#1a1a1e] border-[#29292e]' : 'bg-white border-zinc-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {modalType === 'membros' ? (
                  <Users size={22} style={{ color: 'var(--primary-color)' }} />
                ) : modalType === 'adicionar_membro' ? (
                  <UserPlus
                    size={22}
                    style={{ color: 'var(--primary-color)' }}
                  />
                ) : modalType === 'funcionario' ? (
                  <UserPlus
                    size={22}
                    style={{ color: 'var(--primary-color)' }}
                  />
                ) : (
                  <Users size={22} style={{ color: 'var(--primary-color)' }} />
                )}
                {modalType === 'membros'
                  ? `Membros da ${selectedItem?.equipe?.nome}`
                  : modalType === 'adicionar_membro'
                    ? `Adicionar à ${selectedItem?.nome}`
                    : selectedItem?.id
                      ? `Editar ${modalType}`
                      : `Adicionar ${modalType}`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {modalType === 'membros' ? (
              <div className="space-y-4">
                <div className="relative w-full">
                  <Search
                    className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                    size={16}
                  />
                  <input
                    type="text"
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    placeholder="Pesquisar membro..."
                    className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all border ${
                      theme === 'dark'
                        ? 'bg-[#121214] border-[#29292e] text-white focus:border-zinc-500'
                        : 'bg-zinc-50 border-zinc-300'
                    }`}
                  />
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedItem?.membros?.filter(
                    (m) =>
                      m.nome
                        ?.toLowerCase()
                        .includes(memberSearchTerm.toLowerCase()) ||
                      m.email
                        ?.toLowerCase()
                        .includes(memberSearchTerm.toLowerCase())
                  ).length === 0 ? (
                    <p className="text-sm opacity-60 text-center py-4">
                      Nenhum funcionário encontrado.
                    </p>
                  ) : (
                    selectedItem?.membros
                      ?.filter(
                        (m) =>
                          m.nome
                            ?.toLowerCase()
                            .includes(memberSearchTerm.toLowerCase()) ||
                          m.email
                            ?.toLowerCase()
                            .includes(memberSearchTerm.toLowerCase())
                      )
                      .map((m: Funcionario) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border flex justify-between items-center gap-3 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate">
                              {m.nome}
                            </p>
                            <p className="text-xs opacity-60 truncate">
                              {m.email}
                            </p>
                          </div>
                          {/* Botão de Remover da Equipe (coloca equipe_id como null) */}
                          <button
                            onClick={() => handleRemoveMemberFromTeam(m.id)}
                            className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1 px-2.5 text-xs font-semibold"
                            title="Remover da equipe"
                          >
                            <UserMinus size={14} />
                            <span>Remover</span>
                          </button>
                        </div>
                      ))
                  )}
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-4 py-3 rounded-xl text-white font-medium shadow-lg transition-opacity cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Fechar
                </button>
              </div>
            ) : modalType === 'adicionar_membro' ? (
              <div className="space-y-4">
                <div className="relative w-full">
                  <Search
                    className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                    size={16}
                  />
                  <input
                    type="text"
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    placeholder="Pesquisar funcionário sem equipe..."
                    className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all border ${
                      theme === 'dark'
                        ? 'bg-[#121214] border-[#29292e] text-white focus:border-zinc-500'
                        : 'bg-zinc-50 border-zinc-300'
                    }`}
                  />
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {funcionarios
                    .filter((f) => !f.equipe_id && f.role !== 'admin')
                    .filter(
                      (f) =>
                        f.nome
                          ?.toLowerCase()
                          .includes(memberSearchTerm.toLowerCase()) ||
                        f.email
                          ?.toLowerCase()
                          .includes(memberSearchTerm.toLowerCase())
                    ).length === 0 ? (
                    <p className="text-sm opacity-60 text-center py-4">
                      Nenhum funcionário sem equipe disponível.
                    </p>
                  ) : (
                    funcionarios
                      .filter((f) => !f.equipe_id && f.role !== 'admin')
                      .filter(
                        (f) =>
                          f.nome
                            ?.toLowerCase()
                            .includes(memberSearchTerm.toLowerCase()) ||
                          f.email
                            ?.toLowerCase()
                            .includes(memberSearchTerm.toLowerCase())
                      )
                      .map((m: Funcionario) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border flex justify-between items-center gap-3 ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate">
                              {m.nome}
                            </p>
                            <p className="text-xs opacity-60 truncate">
                              {m.email}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedItem?.id) {
                                handleAddMemberToTeam(m.id, selectedItem.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 px-3 text-xs font-semibold"
                            title="Adicionar à equipe"
                          >
                            <UserCheck size={16} />
                            <span>Adicionar</span>
                          </button>
                        </div>
                      ))
                  )}
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-4 py-3 rounded-xl text-white font-medium shadow-lg transition-opacity cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold opacity-80">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] focus:border-zinc-500' : 'bg-zinc-50 border-zinc-300'}`}
                    placeholder="Nome"
                  />
                </div>

                {modalType === 'funcionario' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold opacity-80">
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] focus:border-zinc-500' : 'bg-zinc-50 border-zinc-300'}`}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold opacity-80">
                        Equipe
                      </label>
                      <select
                        value={formData.equipe_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            equipe_id: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all appearance-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] focus:border-zinc-500' : 'bg-zinc-50 border-zinc-300'}`}
                      >
                        <option value="">Sem equipe</option>
                        {equipes.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold opacity-80">
                        Palavra-passe {selectedItem?.id && '(Opcional)'}
                      </label>
                      <input
                        type="password"
                        value={formData.senha}
                        onChange={(e) =>
                          setFormData({ ...formData, senha: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] focus:border-zinc-500' : 'bg-zinc-50 border-zinc-300'}`}
                        placeholder="******"
                      />
                    </div>
                  </>
                )}

                {modalType === 'equipe' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold opacity-80">
                      Descrição (Subtítulo)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all resize-none ${theme === 'dark' ? 'bg-[#121214] border-[#29292e] focus:border-zinc-500' : 'bg-zinc-50 border-zinc-300'}`}
                      placeholder="Descrição da equipe..."
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl text-white font-medium shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
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
              Tem a certeza de que pretende excluir{' '}
              <span className="font-semibold text-white">
                "{deleteModal.nome}"
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    type: null,
                    id: null,
                    nome: '',
                  })
                }
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#29292e] hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
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
