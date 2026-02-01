import { createBrowserRouter } from 'react-router-dom';
import MasterAdmin from './pages/MasterAdmin';
import MasterAdminLogin from './pages/MasterAdminLogin';
import Admin from './pages/Admin';
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <ClientLoginPage />,
  },
  {
    path: '/admin/login',
    element: <MasterAdminLogin />,
  },
  {
    path: '/admin',
    element: <MasterAdmin />,
  },
  {
    path: '/client-admin',
    element: <Admin />,
  },
  {
    path: '/panel',
    // Renderiza el sitio del cliente usando el contexto de autenticación
    element: <App />,
  },
  {
    path: '/invitacion/:subdomain',
    // Ruta para previsualización o acceso directo vía URL
    element: <App />,
  },
]);
