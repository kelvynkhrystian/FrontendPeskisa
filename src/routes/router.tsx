import { createBrowserRouter } from 'react-router-dom';

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
// import { PesquisasUser } from '../pages/PesquisasUser'
// import { Sincronizar } from '../pages/Sincronizar'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/admin/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/user/dashboard',
    element: <DashboardUser />,
  },
  {
    path: '/admin/config',
    element: <Config />,
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

  /* --- ROTAS FUTURAS (Descomente quando for usar) ---
  
  {
    path: '/user/config',
    element: <ConfigUser />,
  },
  {
    path: '/admin/pesquisas',
    element: <Pesquisas />,
  },
  {
    path: '/user/pesquisas',
    element: <PesquisasUser />,
  },
  {
    path: '/sincronizar',
    element: <Sincronizar />,
  },

  -------------------------------------------------- */

  {
    path: '*',
    element: <NotFound />,
  },
]);
