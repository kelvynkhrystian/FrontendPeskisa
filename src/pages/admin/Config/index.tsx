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

  // Estados do Menu Lateral (Sidebar / Mobile)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ID do usuário logado (capturado via API de perfil)
  const [userId, setUserId] = useState<number | null>(null);

  // Estados dos campos Gerais da aplicação
  const [appName, setAppName] = useState(nomeApp || 'Peskisa');
  const [appSlogan, setAppSlogan] = useState('Pesquisas de porta em porta');
  const [appPhone, setAppPhone] = useState('98991054292');

  // Estados de Imagens (Arquivos novos selecionados e URLs vindas do DB)
  const [iconeFile, setIconeFile] = useState<File | null>(null);
  const [logoPadraoFile, setLogoPadraoFile] = useState<File | null>(null);
  const [logoHorizontalFile, setLogoHorizontalFile] = useState<File | null>(
    null
  );

  const [iconeUrl, setIconeUrl] = useState<string | null>(null);
  const [logoPadraoUrl, setLogoPadraoUrl] = useState<string | null>(null);
  const [logoHorizontalUrl, setLogoHorizontalUrl] = useState<string | null>(
    null
  );

  // Estados de Credenciais (E-mail e Senha)
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState(''); // Senha atual para confirmar alteração de e-mail

  const [currentPassword, setCurrentPassword] = useState(''); // Senha atual para bcrypt
  const [newPassword, setNewPassword] = useState(''); // Nova senha
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmação da nova senha

  // 1. Carrega dados do usuário logado e as configurações salvas no banco ao abrir a página
  useEffect(() => {
    document.title = `Configurações - ${nomeApp || 'Peskisa'}`;

    // Busca dados do usuário admin autenticado
    async function loadAdminData() {
      try {
        const data = await userService.getMe();
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

    // Busca as configurações gerais do sistema
    async function loadSystemConfig() {
      try {
        const data = await configService.getConfig();
        const config = data.config || data;
        if (config) {
          if (config.nome_app) setAppName(config.nome_app);
          if (config.slogan_app) setAppSlogan(config.slogan_app);
          if (config.telefone_suporte) setAppPhone(config.telefone_suporte);
          if (config.icone) setIconeUrl(config.icone);
          if (config.logo_padrao) setLogoPadraoUrl(config.logo_padrao);
          if (config.logo_horizontal)
            setLogoHorizontalUrl(config.logo_horizontal);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do sistema:', error);
      }
    }

    loadAdminData();
    loadSystemConfig();
  }, [nomeApp]);

  // Função auxiliar para montar a URL correta das imagens vindas do backend
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('blob:')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Manipulador de seleção de arquivos de imagem com preview instantâneo
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'icone' | 'padrao' | 'horizontal'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      if (type === 'icone') {
        setIconeFile(file);
        setIconeUrl(previewUrl);
      } else if (type === 'padrao') {
        setLogoPadraoFile(file);
        setLogoPadraoUrl(previewUrl);
      } else if (type === 'horizontal') {
        setLogoHorizontalFile(file);
        setLogoHorizontalUrl(previewUrl);
      }
      toast.success('Imagem selecionada com sucesso!');
    }
  };

  // 2. Salvar Configurações Gerais e Envio de Imagens via FormData
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

      if (iconeFile) formData.append('icone', iconeFile);
      if (logoPadraoFile) formData.append('logo_padrao', logoPadraoFile);
      if (logoHorizontalFile)
        formData.append('logo_horizontal', logoHorizontalFile);

      await configService.updateConfig(formData);
      toast.success('Configurações gerais salvas com sucesso!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        err.response?.data?.error || 'Erro ao salvar configurações.';
      toast.error(errorMsg);
    }
  };

  // 3. Função para Atualizar E-mail (Enviando a senha atual para validação de segurança no backend)
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
      // Enviando o novo e-mail e a senha atual para o backend verificar via bcrypt/token
      await userService.updateUser(userId, {
        email: newEmail,
        senha_atual: emailPassword, // Campo validado no backend
      });

      toast.success('E-mail atualizado com sucesso!');
      setCurrentEmail(newEmail);
      setNewEmail('');
      setEmailPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        err.response?.data?.error ||
        'Erro ao atualizar e-mail. Verifique sua senha atual.';
      toast.error(errorMsg);
    }
  };

  // 4. Função para Atualizar Senha (Enviando senha atual e nova senha para validação via bcrypt)
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
      // Enviando a senha atual (para o bcrypt conferir) e a nova senha
      await userService.updateUser(userId, {
        senha_atual: currentPassword,
        senha: newPassword,
      });

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        err.response?.data?.error ||
        'Erro ao alterar senha. Verifique se a senha atual está correta.';
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

          {/* ABA: GERAL */}
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
                      placeholder="Ex: Peskisa"
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border ${
                        theme === 'dark'
                          ? 'bg-[#121214] border-[#29292e] text-white focus:border-zinc-500'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide uppercase opacity-80">
                      Telefone de Contato (WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={appPhone}
                      onChange={(e) => setAppPhone(e.target.value)}
                      placeholder="98991054292"
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

              {/* Seção de Imagens e Logos */}
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
                  {/* Ícone do App */}
                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center justify-between gap-4 transition-all ${
                      theme === 'dark'
                        ? 'bg-[#121214] border-[#29292e]'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                        Ícone do App
                      </span>
                      <span className="text-[10px] opacity-50 block">
                        Recomendado: 512x512px (Máx. 2MB)
                      </span>
                    </div>

                    <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center p-2 border-zinc-500/30 overflow-hidden bg-black/20">
                      {iconeUrl ? (
                        <img
                          src={getImageUrl(iconeUrl) || ''}
                          alt="Ícone"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Smartphone size={36} className="opacity-40" />
                      )}
                    </div>

                    <div className="w-full space-y-2">
                      <span className="text-[10px] opacity-50 text-center block">
                        PNG, JPG, JPEG ou WebP
                      </span>
                      <label
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white text-center cursor-pointer shadow-md transition-all active:scale-95 block"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        Selecionar Arquivo
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'icone')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Logo Padrão */}
                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center justify-between gap-4 transition-all ${
                      theme === 'dark'
                        ? 'bg-[#121214] border-[#29292e]'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                        Logo Padrão
                      </span>
                      <span className="text-[10px] opacity-50 block">
                        Recomendado: 400x400px (Máx. 2MB)
                      </span>
                    </div>

                    <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center p-2 border-zinc-500/30 overflow-hidden bg-black/20">
                      {logoPadraoUrl ? (
                        <img
                          src={getImageUrl(logoPadraoUrl) || ''}
                          alt="Logo Padrão"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FileText size={36} className="opacity-40" />
                      )}
                    </div>

                    <div className="w-full space-y-2">
                      <span className="text-[10px] opacity-50 text-center block">
                        PNG, JPG, JPEG ou WebP
                      </span>
                      <label
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white text-center cursor-pointer shadow-md transition-all active:scale-95 block"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        Selecionar Arquivo
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'padrao')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Logo Horizontal */}
                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center justify-between gap-4 transition-all ${
                      theme === 'dark'
                        ? 'bg-[#121214] border-[#29292e]'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                        Logo Horizontal
                      </span>
                      <span className="text-[10px] opacity-50 block">
                        Recomendado: 600x200px (Máx. 2MB)
                      </span>
                    </div>

                    <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center p-2 border-zinc-500/30 overflow-hidden bg-black/20">
                      {logoHorizontalUrl ? (
                        <img
                          src={getImageUrl(logoHorizontalUrl) || ''}
                          alt="Logo Horizontal"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FileText size={36} className="opacity-40" />
                      )}
                    </div>

                    <div className="w-full space-y-2">
                      <span className="text-[10px] opacity-50 text-center block">
                        PNG, JPG, JPEG ou WebP
                      </span>
                      <label
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white text-center cursor-pointer shadow-md transition-all active:scale-95 block"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        Selecionar Arquivo
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'horizontal')}
                        />
                      </label>
                    </div>
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

          {/* ABA: CREDENCIAIS */}
          {activeTab === 'credenciais' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulário de E-mail */}
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
                        Senha Atual (Obrigatório para segurança)
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

              {/* Formulário de Senha */}
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

          {/* ABA: INFORMAÇÕES */}
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
                  <span className="text-lg font-bold">1.0</span>
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
                Todos os direitos reservados • {appName || 'Peskisa'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
