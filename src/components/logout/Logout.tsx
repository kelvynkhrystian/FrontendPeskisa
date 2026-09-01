import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  sidebarOpen?: boolean;
  className?: string;
}

export function LogoutButton({
  sidebarOpen = true,
  className,
}: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove tokens específicos salvos no navegador (ex: 'token', 'user', etc.)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // 2. Limpa completamente qualquer resíduo restante no storage
    localStorage.clear();
    sessionStorage.clear();

    // 3. Redireciona para a tela de login/home com segurança
    navigate('/', { replace: true });
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
