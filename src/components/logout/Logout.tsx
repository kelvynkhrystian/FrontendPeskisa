import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LogoutButtonProps {
  sidebarOpen?: boolean;
  className?: string;
}

export function LogoutButton({
  sidebarOpen = true,
  className,
}: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      // Chama o backend para limpar o cookie HTTP-only
      await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Erro ao deslogar no servidor:', error);
    } finally {
      // Limpa qualquer resíduo local
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Sessão encerrada com sucesso.');
      // Redireciona para o login
      navigate('/', { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer'
      }
    >
      <LogOut size={20} className="shrink-0" />
      {sidebarOpen && <span>Sair</span>}
    </button>
  );
}
