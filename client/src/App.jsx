import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OwnStock from './pages/OwnStock';
import ProviderAccounts from './pages/ProviderAccounts';
import ProfileSales from './pages/ProfileSales';
import FullAccountSales from './pages/FullAccountSales';
import Asistente from './pages/Asistente';
import Layout from './components/Layout';

const PAGES = {
  dashboard: Dashboard,
  'own-stock': OwnStock,
  'provider-accounts': ProviderAccounts,
  'profile-sales': ProfileSales,
  'full-account-sales': FullAccountSales,
  asistente: Asistente,
};

export default function App() {
  const { isAuth, login, logout } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!isAuth) return <Login onLogin={login} />;

  const PageComponent = PAGES[page] || Dashboard;

  return (
    <Layout page={page} setPage={setPage} onLogout={logout}>
      <PageComponent />
    </Layout>
  );
}
