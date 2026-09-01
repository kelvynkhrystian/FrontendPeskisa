import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

interface ProtectedRouteProps {
  requireAdmin?: boolean; // Se true, exige que seja admin além de estar logado
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await userService.getMe();
        const user = data.user || data;

        if (user && user.id) {
          setIsAuthenticated(true);
          // Verifica se o role do usuário é admin
          if (user.role === 'admin') {
            setIsAdmin(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Enquanto valida a sessão via API, exibe um loader limpo
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121214] text-white">
        Carregando...
      </div>
    );
  }

  // Se não estiver logado, redireciona para a tela de login (raiz '/')
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se a rota exige admin e o usuário não for admin, manda para o painel de usuário comum
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  // Se passou pelas validações, renderiza a página protegida
  return <Outlet />;
}
