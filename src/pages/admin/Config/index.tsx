import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AdminSidebar } from '../../../components/Sidebar/AdminSidebar';
import { Header } from '../../../components/Header/Header';
import { userService } from '../../../services/userService';
import { configService } from '../../../services/configService';
import toast, { Toaster } from 'react-hot-toast';
import {
  Settings,
  KeyRound,
  Info as InfoIcon,
  Save,
  Upload,
  Smartphone,
  Type,
  FileText,
  ShieldCheck,
  Mail,
  Lock,
} from 'lucide-react';

export function Config() {
  const { theme, nomeApp } = useTheme();
  const [activeTab, setActiveTab] = useState<'geral' | 'credenciais' | 'info'>(
    'geral'
  );

  // Estados do Menu Lateral
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ID do usuário logado (capturado via API)
  const [userId, setUserId] = useState<number | null>(null);

  // Estados dos campos Gerais
  const [appName, setAppName] = useState(nomeApp || '');
  const [appSlogan, setAppSlogan] = useState('Pesquisas de porta em porta');
  const [appPhone, setAppPhone] = useState('98991054292');

  // Estados de Credenciais
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Carrega o título e os dados do usuário logado ao abrir a tela
  useEffect(() => {
    document.title = `Configurações - ${nomeApp || 'Peskisa'}`;

    async function loadAdminData() {
      try {
        const data = await userService.getMe();
        // O backend geralmente retorna o objeto do usuário dentro de 'user' ou direto
        const user = data.user || data;
        if (user && user.id) {
          setUserId(user.id);
          setCurrentEmail(user.email || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast.error('Erro ao identificar o usuário logado.');
      }
    }

    loadAdminData();
  }, [nomeApp]);

  // Salvar Configurações Gerais
  const handleSaveGeral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appPhone || !appSlogan) {
      toast.error('Preencha todos os campos gerais!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nome_app', appName);
      formData.append('slogan_app', appSlogan);
      formData.append('telefone_suporte', appPhone);

      await configService.updateConfig(formData);
      toast.success('Configurações gerais salvas com sucesso!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        err.response?.data?.error || 'Erro ao salvar configurações.';
      toast.error(errorMsg);
    }
  };

  // Atualizar E-mail
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) {
      toast.error('Preencha o novo e-mail e a senha atual!');
      return;
    }

    if (!userId) {
      toast.error('ID do usuário não carregado. Recarregue a página.');
      return;
    }

    try {
      await userService.updateUser(userId, { email: newEmail });
      toast.success('E-mail atualizado com sucesso!');
      setCurrentEmail(newEmail);
      setNewEmail('');
      setEmailPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar e-mail';
      toast.error(errorMsg);
    }
  };

  // Atualizar Senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos de senha!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas novas não coincidem!');
      return;
    }

    if (!userId) {
      toast.error('ID do usuário não carregado. Recarregue a página.');
      return;
    }

    try {
      // Ajuste para o campo 'senha' que o seu banco/modelo espera
      await userService.updateUser(userId, { senha: newPassword });
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg = err.response?.data?.error || 'Erro ao alterar senha';
      toast.error(errorMsg);
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#121214] text-[#e1e1e6]'
          : 'bg-[#f4f4f5] text-[#18181b]'
      }`}
    >
      {/* Container de Alertas Toast */}
      <Toaster position="top-right" reverseOrder={false} />

      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Painel de Monitoramento"
          setMobileMenuOpen={setMobileMenuOpen}
          notificationCount={3}
        />

        <main className="p-6 md:p-8 space-y-6 pb-12 overflow-y-auto">
          {/* Cabeçalho da Página */}
          <div
            className={`p-6 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              theme === 'dark'
                ? 'bg-[#1a1a1e] border-[#29292e]'
                : 'bg-white border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3.5 rounded-xl text-white shadow-md flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Settings size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Configurações do Sistema
                </h1>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  Gerencie as informações gerais, credenciais de acesso e dados
                  do aplicativo.
                </p>
              </div>
            </div>
          </div>

          {/* Sistema de Abas Moderno */}
          <div
            className="flex p-1.5 rounded-xl gap-2 max-w-md border shadow-sm transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1a1a1e' : '#ffffff',
              borderColor: theme === 'dark' ? '#29292e' : '#e4e4e7',
            }}
          >
            <button
              onClick={() => setActiveTab('geral')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'geral'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'geral'
                    ? 'var(--primary-color)'
                    : 'transparent',
              }}
            >
              <Settings size={16} />
              <span>Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('credenciais')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'credenciais'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'credenciais'
                    ? 'var(--primary-color)'
                    : 'transparent',
              }}
            >
              <KeyRound size={16} />
              <span>Credenciais</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'text-white shadow-md'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'info' ? 'var(--primary-color)' : 'transparent',
              }}
            >
              <InfoIcon size={16} />
              <span>Informações</span>
            </button>
          </div>

          {/* CONTEÚDO DA ABA: GERAL */}
          {activeTab === 'geral' && (
            <form onSubmit={handleSaveGeral} className="space-y-6">
              <div
                className={`p-6 md:p-8 rounded-2xl border shadow-lg space-y-6 transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1a1a1e] border-[#29292e]'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <h2 className="text-lg font-semibold border-b pb-4 border-zinc-500/10 flex items-center gap-2">
                  <Type size={20} style={{ color: 'var(--primary-color)' }} />
                  Identidade do Aplicativo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                      Nome do App
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Ex: Vibe Opinião"
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                        theme === 'dark'
                          ? 'bg-[#121214] border-[#29292e] text-white focus:border-zinc-500'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                      Telefone de Contato
                    </label>
                    <input
                      type="text"
                      value={appPhone}
                      onChange={(e) => setAppPhone(e.target.value)}
                      placeholder="(99) 99999-9999"
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                        theme === 'dark'
                          ? 'bg-[#121214] border-[#29292e] text-white focus:border-zinc-500'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                    Slogan do Sistema
                  </label>
                  <input
                    type="text"
                    value={appSlogan}
                    onChange={(e) => setAppSlogan(e.target.value)}
                    placeholder="Ex: Pesquisas de porta em porta"
                    className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                      theme === 'dark'
                        ? 'bg-[#121214] border-[#29292e] text-white focus:border-zinc-500'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-400'
                    }`}
                  />
                </div>
              </div>

              {/* Seção de Imagens / Logos */}
              <div
                className={`p-6 md:p-8 rounded-2xl border shadow-lg space-y-6 transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1a1a1e] border-[#29292e]'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <h2 className="text-lg font-semibold border-b pb-4 border-zinc-500/10 flex items-center gap-2">
                  <Upload size={20} style={{ color: 'var(--primary-color)' }} />
                  Imagens e Identidade Visual
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center justify-between gap-4 transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-center opacity-70">
                      Ícone do App
                    </span>
                    <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center p-2 border-zinc-500/30">
                      <Smartphone size={36} className="opacity-40" />
                    </div>
                    <label
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white text-center cursor-pointer shadow-md transition-all active:scale-95"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      Selecionar Arquivo
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center justify-between gap-4 transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-center opacity-70">
                      Logo Padrão
                    </span>
                    <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center p-2 border-zinc-500/30">
                      <FileText size={36} className="opacity-40" />
                    </div>
                    <label
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white text-center cursor-pointer shadow-md transition-all active:scale-95"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      Selecionar Arquivo
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center justify-between gap-4 transition-all ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-center opacity-70">
                      Logo Horizontal
                    </span>
                    <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center p-2 border-zinc-500/30">
                      <FileText size={36} className="opacity-40" />
                    </div>
                    <label
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white text-center cursor-pointer shadow-md transition-all active:scale-95"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      Selecionar Arquivo
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="py-3.5 px-8 text-white font-medium rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <Save size={18} />
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </form>
          )}

          {/* CONTEÚDO DA ABA: CREDENCIAIS */}
          {activeTab === 'credenciais' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form
                onSubmit={handleUpdateEmail}
                className={`p-6 md:p-8 rounded-2xl border shadow-lg space-y-6 flex flex-col justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1a1a1e] border-[#29292e]'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-4 border-zinc-500/10 flex items-center gap-2">
                    <Mail size={20} style={{ color: 'var(--primary-color)' }} />
                    Alterar E-mail de Acesso
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        E-mail Atual
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentEmail}
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border opacity-75 cursor-not-allowed ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] text-white'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        Novo E-mail
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="novo@email.com"
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] text-white'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="********"
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] text-white'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-3.5 px-4 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <span>Atualizar E-mail</span>
                </button>
              </form>

              <form
                onSubmit={handleUpdatePassword}
                className={`p-6 md:p-8 rounded-2xl border shadow-lg space-y-6 flex flex-col justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1a1a1e] border-[#29292e]'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-4 border-zinc-500/10 flex items-center gap-2">
                    <Lock size={20} style={{ color: 'var(--primary-color)' }} />
                    Alterar Senha de Acesso
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Senha atual"
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] text-white'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha"
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] text-white'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                          theme === 'dark'
                            ? 'bg-[#121214] border-[#29292e] text-white'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-3.5 px-4 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  <span>Atualizar Senha</span>
                </button>
              </form>
            </div>
          )}

          {/* CONTEÚDO DA ABA: INFORMAÇÕES */}
          {activeTab === 'info' && (
            <div
              className={`p-6 md:p-8 rounded-2xl border shadow-lg space-y-6 w-full transition-all ${
                theme === 'dark'
                  ? 'bg-[#1a1a1e] border-[#29292e]'
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3 border-b pb-4 border-zinc-500/10">
                <ShieldCheck
                  size={24}
                  style={{ color: 'var(--primary-color)' }}
                />
                <h2 className="text-lg font-semibold">Detalhes do Sistema</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                <div
                  className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-1">
                    Versão Atual
                  </span>
                  <span className="text-lg font-bold">2.0.1</span>
                </div>

                <div
                  className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#121214] border-[#29292e]' : 'bg-zinc-50 border-zinc-200'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-1">
                    Desenvolvedor
                  </span>
                  <a
                    href="https://kelvynk.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold hover:underline transition-all"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    kelvynk
                  </a>
                </div>
              </div>

              <p
                className={`text-xs text-left pt-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                Todos os direitos reservados • {nomeApp || 'Peskisa'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
