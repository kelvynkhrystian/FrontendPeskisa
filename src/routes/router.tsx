import { createBrowserRouter } from 'react-router-dom';

// Páginas ativas
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import { DashboardUser } from '../pages/user/DashboardUser';

// Outras páginas (comentadas por enquanto)
// import { Config } from '../pages/Config'
// import { ConfigUser } from '../pages/ConfigUser'
import { NotFound } from '../pages/NotFound';
// import { Pesquisas } from '../pages/Pesquisas'
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

  /* --- ROTAS FUTURAS (Descomente quando for usar) ---
  {
    path: '/admin/config',
    element: <Config />,
  },
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
