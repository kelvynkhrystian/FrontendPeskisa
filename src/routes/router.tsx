import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Páginas Públicas
import { Login } from '../pages/Login';
import { NotFound } from '../pages/NotFound';

// Páginas Admin
import { Dashboard } from '../pages/admin/Dashboard';
import { Pesquisas } from '../pages/admin/Pesquisas';
import { Relatorio } from '../pages/admin/Relatorio';
import { Equipes } from '../pages/admin/Equipes';
import { Config } from '../pages/admin/Config';

// Páginas User
import { DashboardUser } from '../pages/user/DashboardUser';
import { ConfigUser } from '../pages/user/ConfigUser';
// import { PesquisasUser } from '../pages/PesquisasUser';
// import { Envios } from '../pages/Envios';

export const router = createBrowserRouter([
  // 🔓 Rota Pública
  {
    path: '/',
    element: <Login />,
  },

  // 👤 ROTAS DO USUÁRIO COMUM (Exige apenas estar logado)
  {
    element: <ProtectedRoute requireAdmin={false} />,
    children: [
      {
        path: '/user/dashboard',
        element: <DashboardUser />,
      },
      {
        path: '/user/config',
        element: <ConfigUser />,
      },
      /* --- ROTAS FUTURAS DE USER (Descomente quando criar) ---
      {
        path: '/user/pesquisas',
        element: <PesquisasUser />,
      },
      {
        path: '/envios',
        element: <Envios />,
      },
      ------------------------------------------------------- */
    ],
  },

  // 🛡️ ROTAS DO ADMINISTRADOR (Exige estar logado E ser Admin)
  {
    element: <ProtectedRoute requireAdmin={true} />,
    children: [
      {
        path: '/admin/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/admin/pesquisas',
        element: <Pesquisas />,
      },
      {
        path: '/admin/relatorios',
        element: <Relatorio />,
      },
      {
        path: '/admin/equipes',
        element: <Equipes />,
      },
      {
        path: '/admin/config',
        element: <Config />,
      },
    ],
  },

  // 🚫 Rota 404 (Qualquer URL não mapeada cai aqui)
  {
    path: '*',
    element: <NotFound />,
  },
]);
