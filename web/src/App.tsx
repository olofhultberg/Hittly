import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/pages/Login';
import DashboardPage from './pages/pages/Dashboard';
import SpacesPage from './pages/pages/Spaces';
import BoxesPage from './pages/pages/Boxes';
import ItemsPage from './pages/pages/Items';
import { Topbar } from './components/components/TopBar';
import { SideBar } from './components/components/SideBar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-slate-600">Laddar...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <div className="flex">
        <SideBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/spaces"
        element={
          <ProtectedRoute>
            <Layout>
              <SpacesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/boxes"
        element={
          <ProtectedRoute>
            <Layout>
              <BoxesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <Layout>
              <ItemsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


